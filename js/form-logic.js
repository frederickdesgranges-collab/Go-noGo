/**
 * CEC Check-in - form-logic.js
 * Build Likert buttons, hook sliders/inputs into state, validate, progress.
 */

import { state, saveAthleteName } from './state.js';
import { t } from './translations.js';

const REQUIRED_LIKERTS = ['sleep-quality', 'energy', 'muscles', 'forearms', 'calm', 'mood'];

/**
 * Map likert dataset key -> path inside state.
 */
const LIKERT_TO_STATE = {
  'sleep-quality': ['sleep', 'quality'],
  'energy': ['wellbeing', 'energy'],
  'muscles': ['wellbeing', 'muscles'],
  'forearms': ['wellbeing', 'forearms'],
  'calm': ['wellbeing', 'calm'],
  'mood': ['wellbeing', 'mood']
};

const PAIN_FIELDS = [
  ['pain-fingers', 'fingers'],
  ['pain-forearm', 'forearm'],
  ['pain-shoulders', 'shoulders'],
  ['pain-elbow', 'elbow'],
  ['pain-back', 'back'],
  ['pain-skin', 'skin']
];

let onChangeCallback = () => {};

export function onAnyChange(cb) { onChangeCallback = cb; }

function setNested(obj, path, value) {
  let node = obj;
  for (let i = 0; i < path.length - 1; i++) {
    node = node[path[i]];
  }
  node[path[path.length - 1]] = value;
}

/**
 * Build the 5 Likert buttons inside each .likert-buttons container.
 */
export function buildLikertScales() {
  const groups = document.querySelectorAll('.likert');
  groups.forEach((group) => {
    const key = group.dataset.likert;
    const container = group.querySelector('.likert-buttons');
    if (!container || container.childElementCount > 0) return;
    for (let v = 1; v <= 5; v++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'likert-btn';
      btn.dataset.value = String(v);
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.setAttribute('aria-label', `${key} ${v}`);
      btn.textContent = String(v);
      btn.addEventListener('click', () => {
        selectLikert(key, v);
      });
      container.appendChild(btn);
    }
  });
}

function selectLikert(key, value) {
  const path = LIKERT_TO_STATE[key];
  if (!path) return;
  setNested(state, path, value);
  const group = document.querySelector(`.likert[data-likert="${key}"]`);
  if (group) {
    group.classList.remove('invalid');
    group.querySelectorAll('.likert-btn').forEach((b) => {
      const isActive = Number(b.dataset.value) === value;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }
  onChangeCallback();
}

/**
 * Wire all sliders, time inputs, toggles, name and notes.
 */
export function wireFormControls() {
  const $ = (id) => document.getElementById(id);

  // Athlete name
  const name = $('athlete-name');
  if (state.athleteName) name.value = state.athleteName;
  name.addEventListener('input', () => {
    state.athleteName = name.value.trim();
    name.classList.remove('invalid');
    onChangeCallback();
  });
  name.addEventListener('blur', () => {
    saveAthleteName(name.value.trim());
  });

  // Sleep times
  const bedtime = $('sleep-bedtime');
  const wake = $('sleep-wake');
  const durationEl = $('sleep-duration');
  const durationValueEl = $('sleep-duration-value');

  function recomputeDuration() {
    const hours = computeSleepHours(bedtime.value, wake.value);
    state.sleep.bedtime = bedtime.value;
    state.sleep.wake = wake.value;
    state.sleep.durationHours = hours;

    const formatted = formatHours(hours, state.lang);
    durationValueEl.textContent = formatted;
    durationEl.classList.remove('warning', 'ok');
    if (hours > 0) {
      if (hours < 7) durationEl.classList.add('warning');
      else if (hours >= 8) durationEl.classList.add('ok');
    }
    onChangeCallback();
  }
  bedtime.addEventListener('input', recomputeDuration);
  wake.addEventListener('input', recomputeDuration);
  recomputeDuration();

  // Wakings
  const wakings = $('sleep-wakings');
  wakings.addEventListener('input', () => {
    const v = parseInt(wakings.value, 10);
    state.sleep.wakings = isNaN(v) ? 0 : Math.max(0, Math.min(20, v));
    onChangeCallback();
  });

  // Wellbeing sliders
  bindSlider('willingness', ['wellbeing', 'willingness']);
  bindSlider('recovery-prs', ['wellbeing', 'recoveryPrs']);
  bindSlider('prev-session-intensity', ['wellbeing', 'prevSessionIntensity']);

  // Pain sliders
  PAIN_FIELDS.forEach(([id, key]) => {
    bindSlider(id, ['pain', key]);
  });

  // PIP dorsal toggle
  const pip = $('pip-dorsal');
  pip.addEventListener('change', () => {
    state.pain.pipDorsal = pip.checked;
    onChangeCallback();
  });

  // Pain other text
  const painOther = $('pain-other');
  painOther.addEventListener('input', () => {
    state.pain.other = painOther.value;
  });

  // Fuel score slider
  bindSlider('fuel-score', ['hydration', 'fuelScore']);

  // Free note
  const note = $('free-note');
  note.addEventListener('input', () => {
    state.hydration.note = note.value;
  });
}

function bindSlider(id, path) {
  const el = document.getElementById(id);
  const valueEl = document.getElementById(`${id}-value`);
  if (!el || !valueEl) return;
  let lastValue = null;
  const update = () => {
    const v = parseInt(el.value, 10) || 0;
    setNested(state, path, v);
    if (valueEl.textContent !== String(v)) {
      valueEl.textContent = String(v);
      if (lastValue !== null) {
        valueEl.classList.remove('pulse');
        void valueEl.offsetWidth;
        valueEl.classList.add('pulse');
      }
      lastValue = v;
    }
    onChangeCallback();
  };
  el.addEventListener('input', update);
  update();
}

/**
 * Refresh all DOM controls from state values (used when restoring/editing).
 */
export function syncFormFromState() {
  const $ = (id) => document.getElementById(id);

  $('athlete-name').value = state.athleteName || '';
  $('sleep-bedtime').value = state.sleep.bedtime;
  $('sleep-wake').value = state.sleep.wake;
  $('sleep-wakings').value = String(state.sleep.wakings);
  $('willingness').value = String(state.wellbeing.willingness);
  $('willingness-value').textContent = String(state.wellbeing.willingness);
  $('recovery-prs').value = String(state.wellbeing.recoveryPrs);
  $('recovery-prs-value').textContent = String(state.wellbeing.recoveryPrs);
  $('prev-session-intensity').value = String(state.wellbeing.prevSessionIntensity);
  $('prev-session-intensity-value').textContent = String(state.wellbeing.prevSessionIntensity);

  PAIN_FIELDS.forEach(([id, key]) => {
    const el = $(id);
    el.value = String(state.pain[key]);
    document.getElementById(`${id}-value`).textContent = String(state.pain[key]);
  });

  $('pip-dorsal').checked = state.pain.pipDorsal;
  $('pain-other').value = state.pain.other || '';
  $('fuel-score').value = String(state.hydration.fuelScore);
  $('fuel-score-value').textContent = String(state.hydration.fuelScore);
  $('free-note').value = state.hydration.note || '';

  // Likert visual sync
  Object.entries(LIKERT_TO_STATE).forEach(([key, path]) => {
    const value = path.reduce((node, p) => (node ? node[p] : null), state);
    const group = document.querySelector(`.likert[data-likert="${key}"]`);
    if (!group) return;
    group.querySelectorAll('.likert-btn').forEach((b) => {
      const isActive = value !== null && Number(b.dataset.value) === value;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  });

  // Recompute sleep duration display
  const hours = computeSleepHours(state.sleep.bedtime, state.sleep.wake);
  state.sleep.durationHours = hours;
  $('sleep-duration-value').textContent = formatHours(hours, state.lang);
}

/**
 * Validate the form. Returns { ok: true } or { ok: false, message }.
 * Side-effect: marks invalid controls.
 */
export function validateForm() {
  document.querySelectorAll('.likert.invalid, .text-input.invalid').forEach((el) => el.classList.remove('invalid'));

  let firstInvalid = null;

  const nameEl = document.getElementById('athlete-name');
  if (!state.athleteName) {
    nameEl.classList.add('invalid');
    firstInvalid = nameEl;
    return { ok: false, message: t(state.lang, 'validation.missingName'), focus: nameEl };
  }

  for (const key of REQUIRED_LIKERTS) {
    const path = LIKERT_TO_STATE[key];
    const value = path.reduce((node, p) => (node ? node[p] : null), state);
    if (value === null || value === undefined) {
      const group = document.querySelector(`.likert[data-likert="${key}"]`);
      if (group) {
        group.classList.add('invalid');
        if (!firstInvalid) firstInvalid = group;
      }
    }
  }

  if (firstInvalid) {
    return { ok: false, message: t(state.lang, 'validation.missingLikert'), focus: firstInvalid };
  }

  return { ok: true };
}

/**
 * Compute progress 0-1 over all required answers.
 */
export function computeProgress() {
  let filled = 0;
  let total = REQUIRED_LIKERTS.length + 1; // + name
  if (state.athleteName) filled++;
  REQUIRED_LIKERTS.forEach((key) => {
    const path = LIKERT_TO_STATE[key];
    const value = path.reduce((node, p) => (node ? node[p] : null), state);
    if (value !== null && value !== undefined) filled++;
  });
  return filled / total;
}

/**
 * Refresh the sticky progress bar fill.
 */
export function updateProgressBar() {
  const fill = document.getElementById('progress-fill');
  if (!fill) return;
  const pct = Math.round(computeProgress() * 100);
  fill.style.width = `${pct}%`;
}

/**
 * Compute sleep duration in hours, supporting overnight wrap.
 */
export function computeSleepHours(bedtime, wake) {
  if (!bedtime || !wake) return 0;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  if ([bh, bm, wh, wm].some(Number.isNaN)) return 0;
  let bedMinutes = bh * 60 + bm;
  let wakeMinutes = wh * 60 + wm;
  if (wakeMinutes <= bedMinutes) wakeMinutes += 24 * 60;
  const minutes = wakeMinutes - bedMinutes;
  return Math.round((minutes / 60) * 10) / 10;
}

export function formatHours(hours, lang) {
  if (!hours) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const unit = lang === 'en' ? 'h' : 'h';
  if (m === 0) return `${h}${unit}`;
  return `${h}${unit}${String(m).padStart(2, '0')}`;
}
