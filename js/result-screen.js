/**
 * CEC Check-in - result-screen.js
 * Editorial light · Cormorant serif · stats list (Next Exchange-style)
 */

import { state } from './state.js';
import { t } from './translations.js';
import { formatHours } from './form-logic.js';

export function renderResult(evalResult) {
  const lang = state.lang;
  const screen = document.getElementById('screen-result');
  const hero = document.getElementById('hero-card');

  // Track tone applied on both the screen (for mini-header pill) and the hero fold
  screen.classList.remove('track-green', 'track-yellow', 'track-red');
  screen.classList.add(`track-${evalResult.color}`);
  if (hero) {
    hero.classList.remove('track-green', 'track-yellow', 'track-red');
    hero.classList.add(`track-${evalResult.color}`);
  }

  // Track pill
  const labelKey = evalResult.track === 'A' ? 'result.trackA' : 'result.trackB';
  document.getElementById('hero-track-label').textContent = t(lang, labelKey);

  // Messages
  document.getElementById('hero-message').textContent = t(lang, evalResult.messageKey);
  document.getElementById('hero-kindness').textContent = t(lang, evalResult.kindnessKey);

  // Date + discipline overlaid on the photo
  renderPhotoMeta();

  // Mini sticky header
  renderMiniHeader(evalResult);

  // Score (count up)
  renderReadiness(evalResult.score);

  // Today's plan card + 10-day tracker
  renderPlanCard(evalResult);
  renderTracker(evalResult);

  // Stats list
  renderStatsList();

  // Indicators
  renderIndicators(evalResult.flags);

  // Reset scroll position so user starts on the photo full-screen
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderMiniHeader(evalResult) {
  const lang = state.lang;
  const avatar = document.getElementById('mini-avatar');
  const nameEl = document.getElementById('mini-name');
  const scoreEl = document.getElementById('mini-score-value');
  const trackEl = document.getElementById('mini-track-pill');
  const raw = (state.athleteName || '').trim();
  if (avatar) avatar.textContent = raw ? raw.charAt(0).toUpperCase() : '—';
  if (nameEl) {
    const disc = state.discipline ? ` · ${t(lang, `landing.${state.discipline}`).toUpperCase()}` : '';
    nameEl.textContent = (raw ? raw.toUpperCase() : '—') + disc;
  }
  if (scoreEl) scoreEl.textContent = String(evalResult.score ?? 0);
  if (trackEl) trackEl.textContent = evalResult.track;
}

function renderPhotoMeta() {
  const lang = state.lang;
  const nameEl = document.getElementById('meta-name');
  const dateEl = document.getElementById('track-meta-date');
  const discEl = document.getElementById('track-meta-discipline');
  const discSep = document.getElementById('track-meta-discipline-sep');
  const raw = (state.athleteName || '').trim();
  if (nameEl) nameEl.textContent = raw ? raw.toUpperCase() : '—';
  if (dateEl) {
    const locale = lang === 'en' ? 'en-CA' : 'fr-CA';
    dateEl.textContent = new Date().toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short'
    }).toUpperCase().replace(/\.$/, '');
  }
  if (state.discipline && discEl && discSep) {
    discEl.textContent = t(lang, `landing.${state.discipline}`).toUpperCase();
    discEl.hidden = false;
    discSep.hidden = false;
  } else if (discEl && discSep) {
    discEl.hidden = true;
    discSep.hidden = true;
  }
}

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

function renderPlanCard(evalResult) {
  const lang = state.lang;
  const card = document.getElementById('plan-card');
  if (!card) return;

  const dayNum = document.getElementById('plan-day-num');
  const intensityEl = document.getElementById('plan-intensity');
  const blockTagEl = document.getElementById('plan-block-tag');
  const recoEl = document.getElementById('plan-reco');
  const amEl = document.getElementById('plan-am');
  const pmEl = document.getElementById('plan-pm');
  const noteEl = document.getElementById('plan-intensity-note');

  // Off-camp fallback (testing): show day 1 of the top-shape plan as a default preview
  let today = evalResult.today;
  let dayIdx = evalResult.dayIdx;
  if (!today) {
    today = evalResult.plan[0];
    dayIdx = 0; // signals "preview"
  }

  if (dayNum) dayNum.textContent = dayIdx ? String(dayIdx) : '—';
  const intensity = evalResult.adjustedIntensity ?? today.intensity;
  if (intensityEl) intensityEl.textContent = String(intensity);

  // Tag block
  const blockKey = today.blockKey || 'block.progressive';
  const tagText = t(lang, blockKey);
  if (blockTagEl) blockTagEl.textContent = tagText;
  // Set data-block attribute for tone variants (extract last segment of key)
  const blockSlug = blockKey.split('.').pop();
  card.setAttribute('data-block', blockSlug);

  // Recommendation
  if (recoEl) recoEl.textContent = t(lang, evalResult.adviceKey || 'reco.followPlan');

  // AM / PM activities
  if (amEl) amEl.textContent = today.am || '—';
  if (pmEl) pmEl.textContent = today.pm || '—';

  // Note: hide if not adjusted (intensity unchanged from plan)
  if (noteEl) {
    const adjusted = intensity !== today.intensity;
    noteEl.style.display = adjusted ? '' : 'none';
  }
}

function renderTracker(evalResult) {
  const lang = state.lang;
  const host = document.getElementById('tracker-chart');
  if (!host) return;

  const plan = evalResult.plan;
  const todayIdx = evalResult.dayIdx; // 1..10 or null
  const maxIntensity = 120; // cap for bar scaling

  const days = plan.map((row, i) => {
    const idx = i + 1;
    const isToday = idx === todayIdx;
    const heightPct = Math.min(100, (row.intensity / maxIntensity) * 100);
    const blockSlug = (row.blockKey || '').split('.').pop();
    return `
      <div class="tracker-day ${isToday ? 'today' : ''}" data-block="${blockSlug}">
        <div class="tracker-bar-wrap">
          <span class="tracker-pct">${row.intensity}%</span>
          <div class="tracker-bar" style="height:${heightPct.toFixed(1)}%; --bar-delay:${(i * 0.06).toFixed(2)}s"></div>
        </div>
        <span class="tracker-label">J${idx}</span>
      </div>
    `;
  }).join('');

  host.innerHTML = days;

  // Append legend if not present
  const card = document.getElementById('tracker-card');
  if (card && !card.querySelector('.tracker-legend')) {
    const legend = document.createElement('div');
    legend.className = 'tracker-legend';
    legend.innerHTML = `
      <span class="tracker-legend-item"><span class="tracker-legend-dot dot-load"></span>${escapeHtml(t(lang, 'block.progressive'))}</span>
      <span class="tracker-legend-item"><span class="tracker-legend-dot dot-overreach"></span>${escapeHtml(t(lang, 'block.overreach'))}</span>
      <span class="tracker-legend-item"><span class="tracker-legend-dot dot-taper"></span>${escapeHtml(t(lang, 'block.taper'))}</span>
      <span class="tracker-legend-item"><span class="tracker-legend-dot dot-off"></span>${escapeHtml(t(lang, 'block.off'))}</span>
    `;
    card.appendChild(legend);
  }
}

function renderStatsList() {
  const lang = state.lang;
  const list = document.getElementById('stats-list');
  if (!list) return;

  const items = [
    {
      labelKey: 'result.stat.sleep',
      value: state.sleep.durationHours,
      tone: toneFromSleep(state.sleep.durationHours),
      icon: 'Z',
      formatter: (v) => v ? formatHours(v, lang) : '—',
      unit: ''
    },
    {
      labelKey: 'result.stat.energy',
      value: state.wellbeing.energy,
      tone: toneFromLikert(state.wellbeing.energy),
      icon: 'E',
      formatter: (v) => v == null ? '—' : String(v),
      unit: '/5'
    },
    {
      labelKey: 'result.stat.muscles',
      value: state.wellbeing.muscles,
      tone: toneFromLikert(state.wellbeing.muscles),
      icon: 'M',
      formatter: (v) => v == null ? '—' : String(v),
      unit: '/5'
    },
    {
      labelKey: 'result.stat.forearms',
      value: state.wellbeing.forearms,
      tone: toneFromLikert(state.wellbeing.forearms),
      icon: 'F',
      formatter: (v) => v == null ? '—' : String(v),
      unit: '/5'
    },
    {
      labelKey: 'result.stat.calm',
      value: state.wellbeing.calm,
      tone: toneFromLikert(state.wellbeing.calm),
      icon: 'C',
      formatter: (v) => v == null ? '—' : String(v),
      unit: '/5'
    },
    {
      labelKey: 'result.stat.mood',
      value: state.wellbeing.mood,
      tone: toneFromLikert(state.wellbeing.mood),
      icon: 'H',
      formatter: (v) => v == null ? '—' : String(v),
      unit: '/5'
    },
    {
      labelKey: 'result.stat.willingness',
      value: state.wellbeing.willingness,
      tone: toneFromHigherIsBetter(state.wellbeing.willingness),
      icon: 'D',
      formatter: (v) => String(v),
      unit: '/10'
    },
    {
      labelKey: 'result.stat.recovery',
      value: state.wellbeing.recoveryPrs,
      tone: toneFromHigherIsBetter(state.wellbeing.recoveryPrs),
      icon: 'R',
      formatter: (v) => String(v),
      unit: '/10'
    }
  ];

  list.innerHTML = items.map((item) => {
    const valueText = item.formatter(item.value);
    return `
      <div class="stat-row tone-${item.tone}">
        <div class="stat-icon" aria-hidden="true"></div>
        <div class="stat-label">${escapeHtml(t(lang, item.labelKey))}</div>
        <div>
          <span class="stat-value">${escapeHtml(valueText)}</span><span class="stat-unit">${escapeHtml(item.unit)}</span>
        </div>
      </div>
    `;
  }).join('');
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
function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
