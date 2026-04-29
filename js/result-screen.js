/**
 * CEC Check-in - result-screen.js
 * Render the dashboard: hero card, 12-arc neon ring,
 * donut stats grid, indicators, athlete initial.
 */

import { state } from './state.js';
import { t } from './translations.js';
import { formatHours } from './form-logic.js';

const DONUT_RADIUS = 22;
const DONUT_CIRC = 2 * Math.PI * DONUT_RADIUS;

const RING_CX = 180;
const RING_CY = 180;
const ARC_RADIUS = 158;
const ARC_COUNT = 12;
const ARC_GAP_DEG = 3;
const ARC_SEG_DEG = 360 / ARC_COUNT - ARC_GAP_DEG;

let ringTicksRendered = false;

const PALETTES = {
  green: ['#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f59e0b'],
  yellow: ['#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#fb923c', '#f97316', '#ea580c', '#d97706', '#b45309', '#92400e', '#78350f', '#facc15'],
  red: ['#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#dc2626', '#ef4444', '#f87171', '#fca5a5']
};

export function renderResult(evalResult) {
  const lang = state.lang;
  const screen = document.getElementById('screen-result');
  const hero = document.getElementById('hero-card');

  hero.classList.remove('track-green', 'track-yellow', 'track-red');
  hero.classList.add(`track-${evalResult.color}`);

  document.getElementById('hero-letter').textContent = evalResult.track;
  const labelKey = evalResult.track === 'A' ? 'result.trackA' : 'result.trackB';
  document.getElementById('hero-track-label').textContent = t(lang, labelKey);

  document.getElementById('hero-message').textContent = t(lang, evalResult.messageKey);
  document.getElementById('hero-kindness').textContent = t(lang, evalResult.kindnessKey);

  ensureRingTicks();
  renderRingArcs(evalResult.color, evalResult.ringRatio);
  renderReadiness(evalResult.score);
  renderTrackMeta();

  renderStats();
  renderIndicators(evalResult.flags);

  screen.classList.add('entering');
  setTimeout(() => screen.classList.remove('entering'), 1200);
}

/**
 * Animate the readiness score from 0 to target over ~900ms.
 */
function renderReadiness(target) {
  const el = document.getElementById('readiness-value');
  if (!el) return;
  const final = Math.max(0, Math.min(100, Math.round(target ?? 0)));
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = String(Math.round(eased * final));
    if (t < 1) requestAnimationFrame(tick);
  }
  el.textContent = '0';
  requestAnimationFrame(tick);
}

/**
 * Show "NAME · DATE" inside the inner core.
 */
function renderTrackMeta() {
  const nameEl = document.getElementById('track-meta-name');
  const dateEl = document.getElementById('track-meta-date');
  if (!nameEl || !dateEl) return;
  const name = (state.athleteName || '').trim().toUpperCase();
  const locale = state.lang === 'en' ? 'en-CA' : 'fr-CA';
  const date = new Date().toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short'
  }).toUpperCase().replace(/\.$/, '');
  nameEl.textContent = name || '—';
  dateEl.textContent = date;
}

/**
 * Light decorative tick marks every 6° (60 ticks total) on the inner side.
 */
function ensureRingTicks() {
  if (ringTicksRendered) return;
  const host = document.getElementById('ring-ticks');
  if (!host) return;
  const cx = RING_CX, cy = RING_CY, rOut = 142;
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const major = i % 5 === 0;
    const r1 = rOut;
    const r2 = rOut - (major ? 8 : 4);
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * r2;
    const y2 = cy + Math.sin(angle) * r2;
    ticks.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="rgba(255,255,255,${major ? 0.32 : 0.14})" stroke-width="${major ? 1.4 : 1}"/>`);
  }
  host.innerHTML = ticks.join('');
  ringTicksRendered = true;
}

/**
 * Render 12 neon colored arcs at radius ARC_RADIUS, each rotated to its slot.
 * The first N (= round(ratio * 12)) arcs are full opacity; the rest are faded.
 * Animated entry: each arc fades in with a small delay.
 */
function renderRingArcs(color, ratio = 1) {
  const host = document.getElementById('ring-arcs');
  if (!host) return;
  const palette = PALETTES[color] || PALETTES.green;
  const cx = RING_CX, cy = RING_CY, r = ARC_RADIUS;
  const circ = 2 * Math.PI * r;
  const segLen = (ARC_SEG_DEG / 360) * circ;
  const gapLen = circ - segLen;
  const activeCount = Math.max(1, Math.round(ratio * ARC_COUNT));
  const arcs = [];
  for (let i = 0; i < ARC_COUNT; i++) {
    const startDeg = i * (360 / ARC_COUNT) - 90;
    const fill = palette[i % palette.length];
    const isActive = i < activeCount;
    const baseOpacity = isActive ? 1 : 0.16;
    arcs.push(`
      <circle cx="${cx}" cy="${cy}" r="${r}"
              fill="none"
              stroke="${fill}"
              stroke-width="22"
              stroke-linecap="round"
              stroke-dasharray="${segLen.toFixed(2)} ${gapLen.toFixed(2)}"
              transform="rotate(${startDeg.toFixed(2)} ${cx} ${cy})"
              filter="drop-shadow(0 0 8px ${fill})"
              opacity="0">
        <animate attributeName="opacity"
                 values="0;${baseOpacity}"
                 dur="0.7s"
                 begin="${(i * 0.06).toFixed(2)}s"
                 fill="freeze"/>
      </circle>
    `);
  }
  host.innerHTML = arcs.join('');
}

function renderStats() {
  const lang = state.lang;
  const grid = document.getElementById('stats-grid');
  const items = [
    { labelKey: 'result.stat.sleep', value: state.sleep.durationHours, unitKey: 'result.stat.unitHours',
      tone: toneFromSleep(state.sleep.durationHours), ratio: clamp01(state.sleep.durationHours / 9),
      donutText: state.sleep.durationHours ? `${state.sleep.durationHours.toFixed(1)}` : '—',
      formatter: (v) => formatHours(v, lang) },
    { labelKey: 'result.stat.energy', value: state.wellbeing.energy, unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.energy), ratio: ratioLikert(state.wellbeing.energy) },
    { labelKey: 'result.stat.muscles', value: state.wellbeing.muscles, unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.muscles), ratio: ratioLikert(state.wellbeing.muscles) },
    { labelKey: 'result.stat.forearms', value: state.wellbeing.forearms, unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.forearms), ratio: ratioLikert(state.wellbeing.forearms) },
    { labelKey: 'result.stat.calm', value: state.wellbeing.calm, unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.calm), ratio: ratioLikert(state.wellbeing.calm) },
    { labelKey: 'result.stat.mood', value: state.wellbeing.mood, unitKey: 'result.stat.unitOf5',
      tone: toneFromLikert(state.wellbeing.mood), ratio: ratioLikert(state.wellbeing.mood) },
    { labelKey: 'result.stat.willingness', value: state.wellbeing.willingness, unitKey: 'result.stat.unitOf10',
      tone: toneFromHigherIsBetter(state.wellbeing.willingness), ratio: clamp01(state.wellbeing.willingness / 10) },
    { labelKey: 'result.stat.recovery', value: state.wellbeing.recoveryPrs, unitKey: 'result.stat.unitOf10',
      tone: toneFromHigherIsBetter(state.wellbeing.recoveryPrs), ratio: clamp01(state.wellbeing.recoveryPrs / 10) }
  ];

  grid.innerHTML = items.map((item, idx) => {
    const valueText = item.formatter ? item.formatter(item.value) : (item.value === null ? '—' : String(item.value));
    const unitText = item.value === null ? '' : t(lang, item.unitKey);
    const donutCenter = item.donutText !== undefined ? item.donutText
      : (item.value === null ? '—' : `${Math.round(item.ratio * 100)}%`);
    const gradId = `donut-gradient-${item.tone}`;
    return `
      <div class="stat-card tone-${item.tone}">
        <div class="stat-info">
          <span class="stat-label">${escapeHtml(t(lang, item.labelKey))}</span>
          <div class="stat-value-row">
            <span class="stat-value">${escapeHtml(valueText)}</span>
            <span class="stat-unit">${escapeHtml(unitText)}</span>
          </div>
        </div>
        <div class="stat-donut">
          <svg viewBox="0 0 64 64">
            <circle class="donut-bg" cx="32" cy="32" r="${DONUT_RADIUS}"/>
            <circle class="donut-fg" cx="32" cy="32" r="${DONUT_RADIUS}"
                    style="--donut-circ: ${DONUT_CIRC}; stroke-dasharray: ${DONUT_CIRC}; stroke: url(#${gradId})"
                    data-ratio="${item.ratio.toFixed(3)}"
                    data-delay="${(idx * 80 + 200)}"
                    transform="rotate(-90 32 32)"/>
          </svg>
          <span class="donut-center">${escapeHtml(donutCenter)}</span>
        </div>
      </div>
    `;
  }).join('');

  requestAnimationFrame(() => {
    grid.querySelectorAll('.donut-fg').forEach((el) => {
      const ratio = parseFloat(el.dataset.ratio || '0');
      const delay = parseInt(el.dataset.delay || '0', 10);
      const offset = DONUT_CIRC * (1 - ratio);
      el.style.strokeDashoffset = String(DONUT_CIRC);
      setTimeout(() => {
        el.style.strokeDashoffset = String(offset);
      }, delay);
    });
  });
}

function renderIndicators(flags) {
  const lang = state.lang;
  const list = document.getElementById('indicators-list');
  const countBadge = document.getElementById('indicators-count');
  const all = [
    ...flags.red.map((f) => ({ ...f, tone: 'red' })),
    ...flags.yellow.map((f) => ({ ...f, tone: 'yellow' }))
  ];
  if (countBadge) countBadge.textContent = String(all.length);
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
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
