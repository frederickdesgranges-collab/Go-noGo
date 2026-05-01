/**
 * CEC Check-in - result-screen.js
 * Editorial light · Cormorant serif · stats list (Next Exchange-style)
 */

import { state, loadHistory, saveScore, todayDateKey, loadProgressionZoom, saveProgressionZoom } from './state.js';
import { t } from './translations.js';
import { formatHours } from './form-logic.js';
import { dayOfCamp } from './evaluation.js';

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

  // Persist today's score for the progression chart
  if (typeof evalResult.score === 'number') {
    saveScore(todayDateKey(), evalResult.score);
  }

  // Today's plan card + 10-day tracker + form progression chart
  renderPlanCard(evalResult);
  renderTracker(evalResult);
  renderProgression(evalResult);

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
  const avatarEl = document.getElementById('hero-meta-avatar');
  const raw = (state.athleteName || '').trim();
  if (avatarEl) avatarEl.textContent = raw ? raw.charAt(0).toUpperCase() : '—';
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

/**
 * Form-progression area chart over a continuous timeline.
 * Pannable horizontally inside .progression-scroll, zoom 1W / 1M / 3M
 * controls the px-per-day. Today's score is highlighted.
 */
const ZOOM_PX_PER_DAY = { '1W': 56, '1M': 16, '3M': 6 };

function renderProgression(evalResult) {
  const host = document.getElementById('progression-chart');
  const scroller = document.getElementById('progression-scroll');
  const summary = document.getElementById('progression-summary');
  const zoomBtns = document.querySelectorAll('.progression-zoom .zoom-btn');
  if (!host || !scroller) return;

  const lang = state.lang;
  const history = loadHistory();
  const todayKey = todayDateKey();
  const zoom = loadProgressionZoom();
  const pxPerDay = ZOOM_PX_PER_DAY[zoom] || ZOOM_PX_PER_DAY['1M'];

  // Sync zoom toggle UI
  zoomBtns.forEach((b) => {
    const active = b.dataset.zoom === zoom;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  // Wire zoom button clicks (idempotent)
  zoomBtns.forEach((b) => {
    if (b.dataset.bound === '1') return;
    b.dataset.bound = '1';
    b.addEventListener('click', () => {
      const z = b.dataset.zoom;
      saveProgressionZoom(z);
      renderProgression(evalResult); // re-render with new zoom
    });
  });

  // Build sorted points from the full history
  const recorded = Object.entries(history)
    .map(([d, score]) => ({ date: d, score }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Determine the date range to draw.
  // Anchor on today; pad enough on both sides so the user can scroll back/forward.
  const today = new Date(todayKey + 'T00:00:00');
  const past = recorded.length ? new Date(recorded[0].date + 'T00:00:00') : new Date(today);
  past.setDate(past.getDate() - 14);
  const future = new Date(today);
  future.setDate(future.getDate() + 14);
  const totalDays = Math.max(30, daysBetween(past, future) + 1);

  // SVG dimensions
  const W = totalDays * pxPerDay;
  const H = 200;
  const PAD_T = 18;
  const PAD_B = 32;
  const innerH = H - PAD_T - PAD_B;

  function dayOffset(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return daysBetween(past, d);
  }
  function px(dateStr) {
    return dayOffset(dateStr) * pxPerDay + pxPerDay / 2;
  }
  function py(score) {
    return PAD_T + (innerH - (score / 100) * innerH);
  }

  // Build line + area paths only using recorded points
  const recordedInRange = recorded.filter((p) => {
    const off = dayOffset(p.date);
    return off >= 0 && off < totalDays;
  });

  const linePath = [];
  recordedInRange.forEach((p, i) => {
    const x = px(p.date);
    const y = py(p.score);
    linePath.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  });

  const areaPath = recordedInRange.length
    ? `${linePath.join(' ')} L ${px(recordedInRange[recordedInRange.length - 1].date).toFixed(1)} ${(PAD_T + innerH).toFixed(1)} L ${px(recordedInRange[0].date).toFixed(1)} ${(PAD_T + innerH).toFixed(1)} Z`
    : '';

  // Reference lines at 50 and 75
  const ref50 = py(50);
  const ref75 = py(75);

  // Tick labels: choose granularity from zoom
  // 1W: every day; 1M: every ~4 days; 3M: every week
  const tickEvery = zoom === '1W' ? 1 : zoom === '1M' ? 4 : 7;
  const monthFmt = lang === 'en' ? 'en-CA' : 'fr-CA';

  let tickLabels = '';
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(past);
    d.setDate(past.getDate() + i);
    const isToday = sameDay(d, today);
    if (i % tickEvery !== 0 && !isToday) continue;
    const x = i * pxPerDay + pxPerDay / 2;
    const dayNum = d.getDate();
    const monthShort = d.toLocaleDateString(monthFmt, { month: 'short' }).replace(/\.$/, '');
    const isMonthStart = d.getDate() === 1 || (i === 0);
    const labelTxt = isMonthStart ? `${monthShort} ${dayNum}` : String(dayNum);
    tickLabels += `<text x="${x.toFixed(1)}" y="${(H - 8).toFixed(1)}" font-size="10" font-weight="${isToday ? 800 : 600}" text-anchor="middle" fill="${isToday ? '#A40517' : '#8a958f'}">${labelTxt}</text>`;
    if (isToday) {
      tickLabels += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${PAD_T}" y2="${(PAD_T + innerH).toFixed(1)}" stroke="rgba(216,6,33,0.18)" stroke-width="1.5" stroke-dasharray="3 3"/>`;
    }
  }

  // Dots
  const dots = recordedInRange.map((p) => {
    const x = px(p.date);
    const y = py(p.score);
    const isToday = p.date === todayKey;
    return `
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isToday ? 5.5 : 3.5}" fill="${isToday ? '#D80621' : '#143b2c'}" stroke="#fbfaf6" stroke-width="2"/>
      ${isToday ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="none" stroke="#D80621" stroke-width="1.5" opacity="0.45"/>` : ''}
    `;
  }).join('');

  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progression de la forme">
      <defs>
        <linearGradient id="progFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#2a6f47" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#2a6f47" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <line x1="0" x2="${W}" y1="${ref75.toFixed(1)}" y2="${ref75.toFixed(1)}" stroke="rgba(20,33,26,0.1)" stroke-dasharray="3 4"/>
      <line x1="0" x2="${W}" y1="${ref50.toFixed(1)}" y2="${ref50.toFixed(1)}" stroke="rgba(20,33,26,0.1)" stroke-dasharray="3 4"/>
      ${tickLabels}
      ${areaPath ? `<path d="${areaPath}" fill="url(#progFill)"/>` : ''}
      ${linePath.length ? `<path d="${linePath.join(' ')}" fill="none" stroke="#143b2c" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
      ${dots}
    </svg>
  `;

  // Auto-scroll so today is centered in the visible viewport
  requestAnimationFrame(() => {
    const todayOffset = dayOffset(todayKey);
    if (todayOffset < 0 || todayOffset >= totalDays) return;
    const todayX = todayOffset * pxPerDay + pxPerDay / 2;
    const viewportW = scroller.clientWidth;
    scroller.scrollLeft = Math.max(0, todayX - viewportW / 2);
  });

  // Summary stats over recorded history
  if (summary) {
    if (recorded.length === 0) {
      summary.innerHTML = `<span class="prog-empty">${escapeHtml(t(lang, 'result.progressionEmpty'))}</span>`;
    } else {
      const last = recorded[recorded.length - 1];
      const avg = Math.round(recorded.reduce((s, p) => s + p.score, 0) / recorded.length);
      const prev = recorded.length >= 2 ? recorded[recorded.length - 2].score : null;
      const delta = prev != null ? last.score - prev : null;
      const deltaStr = delta == null ? '' :
        delta > 0 ? `<span class="prog-delta up">▲ +${delta}</span>` :
        delta < 0 ? `<span class="prog-delta down">▼ ${delta}</span>` :
        `<span class="prog-delta flat">●</span>`;
      summary.innerHTML = `
        <div class="prog-stat">
          <span class="prog-stat-label">${escapeHtml(t(lang, 'result.progressionLast'))}</span>
          <span class="prog-stat-value">${last.score}/100</span>
          ${deltaStr}
        </div>
        <div class="prog-stat">
          <span class="prog-stat-label">${escapeHtml(t(lang, 'result.progressionAvg'))}</span>
          <span class="prog-stat-value">${avg}/100</span>
        </div>
        <div class="prog-stat">
          <span class="prog-stat-label">${escapeHtml(t(lang, 'result.progressionRecorded'))}</span>
          <span class="prog-stat-value">${recorded.length}</span>
        </div>
      `;
    }
  }
}

function daysBetween(a, b) {
  const ms = b - a;
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
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
