/* =====================================================================
 *  config.js — CONFIGURATION DE L'APPLICATION
 *
 *  ⚠️  C'EST ICI QUE TU DOIS COLLER TON CLIENT ID SPOTIFY  ⚠️
 *  Remplace la valeur de SPOTIFY_CLIENT_ID ci-dessous par le Client ID
 *  que tu obtiens dans le Spotify Developer Dashboard (voir INSTALL.md).
 *  Le Client ID est PUBLIC : c'est normal qu'il soit visible dans le code
 *  pour un client PKCE. Il n'y a AUCUN « client secret » à mettre ici.
 * ===================================================================== */

const SPOTIFY_CLIENT_ID = "c5f00c09e77048af83ae8381509facbf";


/* ---------------------------------------------------------------------
 *  REDIRECT URI
 *  Doit correspondre EXACTEMENT (au caractère près, slash final compris)
 *  à celui configuré dans le dashboard Spotify.
 *
 *  On le calcule automatiquement à partir de l'URL courante pour éviter
 *  les fautes de frappe : c'est l'adresse de la page sans les paramètres.
 *  Exemple sur GitHub Pages :
 *     https://ton-pseudo.github.io/Go-noGo/interval-timer/
 *  Exemple en test local :
 *     http://127.0.0.1:5500/interval-timer/   (PAS localhost — interdit par Spotify)
 * ------------------------------------------------------------------- */
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname;


/* ---------------------------------------------------------------------
 *  Permissions (scopes) demandées à Spotify.
 *  Ne pas réduire : chacune sert au contrôle de lecture / lecture des playlists.
 * ------------------------------------------------------------------- */
const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");


/* ---------------------------------------------------------------------
 *  Points d'entrée de l'API Spotify (stables).
 * ------------------------------------------------------------------- */
const SPOTIFY_AUTH_URL  = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE  = "https://api.spotify.com/v1";


/* ---------------------------------------------------------------------
 *  Couleurs par défaut par type de phase (modifiables dans l'app).
 *  Choix : vert = travail (go), bleu = repos (calme),
 *  orange = échauffement, violet = retour au calme.
 * ------------------------------------------------------------------- */
const DEFAULT_COLORS = {
  warmup:   "#e8821e", // orange
  work:     "#1db954", // vert Spotify (go)
  rest:     "#1f6feb", // bleu
  cooldown: "#7d4ad6", // violet
};

/* Libellés français des phases (affichage). */
const PHASE_LABELS = {
  warmup:   "Échauffement",
  work:     "Travail",
  rest:     "Repos",
  cooldown: "Retour au calme",
};

/* Intervalle de rafraîchissement de « la chanson en cours » (ms).
 * 4 s = compromis raisonnable pour respecter les limites de taux. */
const NOW_PLAYING_POLL_MS = 4000;
