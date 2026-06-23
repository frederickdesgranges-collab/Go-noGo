/* =====================================================================
 *  app.js — Point d'entrée. Relie l'interface, le moteur du minuteur,
 *  les bips et le contrôle Spotify.
 * ===================================================================== */

(() => {
  "use strict";

  /* ---------- Petits raccourcis DOM ---------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const PHASES = ["warmup", "work", "rest", "cooldown"];

  /* État runtime (non sauvegardé). */
  let wakeLock = null;
  let nowPlayingTimer = null;
  let userPlaylists = [];     // [{uri,id,name}]
  let textColorOverride = {}; // ex: { work: "#000" } sinon auto
  let pendingPlaylists = null; // playlists d'un préréglage à (ré)appliquer
  let persistTimer = null;     // anti-rebond pour la sauvegarde auto

  /* Sauvegarde automatique de la configuration courante (anti-rebond). */
  function persistLast() {
    try { Presets.saveLast(getConfig()); } catch {}
  }
  function persistSoon() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(persistLast, 400);
  }

  /* =================================================================
   *  BANNIÈRE DE MESSAGES (erreurs / infos en français)
   * ================================================================= */
  let bannerTimer = null;
  function banner(msg, type = "info", persist = false) {
    const el = $("#banner");
    $("#banner-text").textContent = msg;
    el.className = "banner banner-" + type;
    el.hidden = false;
    clearTimeout(bannerTimer);
    if (!persist) bannerTimer = setTimeout(() => { el.hidden = true; }, 6000);
  }
  $("#banner-close").addEventListener("click", () => { $("#banner").hidden = true; });

  /* Traduit un code d'erreur Player en message clair. */
  function explainPlayerError(res) {
    if (!res) return;
    switch (res.errorCode) {
      case "NO_ACTIVE_DEVICE":
        banner("Aucun appareil actif. Ouvre Spotify, lance une chanson 2 secondes, " +
               "puis reviens, choisis ton appareil et appuie sur « Activer cet appareil ».", "error", true);
        break;
      case "PREMIUM_REQUIRED":
        banner("Le contrôle de lecture nécessite un compte Spotify Premium.", "error", true);
        break;
      case "FORBIDDEN":
        banner("Spotify a refusé la commande (403). Vérifie qu'une chanson a déjà été lancée " +
               "sur l'appareil, puis réessaie.", "error", true);
        break;
      case "RATE_LIMIT":
        banner("Trop de requêtes envoyées à Spotify. Patiente quelques secondes.", "error");
        break;
      case "AUTH":
        banner("Session Spotify expirée. Reconnecte-toi.", "error", true);
        break;
      case "NETWORK":
        banner("Problème réseau avec Spotify.", "error");
        break;
      default:
        if (res.message) banner("Spotify : " + res.message, "error");
    }
  }

  /* =================================================================
   *  COULEUR DE TEXTE AUTOMATIQUE selon le contraste
   * ================================================================= */
  function contrastColor(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    // Luminance relative (perçue). Seuil ~0.55.
    const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return L > 0.55 ? "#000000" : "#ffffff";
  }

  /* =================================================================
   *  LECTURE / ÉCRITURE DE LA CONFIG depuis les champs du formulaire
   * ================================================================= */
  function clampInt(v, min, max, dflt) {
    let n = parseInt(v, 10);
    if (isNaN(n)) n = dflt;
    return Math.max(min, Math.min(max, n));
  }

  function getConfig() {
    const phaseCfg = (p, hasToggle) => ({
      enabled: hasToggle ? $(`#${p}-enabled`).checked : true,
      min: clampInt($(`#${p}-min`).value, 0, 99, 0),
      sec: clampInt($(`#${p}-sec`).value, 0, 59, 0),
      color: $(`#${p}-color`).value,
      textOverride: textColorOverride[p] || null,
      playlist: getPlaylistRef(p),
    });

    return {
      warmup: phaseCfg("warmup", true),
      work: phaseCfg("work", false),
      rest: phaseCfg("rest", false),
      cooldown: phaseCfg("cooldown", true),
      series: clampInt($("#series-count").value, 1, 99, 1),
      order: ($('input[name="track-order"]:checked') || {}).value || "sequential",
      beeps: $("#beeps-enabled").checked,
      // Saut d'intro : nombre de secondes, ou 0 si désactivé.
      skipIntroSec: $("#skip-intro-enabled").checked
        ? clampInt($("#skip-intro-sec").value, 1, 180, 15) : 0,
    };
  }

  function setConfig(cfg) {
    PHASES.forEach((p) => {
      if (!cfg[p]) return;
      if ($(`#${p}-enabled`)) $(`#${p}-enabled`).checked = !!cfg[p].enabled;
      $(`#${p}-min`).value = cfg[p].min;
      $(`#${p}-sec`).value = cfg[p].sec;
      $(`#${p}-color`).value = cfg[p].color || DEFAULT_COLORS[p];
      textColorOverride[p] = cfg[p].textOverride || null;
    });
    // Playlists : on mémorise les références voulues et on les applique.
    // (Réappliquées aussi après le chargement des playlists Spotify, qui est
    //  asynchrone — sinon la sélection serait perdue.)
    pendingPlaylists = {};
    PHASES.forEach((p) => { if (cfg[p]) pendingPlaylists[p] = cfg[p].playlist || ""; });
    applyPendingPlaylists();

    $("#series-count").value = cfg.series || 8;
    $("#beeps-enabled").checked = cfg.beeps !== false;
    $("#skip-intro-enabled").checked = (cfg.skipIntroSec || 0) > 0;
    if (cfg.skipIntroSec) $("#skip-intro-sec").value = cfg.skipIntroSec;
    const orderEl = $(`input[name="track-order"][value="${cfg.order || "sequential"}"]`);
    if (orderEl) orderEl.checked = true;
    updateSummary();
  }

  /** Applique les playlists mémorisées (pendingPlaylists) aux champs :
   *  sélectionne la playlist dans la liste si elle en fait partie,
   *  sinon remet la référence (lien/URI) dans le champ « coller ». */
  function applyPendingPlaylists() {
    if (!pendingPlaylists) return;
    PHASES.forEach((p) => {
      const ref = pendingPlaylists[p];
      if (!ref) return;
      const sel = $(`.playlist-select[data-phase="${p}"]`);
      const paste = $(`.playlist-paste[data-phase="${p}"]`);
      const match = userPlaylists.find((pl) =>
        pl.uri === ref || pl.id === SpotifyPlayer.parsePlaylistId(ref));
      if (match) { sel.value = match.uri; paste.value = ""; }
      else { sel.value = ""; paste.value = ref; }
    });
  }

  /** Référence de playlist effective d'une phase (collée OU sélectionnée OU défaut). */
  function getPlaylistRef(phase) {
    const paste = $(`.playlist-paste[data-phase="${phase}"]`).value.trim();
    if (paste) return paste;
    const sel = $(`.playlist-select[data-phase="${phase}"]`).value;
    if (sel) return sel;
    // Valeurs par défaut : échauffement = travail, retour au calme = repos.
    if (phase === "warmup") return getPlaylistRef("work");
    if (phase === "cooldown") return getPlaylistRef("rest");
    return null;
  }

  /* =================================================================
   *  VALIDATION + RÉSUMÉ DE SÉANCE
   * ================================================================= */
  function validate(cfg) {
    const dur = (p) => p.min * 60 + p.sec;
    if (dur(cfg.work) <= 0) return "La phase « Travail » doit durer au moins 1 seconde.";
    if (cfg.series < 1) return "Il faut au moins 1 série.";
    if (cfg.rest && dur(cfg.rest) < 0) return "Durée de repos invalide.";
    return null;
  }

  function fmt(total) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function updateSummary() {
    const cfg = getConfig();
    TimerEngine.build(cfg);
    const total = TimerEngine.totalDuration();
    $("#session-summary").textContent =
      `Séance : ${TimerEngine.sequence.length} phase(s) · durée totale ${fmt(total)}`;
  }

  /* =================================================================
   *  ÉCRAN DE SÉANCE — affichage
   * ================================================================= */
  function applyPhaseVisual(phase) {
    const color = $(`#${phase.type}-color`).value;
    const txt = textColorOverride[phase.type] || contrastColor(color);
    const screen = $("#run-screen");
    screen.style.backgroundColor = color;
    screen.style.color = txt;
    document.querySelector('meta[name="theme-color"]').setAttribute("content", color);

    $("#run-phase-name").textContent = PHASE_LABELS[phase.type];
    if (phase.type === "work" || phase.type === "rest") {
      $("#run-series").textContent = `Série ${phase.seriesIndex} / ${phase.seriesTotal}`;
      $("#run-series").style.visibility = "visible";
    } else {
      $("#run-series").style.visibility = "hidden";
    }
  }

  function renderCountdown(sec) {
    $("#run-countdown").textContent = fmt(sec);
  }

  /* =================================================================
   *  WAKE LOCK — garder l'écran allumé
   * ================================================================= */
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        wakeLock = await navigator.wakeLock.request("screen");
        wakeLock.addEventListener("release", () => {});
      }
    } catch { /* repli silencieux : non supporté ou refusé */ }
  }
  function releaseWakeLock() {
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
  }
  // Re-demande le wake lock quand l'onglet redevient visible.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && TimerEngine.isRunning()) requestWakeLock();
  });

  /* =================================================================
   *  CONTRÔLE MUSIQUE par phase
   * ================================================================= */
  let musicActive = false; // Spotify connecté ET appareil prêt

  async function onPhaseMusic(phase) {
    if (!musicActive) return;
    // Échauffement/retour au calme : utilisent par défaut la file travail/repos.
    let queueType = phase.type;
    const res = await SpotifyPlayer.playNextInPhase(queueType);
    if (res && res.played) {
      updateTrackDisplay(res.played.title, res.played.artist);
    }
    if (res && res.res && !res.res.ok) explainPlayerError(res.res);
  }

  function updateTrackDisplay(title, artist) {
    $("#track-title").textContent = title || "—";
    $("#track-artist").textContent = artist || "";
  }

  /* Sondage « chanson en cours » à intervalle raisonnable. */
  function startNowPlayingPoll() {
    stopNowPlayingPoll();
    if (!musicActive) return;
    nowPlayingTimer = setInterval(async () => {
      const np = await SpotifyPlayer.currentlyPlaying();
      if (np) updateTrackDisplay(np.title, np.artist);
    }, NOW_PLAYING_POLL_MS);
  }
  function stopNowPlayingPoll() {
    clearInterval(nowPlayingTimer);
    nowPlayingTimer = null;
  }

  /* =================================================================
   *  MOTEUR DU MINUTEUR — branchement des callbacks
   * ================================================================= */
  TimerEngine.on({
    onTick: (sec) => renderCountdown(sec),
    onPhaseEnter: (phase) => {
      applyPhaseVisual(phase);
      onPhaseMusic(phase); // lance la playlist / piste suivante
    },
    onCountdownBeep: () => Beeper.beepCountdown(),
    onPhaseChangeBeep: () => Beeper.beepPhaseChange(),
    onFinish: async () => {
      banner("Séance terminée ! 💪", "info");
      $("#btn-pause").textContent = "⏸";
      if (musicActive) { const r = await SpotifyPlayer.pause(); if (!r.ok) explainPlayerError(r); }
      endRunScreen();
    },
  });

  /* =================================================================
   *  DÉMARRAGE / FIN DE SÉANCE (UI)
   * ================================================================= */
  async function startSession() {
    const cfg = getConfig();
    const err = validate(cfg);
    if (err) { banner(err, "error"); return; }

    Beeper.unlock();            // autorise l'audio (geste utilisateur)
    Beeper.setEnabled(cfg.beeps);
    SpotifyPlayer.setSeekStart(cfg.skipIntroSec); // saut d'intro des chansons
    TimerEngine.build(cfg);

    // Prépare les files de pistes par phase si Spotify est prêt.
    musicActive = SpotifyAuth.isConnected() && !!SpotifyPlayer.getDevice();
    if (SpotifyAuth.isConnected() && !SpotifyPlayer.getDevice()) {
      banner("Astuce : choisis un appareil de lecture dans la section Spotify pour la musique.", "info");
    }
    if (musicActive) {
      try {
        await Promise.all(PHASES.map((p) =>
          SpotifyPlayer.prepareQueue(p, getPlaylistRef(p), cfg.order)
        ));
      } catch { /* la musique restera silencieuse, le minuteur continue */ }
    }

    // Bascule vers l'écran de séance.
    $("#config-screen").hidden = true;
    $("#run-screen").hidden = false;
    requestWakeLock();
    startNowPlayingPoll();

    TimerEngine.start();
    $("#btn-pause").textContent = "⏸";
  }

  function endRunScreen() {
    TimerEngine.stop();
    releaseWakeLock();
    stopNowPlayingPoll();
    $("#run-screen").hidden = true;
    $("#config-screen").hidden = false;
    document.querySelector('meta[name="theme-color"]').setAttribute("content", "#0c1018");
  }

  async function exitSession() {
    if (musicActive) await SpotifyPlayer.pause();
    endRunScreen();
  }

  /* ---------- Contrôles de l'écran de séance ---------- */
  $("#btn-pause").addEventListener("click", async () => {
    if (TimerEngine.isRunning()) {
      TimerEngine.pause();
      $("#btn-pause").textContent = "▶";
      if (musicActive) { const r = await SpotifyPlayer.pause(); if (!r.ok) explainPlayerError(r); }
    } else {
      TimerEngine.resume();
      $("#btn-pause").textContent = "⏸";
      if (musicActive) { const r = await SpotifyPlayer.resume(); if (!r.ok) explainPlayerError(r); }
    }
  });

  $("#btn-skip").addEventListener("click", () => TimerEngine.skip());

  $("#btn-reset").addEventListener("click", () => {
    SpotifyPlayer.resetQueues();
    TimerEngine.stop();
    TimerEngine.start();
    $("#btn-pause").textContent = "⏸";
  });

  $("#btn-exit").addEventListener("click", exitSession);

  /* Flèches piste précédente / suivante. */
  $("#btn-next-track").addEventListener("click", async () => {
    if (!musicActive) return;
    const r = await SpotifyPlayer.nextTrack();
    if (!r.ok) { explainPlayerError(r); return; }
    setTimeout(refreshNowPlaying, 600); // maj immédiate après le saut
  });
  $("#btn-prev-track").addEventListener("click", async () => {
    if (!musicActive) return;
    const r = await SpotifyPlayer.previousTrack();
    if (!r.ok) { explainPlayerError(r); return; }
    setTimeout(refreshNowPlaying, 600);
  });
  async function refreshNowPlaying() {
    const np = await SpotifyPlayer.currentlyPlaying();
    if (np) updateTrackDisplay(np.title, np.artist);
  }

  /* =================================================================
   *  SPOTIFY — connexion / appareils / playlists (écran config)
   * ================================================================= */
  async function refreshSpotifyUI() {
    const connected = SpotifyAuth.isConnected();
    $("#spotify-disconnected").hidden = connected;
    $("#spotify-connected").hidden = !connected;
    if (!connected) return;

    const profile = await SpotifyPlayer.getProfile();
    if (profile) {
      $("#spotify-user-name").textContent = profile.display_name ? "· " + profile.display_name : "";
      if (profile.product && profile.product !== "premium") {
        banner("Ton compte Spotify n'est pas Premium : le contrôle de lecture ne fonctionnera pas.", "error", true);
      }
    }
    await loadDevices();
    await loadPlaylists();
  }

  async function loadDevices() {
    const devices = await SpotifyPlayer.getDevices();
    const sel = $("#device-select");
    sel.innerHTML = "";
    if (!devices.length) {
      const opt = document.createElement("option");
      opt.value = ""; opt.textContent = "— aucun appareil détecté —";
      sel.appendChild(opt);
    } else {
      devices.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = d.name + (d.is_active ? " (actif)" : "") + " · " + d.type;
        if (d.is_active) opt.selected = true;
        sel.appendChild(opt);
      });
      // Mémorise l'appareil actif ou le premier.
      const active = devices.find((d) => d.is_active) || devices[0];
      SpotifyPlayer.setDevice(active.id);
    }
  }

  async function loadPlaylists() {
    userPlaylists = await SpotifyPlayer.getMyPlaylists();
    $$(".playlist-select").forEach((sel) => {
      const current = sel.value;
      sel.innerHTML = '<option value="">— choisir une playlist —</option>';
      userPlaylists.forEach((pl) => {
        const opt = document.createElement("option");
        opt.value = pl.uri;
        opt.textContent = pl.name;
        sel.appendChild(opt);
      });
      if (current) sel.value = current;
    });
    // Réapplique une éventuelle sélection issue d'un préréglage / dernière config
    // (les playlists arrivent de façon asynchrone après le chargement de la page).
    applyPendingPlaylists();
  }

  /* Boutons Spotify. */
  $("#btn-connect").addEventListener("click", async () => {
    try { await SpotifyAuth.login(); }
    catch (e) { banner(e.message, "error", true); }
  });
  $("#btn-disconnect").addEventListener("click", () => {
    SpotifyAuth.clear();
    refreshSpotifyUI();
    banner("Déconnecté de Spotify.", "info");
  });
  $("#btn-refresh-devices").addEventListener("click", loadDevices);
  $("#btn-reload-playlists").addEventListener("click", loadPlaylists);

  $("#device-select").addEventListener("change", (e) => {
    if (e.target.value) SpotifyPlayer.setDevice(e.target.value);
  });

  $("#btn-wake-spotify").addEventListener("click", async () => {
    const id = $("#device-select").value;
    if (!id) { banner("Choisis d'abord un appareil. Si la liste est vide, lance une chanson dans Spotify puis appuie sur ↻.", "error"); return; }
    const r = await SpotifyPlayer.transferTo(id, false);
    if (r.ok) banner("Appareil activé. Tu peux démarrer la séance.", "info");
    else explainPlayerError(r);
  });

  $("#volume-slider").addEventListener("change", async (e) => {
    if (!SpotifyAuth.isConnected()) return;
    const r = await SpotifyPlayer.setVolume(e.target.value);
    if (!r.ok && r.errorCode !== "NO_ACTIVE_DEVICE") explainPlayerError(r);
  });

  /* =================================================================
   *  COULEURS — clic long sur le sélecteur pour forcer texte noir/blanc ?
   *  Simplifié : un double-clic sur la pastille bascule l'override de texte.
   * ================================================================= */
  PHASES.forEach((p) => {
    const colorEl = $(`#${p}-color`);
    colorEl.addEventListener("dblclick", () => {
      // Cycle : auto -> blanc -> noir -> auto
      const cur = textColorOverride[p];
      textColorOverride[p] = cur == null ? "#ffffff" : cur === "#ffffff" ? "#000000" : null;
      banner(`Texte ${PHASE_LABELS[p]} : ${textColorOverride[p] ? (textColorOverride[p] === "#ffffff" ? "blanc" : "noir") + " (manuel)" : "automatique"}.`, "info");
    });
    colorEl.addEventListener("change", updateSummary);
  });

  /* =================================================================
   *  PRÉRÉGLAGES
   * ================================================================= */
  function refreshPresetList() {
    const sel = $("#preset-select");
    sel.innerHTML = "";
    const names = Presets.names();
    if (!names.length) {
      sel.innerHTML = '<option value="">— aucun préréglage —</option>';
      return;
    }
    names.forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n; opt.textContent = n;
      sel.appendChild(opt);
    });
  }

  $("#btn-save-preset").addEventListener("click", () => {
    try {
      const name = $("#preset-name").value;
      Presets.save(name, getConfig());
      $("#preset-name").value = "";
      refreshPresetList();
      banner("Préréglage enregistré.", "info");
    } catch (e) { banner(e.message, "error"); }
  });
  $("#btn-load-preset").addEventListener("click", () => {
    const name = $("#preset-select").value;
    const cfg = Presets.load(name);
    if (cfg) { setConfig(cfg); persistLast(); banner("Préréglage chargé : " + name, "info"); }
  });
  $("#btn-delete-preset").addEventListener("click", () => {
    const name = $("#preset-select").value;
    if (!name) return;
    Presets.remove(name);
    refreshPresetList();
    banner("Préréglage supprimé.", "info");
  });

  /* =================================================================
   *  DÉMARRER + recalcul du résumé à chaque modification
   * ================================================================= */
  $("#btn-start").addEventListener("click", startSession);
  ["warmup", "work", "rest", "cooldown"].forEach((p) => {
    ["min", "sec"].forEach((u) => $(`#${p}-${u}`).addEventListener("input", updateSummary));
  });
  ["#series-count", "#warmup-enabled", "#cooldown-enabled"].forEach((s) =>
    $(s).addEventListener("input", updateSummary)
  );

  // Sauvegarde automatique de TOUTE modification de la config (durées,
  // séries, couleurs, options, playlists…) pour la retrouver à la réouverture.
  $("#config-screen").addEventListener("input", persistSoon);
  $("#config-screen").addEventListener("change", persistSoon);

  // Si l'utilisateur change une playlist à la main, on oublie la sélection
  // mémorisée (sinon elle serait réappliquée par-dessus son choix).
  $$(".playlist-select, .playlist-paste").forEach((el) => {
    el.addEventListener("change", () => { pendingPlaylists = null; });
    el.addEventListener("input", () => { pendingPlaylists = null; });
  });

  /* =================================================================
   *  INITIALISATION
   * ================================================================= */
  async function init() {
    // Couleurs par défaut dans les sélecteurs.
    PHASES.forEach((p) => { $(`#${p}-color`).value = DEFAULT_COLORS[p]; });
    // Échauffement/retour au calme désactivés par défaut (optionnels).
    $("#warmup-enabled").checked = true;
    $("#cooldown-enabled").checked = true;

    refreshPresetList();
    updateSummary();

    // Traite un éventuel retour de redirection OAuth.
    const r = await SpotifyAuth.handleRedirect();
    if (r.error) banner(r.error, "error", true);

    await refreshSpotifyUI();

    // Restaure automatiquement la dernière configuration utilisée
    // (durées, séries, couleurs, options ET playlists). Rien à reconfigurer.
    const last = Presets.loadLast();
    if (last) setConfig(last);

    // Avertit si le Client ID n'est pas configuré.
    if (SPOTIFY_CLIENT_ID === "COLLE_TON_CLIENT_ID_ICI") {
      banner("Client ID Spotify non configuré : la musique est désactivée. " +
             "Le minuteur fonctionne quand même. (Voir INSTALL.md)", "info", true);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
