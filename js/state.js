/**
 * CEC Check-in - state.js
 * Holds the form state in memory and persists user preferences.
 */

const STORAGE_KEYS = {
  lang: 'cec_lang',
  coachGroupUrl: 'cec_coach_group_url',
  coachSheetUrl: 'cec_coach_sheet_url',
  athleteName: 'cec_athlete_name',
  discipline: 'cec_discipline',
  profile: 'cec_profile',
  history: 'cec_history',
  progressionZoom: 'cec_progression_zoom'
};

// Shared WhatsApp group for the Innsbruck 2026 camp coach team.
// Hardcoded so every athlete gets it pre-wired. Each athlete can still
// override it in Settings if the coach rotates the invite link.
const DEFAULT_COACH_GROUP_URL = 'https://chat.whatsapp.com/EVUD45QNns35bQeacCJPSD';

// Default Google Apps Script endpoint for the Innsbruck 2026 camp.
// Hardcoded so every athlete who installs the app gets it pre-wired —
// no copy-paste required. Each athlete can still override it in
// Settings, and existing localStorage values are preserved on upgrade.
const DEFAULT_COACH_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwgiDub11m2DsQf40sfy5SWz3kNhmIW-yVQTdz_g_IXfAVTAREBjukcRQia_L4l1iXJ0Q/exec';

const initial = {
  lang: 'fr',
  coachGroupUrl: DEFAULT_COACH_GROUP_URL,
  coachSheetUrl: DEFAULT_COACH_SHEET_URL,
  athleteName: '',
  discipline: null,
  profile: null,

  sleep: {
    bedtime: '23:00',
    wake: '07:00',
    durationHours: 8,
    quality: null,
    wakings: 0
  },
  wellbeing: {
    energy: null,
    muscles: null,
    forearms: null,
    calm: null,
    mood: null,
    willingness: 7,
    recoveryPrs: 7,
    prevSessionIntensity: 0
  },
  pain: {
    fingers: 0,
    wantsPhysio: false,
    forearm: 0,
    shoulders: 0,
    elbow: 0,
    back: 0,
    skin: 0,
    other: ''
  },
  hydration: {
    fuelScore: 3,
    note: ''
  }
};

export const state = structuredClone(initial);

/**
 * Reset the in-memory state but keep user preferences.
 */
export function resetForm() {
  const { lang, coachGroupUrl, coachSheetUrl, athleteName, discipline, profile } = state;
  Object.assign(state, structuredClone(initial));
  state.lang = lang;
  state.coachGroupUrl = coachGroupUrl;
  state.coachSheetUrl = coachSheetUrl;
  state.athleteName = athleteName;
  state.discipline = discipline;
  state.profile = profile;
}

export function loadPreferences() {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.lang);
    if (lang === 'fr' || lang === 'en') state.lang = lang;
    const groupUrl = localStorage.getItem(STORAGE_KEYS.coachGroupUrl);
    if (groupUrl) state.coachGroupUrl = groupUrl;
    const sheetUrl = localStorage.getItem(STORAGE_KEYS.coachSheetUrl);
    if (sheetUrl) state.coachSheetUrl = sheetUrl;
    const name = localStorage.getItem(STORAGE_KEYS.athleteName);
    if (name) state.athleteName = name;
    const discipline = localStorage.getItem(STORAGE_KEYS.discipline);
    if (['lead', 'boulder', 'speed', 'combined'].includes(discipline)) {
      state.discipline = discipline;
    }
    const profile = localStorage.getItem(STORAGE_KEYS.profile);
    if (['competing', 'not-competing'].includes(profile)) {
      state.profile = profile;
    }
  } catch (_) {
    // localStorage unavailable; keep defaults
  }
}

export function saveDiscipline(d) {
  state.discipline = d;
  try {
    if (d) localStorage.setItem(STORAGE_KEYS.discipline, d);
    else localStorage.removeItem(STORAGE_KEYS.discipline);
  } catch (_) {}
}

export function saveProfile(p) {
  state.profile = p;
  try {
    if (p) localStorage.setItem(STORAGE_KEYS.profile, p);
    else localStorage.removeItem(STORAGE_KEYS.profile);
  } catch (_) {}
}

/**
 * Score history stored as { 'YYYY-MM-DD': score, ... } in localStorage.
 * Used by the progression chart on the result screen.
 */
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

export function saveScore(dateKey, scoreOrEntry) {
  try {
    const h = loadHistory();
    // Accept either a plain number (legacy) or a full entry object
    h[dateKey] = scoreOrEntry;
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(h));
  } catch (_) {}
}

export function todayDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function loadProgressionZoom() {
  try {
    const z = localStorage.getItem(STORAGE_KEYS.progressionZoom);
    return ['1W', '1M', '3M'].includes(z) ? z : '1M';
  } catch (_) {
    return '1M';
  }
}

export function saveProgressionZoom(zoom) {
  try {
    if (['1W', '1M', '3M'].includes(zoom)) {
      localStorage.setItem(STORAGE_KEYS.progressionZoom, zoom);
    }
  } catch (_) {}
}

export function saveLang(lang) {
  state.lang = lang;
  try { localStorage.setItem(STORAGE_KEYS.lang, lang); } catch (_) {}
}

export function saveCoachGroupUrl(url) {
  state.coachGroupUrl = (url || '').trim();
  try {
    if (state.coachGroupUrl) {
      localStorage.setItem(STORAGE_KEYS.coachGroupUrl, state.coachGroupUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.coachGroupUrl);
    }
  } catch (_) {}
}

export function saveCoachSheetUrl(url) {
  state.coachSheetUrl = (url || '').trim();
  try {
    if (state.coachSheetUrl) {
      localStorage.setItem(STORAGE_KEYS.coachSheetUrl, state.coachSheetUrl);
    } else {
      localStorage.removeItem(STORAGE_KEYS.coachSheetUrl);
    }
  } catch (_) {}
}

export function saveAthleteName(name) {
  state.athleteName = name;
  try {
    if (name) localStorage.setItem(STORAGE_KEYS.athleteName, name);
    else localStorage.removeItem(STORAGE_KEYS.athleteName);
  } catch (_) {}
}

export const STORAGE = STORAGE_KEYS;
