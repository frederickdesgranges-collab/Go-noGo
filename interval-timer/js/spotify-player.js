/* =====================================================================
 *  spotify-player.js — Contrôle de la lecture via l'API Web « Player »
 *  (Spotify Connect). L'app NE joue PAS la musique : elle envoie des
 *  commandes à l'app Spotify officielle / une enceinte Connect choisie.
 *  (On n'utilise PAS le Web Playback SDK, peu fiable sur mobile.)
 *
 *  Ce module gère aussi :
 *   - la liste des playlists de l'utilisateur,
 *   - la récupération des pistes d'une playlist (avec pagination),
 *   - une « file » de pistes par phase pour avoir une chanson différente
 *     à chaque série (ordre séquentiel ou aléatoire, géré dans l'app).
 * ===================================================================== */

const SpotifyPlayer = (() => {

  let currentDeviceId = null;
  let seekStartMs = 0; // décalage de départ des chansons (saut d'intro), en ms

  /* Caches : URI de playlist -> tableau de pistes [{uri,name,artist}] */
  const trackCache = {};
  /* File par type de phase : { warmup:{tracks,pos}, work:{...}, ... } */
  const queues = {};

  /* ---------- Wrapper d'appel API avec gestion d'erreurs ---------- */

  /**
   * Appel à l'API Spotify avec token valide.
   * Renvoie { ok, status, data, errorCode } — errorCode normalisé :
   *   'NO_ACTIVE_DEVICE', 'PREMIUM_REQUIRED', 'RATE_LIMIT', 'AUTH', 'OTHER'.
   */
  async function api(path, { method = "GET", body = null, query = null } = {}) {
    let token;
    try { token = await SpotifyAuth.getValidToken(); }
    catch (e) { return { ok: false, errorCode: "AUTH", message: e.message }; }

    let url = SPOTIFY_API_BASE + path;
    if (query) url += "?" + new URLSearchParams(query).toString();

    const opts = { method, headers: { Authorization: "Bearer " + token } };
    if (body != null) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }

    let res;
    try { res = await fetch(url, opts); }
    catch { return { ok: false, errorCode: "NETWORK", message: "Échec réseau." }; }

    if (res.status === 204) return { ok: true, status: 204, data: null };

    let data = null;
    const text = await res.text();
    if (text) { try { data = JSON.parse(text); } catch { data = text; } }

    if (res.ok) return { ok: true, status: res.status, data };

    // Normalisation des erreurs Player.
    const reason = data && data.error && data.error.reason;
    let code = "OTHER";
    if (res.status === 404 || reason === "NO_ACTIVE_DEVICE") code = "NO_ACTIVE_DEVICE";
    else if (res.status === 403 && reason === "PREMIUM_REQUIRED") code = "PREMIUM_REQUIRED";
    else if (res.status === 403) code = "FORBIDDEN";
    else if (res.status === 429) code = "RATE_LIMIT";
    else if (res.status === 401) code = "AUTH";

    return { ok: false, status: res.status, errorCode: code,
             message: (data && data.error && data.error.message) || text || "Erreur API." };
  }

  /* ---------- Profil ---------- */

  async function getProfile() {
    const r = await api("/me");
    return r.ok ? r.data : null;
  }

  /* ---------- Appareils ---------- */

  async function getDevices() {
    const r = await api("/me/player/devices");
    return r.ok ? (r.data.devices || []) : [];
  }

  function setDevice(id) { currentDeviceId = id; }
  function getDevice() { return currentDeviceId; }

  /** Transfer Playback : active l'appareil choisi (play=false pour ne pas lancer). */
  async function transferTo(deviceId, play = false) {
    currentDeviceId = deviceId;
    return await api("/me/player", { method: "PUT", body: { device_ids: [deviceId], play } });
  }

  /* ---------- Commandes de lecture ---------- */

  function deviceQuery() {
    return currentDeviceId ? { device_id: currentDeviceId } : null;
  }

  async function pause() {
    return await api("/me/player/pause", { method: "PUT", query: deviceQuery() });
  }

  async function resume() {
    // Reprise sans corps : continue la lecture courante.
    return await api("/me/player/play", { method: "PUT", query: deviceQuery() });
  }

  async function nextTrack() {
    return await api("/me/player/next", { method: "POST", query: deviceQuery() });
  }

  async function previousTrack() {
    return await api("/me/player/previous", { method: "POST", query: deviceQuery() });
  }

  /** Joue une liste d'URIs de pistes précises (lecture déterministe). */
  async function playUris(uris) {
    if (!uris || !uris.length) return { ok: false, errorCode: "OTHER", message: "Aucune piste." };
    return await api("/me/player/play", {
      method: "PUT", query: deviceQuery(), body: { uris },
    });
  }

  async function setVolume(percent) {
    const v = Math.max(0, Math.min(100, Math.round(percent)));
    return await api("/me/player/volume", { method: "PUT", query: { volume_percent: v, ...(currentDeviceId ? { device_id: currentDeviceId } : {}) } });
  }

  async function currentlyPlaying() {
    const r = await api("/me/player/currently-playing");
    if (!r.ok || !r.data || !r.data.item) return null;
    const item = r.data.item;
    return {
      uri: item.uri,
      title: item.name,
      artist: (item.artists || []).map(a => a.name).join(", "),
      isPlaying: r.data.is_playing,
    };
  }

  /* ---------- Playlists de l'utilisateur ---------- */

  async function getMyPlaylists() {
    const all = [];
    let url = "/me/playlists";
    let query = { limit: 50 };
    while (url) {
      const r = await api(url, { query });
      if (!r.ok) break;
      (r.data.items || []).forEach(p => {
        if (p) all.push({ uri: p.uri, id: p.id, name: p.name });
      });
      // Pagination : 'next' est une URL complète ; on extrait le chemin.
      if (r.data.next) {
        const n = new URL(r.data.next);
        url = n.pathname.replace("/v1", "");
        query = Object.fromEntries(n.searchParams.entries());
      } else url = null;
    }
    return all;
  }

  /* ---------- Pistes d'une playlist (avec pagination 100/page) ---------- */

  /** Extrait l'ID de playlist depuis une URI, une URL ou un ID brut. */
  function parsePlaylistId(input) {
    if (!input) return null;
    input = input.trim();
    // spotify:playlist:ID
    let m = input.match(/playlist[:/]([a-zA-Z0-9]+)/);
    if (m) return m[1];
    // URL ouverte ...open.spotify.com/playlist/ID?...
    m = input.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
    if (m) return m[1];
    // ID brut
    if (/^[a-zA-Z0-9]{20,}$/.test(input)) return input;
    return null;
  }

  /** Récupère toutes les pistes (URIs) d'une playlist, paginées. */
  async function getPlaylistTracks(playlistRef) {
    const id = parsePlaylistId(playlistRef);
    if (!id) return [];
    if (trackCache[id]) return trackCache[id];

    const tracks = [];
    // Depuis février 2026, l'endpoint est « /items » (anciennement « /tracks »).
    // On tente « /items » d'abord, et on retombe sur « /tracks » si besoin
    // (compatibilité avec d'éventuelles apps plus anciennes).
    const fields = "items(track(uri,name,artists(name),is_local)),next";
    for (const endpoint of ["items", "tracks"]) {
      let url = `/playlists/${id}/${endpoint}`;
      let query = { limit: 100, fields };
      let firstOk = null;
      while (url) {
        const r = await api(url, { query });
        if (firstOk === null) firstOk = r.ok;
        if (!r.ok) break;
        (r.data.items || []).forEach(it => {
          const t = it && it.track;
          if (t && t.uri && !t.is_local && t.uri.startsWith("spotify:track:")) {
            tracks.push({ uri: t.uri, name: t.name, artist: (t.artists || []).map(a => a.name).join(", ") });
          }
        });
        if (r.data && r.data.next) {
          const n = new URL(r.data.next);
          url = n.pathname.replace("/v1", "");
          query = Object.fromEntries(n.searchParams.entries());
        } else url = null;
      }
      // Si « /items » a répondu (même vide), inutile d'essayer « /tracks ».
      if (firstOk) break;
    }
    trackCache[id] = tracks;
    return tracks;
  }

  /* ---------- Files de pistes par phase ---------- */

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Prépare la file d'un type de phase à partir d'une playlist.
   * order : 'sequential' ou 'random'. Réinitialise le pointeur.
   */
  async function prepareQueue(phaseType, playlistRef, order) {
    if (!playlistRef) { queues[phaseType] = null; return; }
    const id = parsePlaylistId(playlistRef);
    const contextUri = id ? `spotify:playlist:${id}` : null;
    const tracks = await getPlaylistTracks(playlistRef);

    if (tracks.length) {
      // Cas idéal : on a pu lire les pistes (playlist possédée / collaborative)
      // -> file déterministe dans l'app (séquentiel ou aléatoire).
      queues[phaseType] = {
        tracks: order === "random" ? shuffle(tracks) : tracks,
        pos: -1, // sera incrémenté à -> 0 à la première entrée de phase
        contextOnly: false,
      };
    } else if (contextUri) {
      // Repli (depuis fév. 2026) : playlists éditoriales/non possédées ne
      // renvoient pas leurs pistes. On lit alors par CONTEXTE (+ shuffle si
      // « aléatoire »), et on avance d'une piste à chaque série.
      queues[phaseType] = {
        tracks: [], pos: -1, contextOnly: true,
        contextUri, started: false, order,
      };
    } else {
      queues[phaseType] = null;
    }
  }

  async function playContext(contextUri) {
    return await api("/me/player/play", {
      method: "PUT", query: deviceQuery(), body: { context_uri: contextUri },
    });
  }

  /** Décalage de départ des chansons (saut d'intro). sec = 0 -> désactivé. */
  function setSeekStart(sec) { seekStartMs = Math.max(0, Math.round((sec || 0) * 1000)); }

  /** Avance la lecture à la position de départ choisie (après un petit délai
   *  pour laisser la piste démarrer avant de chercher la position). */
  async function applySeekStart() {
    if (!seekStartMs) return;
    await new Promise(r => setTimeout(r, 500));
    const query = { position_ms: seekStartMs };
    if (currentDeviceId) query.device_id = currentDeviceId;
    return await api("/me/player/seek", { method: "PUT", query });
  }

  async function setShuffle(state) {
    const query = { state: !!state };
    if (currentDeviceId) query.device_id = currentDeviceId;
    return await api("/me/player/shuffle", { method: "PUT", query });
  }

  /**
   * Avance la file de la phase et joue la piste suivante.
   * Boucle si épuisée. Renvoie l'objet piste joué (ou null si lecture par
   * contexte — l'affichage se met à jour via le sondage « lecture en cours »).
   */
  async function playNextInPhase(phaseType) {
    const q = queues[phaseType];
    if (!q) return { played: null };

    // Cas normal : file de pistes lisible -> lecture déterministe par URI.
    if (!q.contextOnly && q.tracks.length) {
      q.pos = (q.pos + 1) % q.tracks.length;
      const track = q.tracks[q.pos];
      const res = await playUris([track.uri]);
      if (res.ok) applySeekStart();
      return { played: track, res };
    }

    // Repli contexte : 1re série -> on lance la playlist (shuffle éventuel) ;
    // séries suivantes -> on passe à la piste suivante du contexte.
    if (q.contextOnly && q.contextUri) {
      let res;
      if (!q.started) {
        q.started = true;
        await setShuffle(q.order === "random");
        res = await playContext(q.contextUri);
      } else {
        res = await nextTrack();
      }
      if (res.ok) applySeekStart();
      return { played: null, res };
    }
    return { played: null };
  }

  function resetQueues() {
    Object.keys(queues).forEach(k => {
      if (queues[k]) { queues[k].pos = -1; if ("started" in queues[k]) queues[k].started = false; }
    });
  }

  return {
    api, getProfile, getDevices, setDevice, getDevice, transferTo,
    pause, resume, nextTrack, previousTrack, playUris, setVolume, currentlyPlaying,
    getMyPlaylists, getPlaylistTracks, parsePlaylistId,
    prepareQueue, playNextInPhase, resetQueues, setSeekStart,
  };
})();
