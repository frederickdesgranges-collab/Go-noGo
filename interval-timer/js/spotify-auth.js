/* =====================================================================
 *  spotify-auth.js — Authentification Spotify « Authorization Code + PKCE »
 *
 *  Flux PKCE (recommandé par Spotify pour les apps web sans secret) :
 *   1. On génère un « code_verifier » aléatoire + son « code_challenge » (SHA-256).
 *   2. On redirige l'utilisateur vers la page d'autorisation Spotify.
 *   3. Spotify renvoie un « code » dans l'URL de redirection.
 *   4. On échange ce code (avec le code_verifier) contre un access_token
 *      ET un refresh_token, stockés dans localStorage.
 *   5. On rafraîchit automatiquement l'access_token avant son expiration.
 *
 *  ⚠️ Le flux « implicit grant » est SUPPRIMÉ par Spotify depuis le
 *  27 novembre 2025. On utilise donc UNIQUEMENT PKCE ici.
 * ===================================================================== */

const SpotifyAuth = (() => {

  const LS_TOKEN  = "spotify_tokens";       // { access_token, refresh_token, expires_at }
  const LS_VERIFIER = "spotify_pkce_verifier";
  const LS_STATE = "spotify_oauth_state";

  /* ---------- Utilitaires PKCE ---------- */

  function randomString(length) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_.-~";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, v => chars[v % chars.length]).join("");
  }

  async function sha256(plain) {
    const data = new TextEncoder().encode(plain);
    return await crypto.subtle.digest("SHA-256", data);
  }

  function base64url(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  /* ---------- Stockage des tokens ---------- */

  function getTokens() {
    try { return JSON.parse(localStorage.getItem(LS_TOKEN)); }
    catch { return null; }
  }

  function saveTokens(data) {
    // data = { access_token, refresh_token?, expires_in }
    const existing = getTokens() || {};
    const tokens = {
      access_token: data.access_token,
      // Spotify ne renvoie pas toujours un nouveau refresh_token au refresh :
      // on garde l'ancien si absent.
      refresh_token: data.refresh_token || existing.refresh_token,
      // On retire 60 s de marge pour rafraîchir avant l'expiration réelle.
      expires_at: Date.now() + (data.expires_in - 60) * 1000,
    };
    localStorage.setItem(LS_TOKEN, JSON.stringify(tokens));
    return tokens;
  }

  function clear() {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_VERIFIER);
    localStorage.removeItem(LS_STATE);
  }

  function isConnected() {
    const t = getTokens();
    return !!(t && t.refresh_token);
  }

  /* ---------- Étape 1-2 : lancer la connexion ---------- */

  async function login() {
    if (SPOTIFY_CLIENT_ID === "COLLE_TON_CLIENT_ID_ICI" || !SPOTIFY_CLIENT_ID) {
      throw new Error("Client ID manquant : ouvre js/config.js et colle ton Client ID Spotify.");
    }
    const verifier  = randomString(64);
    const challenge = base64url(await sha256(verifier));
    const state     = randomString(16);

    localStorage.setItem(LS_VERIFIER, verifier);
    localStorage.setItem(LS_STATE, state);

    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
      code_challenge_method: "S256",
      code_challenge: challenge,
      state: state,
    });
    window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  }

  /* ---------- Étape 3-4 : traiter le retour de redirection ---------- */

  /**
   * À appeler au chargement de la page. Si un « code » est présent dans
   * l'URL, on l'échange contre des tokens puis on nettoie l'URL.
   * Renvoie { handled: true/false, error? }.
   */
  async function handleRedirect() {
    const url = new URL(window.location.href);
    const code  = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state");

    if (error) {
      cleanUrl();
      return { handled: true, error: "Connexion Spotify refusée : " + error };
    }
    if (!code) return { handled: false };

    // Vérification anti-CSRF du state.
    const savedState = localStorage.getItem(LS_STATE);
    if (!savedState || savedState !== state) {
      cleanUrl();
      return { handled: true, error: "Échec de sécurité (state invalide). Réessaie la connexion." };
    }

    const verifier = localStorage.getItem(LS_VERIFIER);
    if (!verifier) {
      cleanUrl();
      return { handled: true, error: "Session de connexion perdue. Réessaie." };
    }

    try {
      const body = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        code_verifier: verifier,
      });
      const res = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error("Échange du token échoué : " + txt);
      }
      const data = await res.json();
      saveTokens(data);
      localStorage.removeItem(LS_VERIFIER);
      localStorage.removeItem(LS_STATE);
      cleanUrl();
      return { handled: true };
    } catch (e) {
      cleanUrl();
      return { handled: true, error: e.message };
    }
  }

  /** Retire les paramètres OAuth de l'URL sans recharger la page. */
  function cleanUrl() {
    window.history.replaceState({}, document.title, SPOTIFY_REDIRECT_URI);
  }

  /* ---------- Étape 5 : rafraîchissement ---------- */

  let refreshPromise = null;

  async function refresh() {
    const t = getTokens();
    if (!t || !t.refresh_token) throw new Error("Aucun refresh token : reconnecte-toi.");

    // Évite plusieurs refresh simultanés.
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: t.refresh_token,
        client_id: SPOTIFY_CLIENT_ID,
      });
      const res = await fetch(SPOTIFY_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) {
        // Refresh token invalidé : on force une reconnexion.
        clear();
        throw new Error("Session expirée. Reconnecte-toi à Spotify.");
      }
      const data = await res.json();
      const tokens = saveTokens(data);
      return tokens.access_token;
    })();

    try { return await refreshPromise; }
    finally { refreshPromise = null; }
  }

  /** Renvoie un access_token valide, en rafraîchissant si nécessaire. */
  async function getValidToken() {
    const t = getTokens();
    if (!t) throw new Error("Non connecté à Spotify.");
    if (Date.now() >= t.expires_at) return await refresh();
    return t.access_token;
  }

  return { login, handleRedirect, isConnected, getValidToken, clear };
})();
