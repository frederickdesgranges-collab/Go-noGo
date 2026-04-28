/**
 * CEC Check-in - result-screen.js
 * Render the dashboard: hero card, animated ring, stats grid, indicators.
 */

import { state } from './state.js';
import { t } from './translations.js';
import { mountScene } from './animations.js';
import { formatHours } from './form-logic.js';

const RING_RADIUS = 108;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

/**
 * Render the entire result screen given an evaluation.
 */
export function renderResult(evalResult) {
  const lang = state.lang;
  const screen = document.getElementById('screen-result');
  const hero = document.getElementById('hero-card');

  hero.classList.remove('track-green', 'track-yellow', 'track-red');
  hero.classList.add(`track-${evalResult.color}`);

  // Letter & label
  document.getElementById('hero-letter').textContent = evalResult.track;
  const labelKey = evalResult.track === 'A' ? 'result.trackA' : 'result.trackB';
  document.getElementById('hero-track-label').textContent = t(lang, labelKey);

  // Messages
  document.getElementById('hero-message').textContent = t(lang, evalResult.messageKey);
  document.getElementById('hero-kindness').textContent = t(lang, evalResult.kindnessKey);

  // Ring fill
  const ring = document.getElementById('ring-fg');
  ring.style.setProperty('--ring-circ', String(RING_CIRC));
  ring.setAttribute('stroke-dasharray', String(RING_CIRC));
  // Reset to empty first to retrigger transition
  ring.setAttribute('stroke-dashoffset', String(RING_CIRC));
  void ring.getBoundingClientRect();
  const target = RING_CIRC * (1 - evalResult.ringRatio);
  ring.setAttribute('stroke-dashoffset', String(target));

  // Climber scene
  const climberHost = document.getElementById('track-climber');
  mountScene(climberHost, evalResult.color);

  // Stats grid
  renderStats();

  // Indicators
  renderIndicators(evalResult.flags);

  // Trigger entry animation
  screen.classList.add('entering');
  setTimeout(() => screen.classList.remove('entering'), 800);
}

/**
 * Build the 8-stat dashboard grid.
 */
function renderStats() {
  const lang = state.lang;
  const grid = document.getElementById('stats-grid');
  const items = [
    {
      labelKey: 'result.stat.sleep',
      value: state.sleep.durationHours,
      unitKey: 'result.stat.unitHours',
      tone: toneFromSleep(state.sleep.durationHours),
      ratio: clamp01(state.sleep.durationHours / 9),
      formatter: (v) => formatHours(v, lang)
    },
    {
      labelKey: 'result.stat.energy',
      value: state.wellbeing.energy,
      unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.energy),
      ratio: ratioLikert(state.wellbeing.energy)
    },
    {
      labelKey: 'result.stat.muscles',
      value: state.wellbeing.muscles,
      unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.muscles),
      ratio: ratioLikert(state.wellbeing.muscles)
    },
    {
      labelKey: 'result.stat.forearms',
      value: state.wellbeing.forearms,
      unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.forearms),
      ratio: ratioLikert(state.wellbeing.forearms)
    },
    {
      labelKey: 'result.stat.calm',
      value: state.wellbeing.calm,
      unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.calm),
      ratio: ratioLikert(state.wellbeing.calm)
    },
    {
      labelKey: 'result.stat.mood',
      value: state.wellbeing.mood,
      unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.mood),
      ratio: ratioLikert(state.wellbeing.mood)
    },
    {
      labelKey: 'result.stat.willingness',
      value: state.wellbeing.willingness,
      unitKey: 'result.stat.unitOf10',
      tone: toneFromHigherIsBetter(state.wellbeing.willingness),
      ratio: clamp01(state.wellbeing.willingness / 10)
    },
    {
      labelKey: 'result.stat.recovery',
      value: state.wellbeing.recoveryPrs,
      unitKey: 'result.stat.unitOf10',
      tone: toneFromHigherIsBetter(state.wellbeing.recoveryPrs),
      ratio: clamp01(state.wellbeing.recoveryPrs / 10)
    }
  ];

  grid.innerHTML = items.map((item) => {
    const valueText = item.formatter ? item.formatter(item.value) : (item.value === null ? '—' : String(item.value));
    const unitText = item.value === null ? '' : t(lang, item.unitKey);
    const widthPct = Math.round(item.ratio * 100);
    return `
      <div class="stat-card tone-${item.tone}">
        <span class="stat-label">${escapeHtml(t(lang, item.labelKey))}</span>
        <div class="stat-value-row">
          <span class="stat-value">${escapeHtml(valueText)}</span>
          <span class="stat-unit">${escapeHtml(unitText)}</span>
        </div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width: ${widthPct}%"></div></div>
      </div>
    `;
  }).join('');
}

function renderIndicators(flags) {
  const lang = state.lang;
  const list = document.getElementById('indicators-list');
  const all = [
    ...flags.red.map((f) => ({ ...f, tone: 'red' })),
    ...flags.yellow.map((f) => ({ ...f, tone: 'yellow' }))
  ];

  if (all.length === 0) {
    list.innerHTML = `<li class="indicator dot-green"><span>${escapeHtml(t(lang, 'result.noFlags'))}</span></li>`;
    return;
  }

  list.innerHTML = all.map((flag) => {
    const text = t(lang, `result.${flag.key}`);
    return `<li class="indicator dot-${flag.tone}"><span>${escapeHtml(text)}</span></li>`;
  }).join('');
}

function toneFromLikert(v) {
  if (v === null || v === undefined) return 'blue';
  if (v <= 2) return 'red';
  if (v === 3) return 'yellow';
  return 'green';
}

function toneFromHigherIsBetter(v) {
  if (v <= 4) return 'red';
  if (v <= 6) return 'yellow';
  return 'green';
}

function toneFromSleep(h) {
  if (!h) return 'blue';
  if (h < 7) return 'red';
  if (h < 8) return 'yellow';
  return 'green';
}

function ratioLikert(v) {
  if (v === null || v === undefined) return 0;
  return v / 5;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
