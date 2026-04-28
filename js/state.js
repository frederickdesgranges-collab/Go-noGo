/**
 * CEC Check-in - state.js
 * Holds the form state in memory and persists user preferences.
 */

const STORAGE_KEYS = {
  lang: 'cec_lang',
  coachPhone: 'cec_coach_phone',
  athleteName: 'cec_athlete_name'
};

const DEFAULT_COACH_PHONE = '14186095751';

const initial = {
  lang: 'fr',
  coachPhone: DEFAULT_COACH_PHONE,
  athleteName: '',

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
    recoveryPrs: 7
  },
  pain: {
    fingers: 0,
    pipDorsal: false,
    forearm: 0,
    shoulders: 0,
    elbow: 0,
    back: 0,
    skin: 0,
    other: ''
  },
  hydration: {
    urine: null,
    skippedMeal: false,
    note: ''
  }
};

export const state = structuredClone(initial);

/**
 * Reset the in-memory state but keep user preferences (lang, phone, name).
 */
export function resetForm() {
  const { lang, coachPhone, athleteName } = state;
  Object.assign(state, structuredClone(initial));
  state.lang = lang;
  state.coachPhone = coachPhone;
  state.athleteName = athleteName;
}

export function loadPreferences() {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.lang);
    if (lang === 'fr' || lang === 'en') state.lang = lang;
    const phone = localStorage.getItem(STORAGE_KEYS.coachPhone);
    if (phone) state.coachPhone = phone;
    const name = localStorage.getItem(STORAGE_KEYS.athleteName);
    if (name) state.athleteName = name;
  } catch (_) {
    // localStorage unavailable; keep defaults
  }
}

export function saveLang(lang) {
  state.lang = lang;
  try { localStorage.setItem(STORAGE_KEYS.lang, lang); } catch (_) {}
}

export function saveCoachPhone(phone) {
  state.coachPhone = phone;
  try { localStorage.setItem(STORAGE_KEYS.coachPhone, phone); } catch (_) {}
}

export function saveAthleteName(name) {
  state.athleteName = name;
  try {
    if (name) localStorage.setItem(STORAGE_KEYS.athleteName, name);
    else localStorage.removeItem(STORAGE_KEYS.athleteName);
  } catch (_) {}
}

export const STORAGE = STORAGE_KEYS;
