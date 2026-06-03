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

  // Persist today's full result for the progression chart
  if (typeof evalResult.score === 'number') {
    saveScore(todayDateKey(), {
      score: evalResult.score,
      track: evalResult.track,
      color: evalResult.color
    });
  }

  // Today's plan card + 10-day tracker + form progression chart
  renderPlanCard(evalResult);
  renderTracker(evalResult);
  renderProgression(evalResult);

  // Stats list
  renderStatsList();

  // Indicators
  renderIndicators(evalResult.flags);

  // Physio request banner — shown in parallel with the verdict, never replaces it.
  const banner = document.getElementById('physio-banner');
  if (banner) banner.hidden = !evalResult.physioRequest;

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

  // Build sorted points from the full history.
  // History entries may be either a plain number (legacy) or
  // { score, track, color } objects.
  const recorded = Object.entries(history)
    .map(([d, raw]) => {
      const entry = typeof raw === 'number'
        ? { score: raw, track: null, color: null }
        : { score: raw?.score ?? 0, track: raw?.track ?? null, color: raw?.color ?? null };
      return { date: d, ...entry };
    })
    .filter((p) => typeof p.score === 'number')
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
  const H = 220;
  const PAD_T = 38; // extra room for the CAMP / ARCO event ribbons
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

  // Reference threshold line at 75 (Track A / Track B boundary)
  const TRACK_THRESHOLD = 75;
  const refThreshold = py(TRACK_THRESHOLD);
  const ref50 = py(50);
  const ref75 = refThreshold;

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

  // Dot color comes from the actual Track decision (A/B + tone), not the
  // raw score. A high score with a yellow flag is still Track B and
  // must show as such on the chart. Legacy entries with no track fall
  // back to a neutral dark green.
  function dotFill(p) {
    if (p.track === 'A') return '#2a6f47';            // Track A · forest green
    if (p.track === 'B' && p.color === 'yellow') return '#c2410c'; // Track B yellow · burnt orange
    if (p.track === 'B' && p.color === 'red') return '#b91c1c';    // Track B red
    if (p.track === 'B') return '#b91c1c';
    return '#143b2c';                                  // legacy / unknown
  }

  const dots = recordedInRange.map((p) => {
    const x = px(p.date);
    const y = py(p.score);
    const isToday = p.date === todayKey;
    const fill = dotFill(p);
    return `
      <g class="prog-dot" data-date="${p.date}" data-score="${p.score}" data-track="${p.track || ''}" data-tone="${p.color || ''}">
        <circle class="prog-hit" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="14" fill="transparent" pointer-events="all" style="cursor:pointer"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${isToday ? 5.5 : 4}" fill="${fill}" stroke="#fbfaf6" stroke-width="2"/>
        ${isToday ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="none" stroke="${fill}" stroke-width="1.5" opacity="0.5"/>` : ''}
      </g>
    `;
  }).join('');

  // Zone backgrounds: green above the threshold (Track A) / red below (Track B)
  const zoneGreenH = (refThreshold - PAD_T).toFixed(1);
  const zoneRedH = (PAD_T + innerH - refThreshold).toFixed(1);

  // Event ribbons: CAMP (Jul 5-13) and ARCO (Jul 14-25), both 2026
  const events = [
    { id: 'camp', start: '2026-07-05', end: '2026-07-13', labelKey: 'result.eventCamp' },
    { id: 'arco', start: '2026-07-14', end: '2026-07-25', labelKey: 'result.eventArco' }
  ];

  function bandX(dateStr, edge = 'start') {
    const off = dayOffset(dateStr);
    return edge === 'start'
      ? off * pxPerDay
      : (off + 1) * pxPerDay;
  }

  const eventBands = events.map((ev) => {
    const off1 = dayOffset(ev.start);
    const off2 = dayOffset(ev.end);
    if (off2 < 0 || off1 > totalDays) return ''; // out of range
    const x1 = Math.max(0, bandX(ev.start, 'start'));
    const x2 = Math.min(W, bandX(ev.end, 'end'));
    const w = x2 - x1;
    if (w <= 0) return '';
    const cx = x1 + w / 2;
    const labelText = t(lang, ev.labelKey).toUpperCase();
    return `
      <g class="event-band event-${ev.id}">
        <rect x="${x1.toFixed(1)}" y="6" width="${w.toFixed(1)}" height="22" rx="6" fill="var(--event-fill-${ev.id})" stroke="var(--event-stroke-${ev.id})" stroke-width="1"/>
        <text x="${cx.toFixed(1)}" y="21" font-size="10.5" font-weight="800" letter-spacing="0.22em" text-anchor="middle" fill="var(--event-text-${ev.id})">${labelText}</text>
        <line x1="${x1.toFixed(1)}" x2="${x1.toFixed(1)}" y1="28" y2="${(PAD_T + innerH).toFixed(1)}" stroke="var(--event-stroke-${ev.id})" stroke-width="1" stroke-dasharray="2 4" opacity="0.55"/>
        <line x1="${x2.toFixed(1)}" x2="${x2.toFixed(1)}" y1="28" y2="${(PAD_T + innerH).toFixed(1)}" stroke="var(--event-stroke-${ev.id})" stroke-width="1" stroke-dasharray="2 4" opacity="0.55"/>
      </g>
    `;
  }).join('');

  host.innerHTML = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Progression de la forme">
      <defs>
        <linearGradient id="progFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#143b2c" stop-opacity="0.0"/>
          <stop offset="100%" stop-color="#143b2c" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="zoneGreen" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#2a6f47" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#2a6f47" stop-opacity="0.06"/>
        </linearGradient>
        <linearGradient id="zoneRed" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#b91c1c" stop-opacity="0.07"/>
          <stop offset="100%" stop-color="#b91c1c" stop-opacity="0.22"/>
        </linearGradient>
      </defs>

      <!-- Event ribbons (CAMP / ARCO) at the top of the chart -->
      ${eventBands}

      <!-- Track A green zone above the threshold -->
      <rect x="0" y="${PAD_T}" width="${W}" height="${zoneGreenH}" fill="url(#zoneGreen)"/>
      <!-- Track B red zone below the threshold -->
      <rect x="0" y="${refThreshold.toFixed(1)}" width="${W}" height="${zoneRedH}" fill="url(#zoneRed)"/>

      <!-- Threshold line + Track A label on the right -->
      <line x1="0" x2="${W}" y1="${refThreshold.toFixed(1)}" y2="${refThreshold.toFixed(1)}" stroke="rgba(20,33,26,0.32)" stroke-width="1" stroke-dasharray="5 5"/>
      <line x1="0" x2="14" y1="${refThreshold.toFixed(1)}" y2="${refThreshold.toFixed(1)}" stroke="#143b2c" stroke-width="2"/>

      ${tickLabels}

      <!-- Score line on top -->
      ${linePath.length ? `<path d="${linePath.join(' ')}" fill="none" stroke="#143b2c" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>` : ''}
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

  // Wire click on each dot → show a tooltip with the date, score and track
  wireProgressionDotTooltips(host);

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

/**
 * Click on a dot → DOM tooltip floating next to it with the date,
 * score and Track. Re-bound on every render.
 */
function wireProgressionDotTooltips(chartHost) {
  const card = document.getElementById('progression-card');
  if (!card) return;
  // Ensure a singleton tooltip element exists in the card
  let tip = card.querySelector('.prog-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'prog-tooltip';
    tip.hidden = true;
    card.appendChild(tip);
  }

  function close() {
    tip.hidden = true;
    tip.classList.remove('visible');
    tip.dataset.openDate = '';
  }

  function show(target) {
    const lang = state.lang;
    const date = target.dataset.date;
    const score = target.dataset.score;
    const track = target.dataset.track || '';
    const tone = target.dataset.tone || '';
    const dateObj = new Date(date + 'T00:00:00');
    const locale = lang === 'en' ? 'en-CA' : 'fr-CA';
    const dateLabel = dateObj.toLocaleDateString(locale, {
      weekday: 'short', day: 'numeric', month: 'short'
    }).toUpperCase().replace(/\.,?$/g, '');

    const trackLabelKey = track === 'A' ? 'result.trackA' : 'result.trackB';
    const trackText = track ? t(lang, trackLabelKey) : '—';
    const dotClass = track === 'A' ? 'tip-dot-green'
      : (tone === 'yellow' ? 'tip-dot-orange'
      : tone === 'red' ? 'tip-dot-red' : 'tip-dot-neutral');

    tip.innerHTML = `
      <div class="prog-tooltip-date">${escapeHtml(dateLabel)}</div>
      <div class="prog-tooltip-row">
        <span class="prog-tooltip-score">${escapeHtml(score)}</span>
        <span class="prog-tooltip-suffix">/100</span>
      </div>
      <div class="prog-tooltip-track">
        <span class="tip-dot ${dotClass}"></span>${escapeHtml(trackText)}
      </div>
    `;

    // Position the tip near the clicked dot, inside the card
    const cardRect = card.getBoundingClientRect();
    const dotRect = target.getBoundingClientRect();
    const left = dotRect.left + dotRect.width / 2 - cardRect.left;
    const top = dotRect.top - cardRect.top - 8;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.hidden = false;
    tip.dataset.openDate = date;
    requestAnimationFrame(() => tip.classList.add('visible'));
  }

  chartHost.querySelectorAll('.prog-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      // Toggle: if the tooltip is already open for this same dot, close it.
      if (!tip.hidden && tip.dataset.openDate === dot.dataset.date) {
        close();
        return;
      }
      show(dot);
    });
  });

  // Click on the card outside any dot → close. Click outside the card → close.
  if (!card.dataset.tipBound) {
    card.dataset.tipBound = '1';
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.prog-dot')) close();
    });
    document.addEventListener('click', (e) => {
      if (!card.contains(e.target)) close();
    });
  }
}

/**
 * Best-effort POST of the daily check-in to the coach's Google Apps
 * Script web app. Uses a "simple" text/plain body so the request is
 * preflight-free (no CORS) and the script can JSON.parse it as
 * e.postData.contents server-side. We don't need the response —
 * everything is fire-and-forget so a network blip never blocks the
 * athlete's UX.
 */
export function sendToCoachSheet(evalResult) {
  const url = state.coachSheetUrl;
  if (!url) return;
  const today = new Date();
  const payload = {
    timestamp: today.toISOString(),
    date: todayDateKey(today),
    athlete: state.athleteName || '',
    discipline: state.discipline || '',
    profile: state.profile || '',
    score: evalResult.score,
    track: evalResult.track,
    color: evalResult.color,
    physioRequest: !!evalResult.physioRequest,
    dayOfCamp: evalResult.dayIdx ?? '',
    sleepHours: state.sleep?.durationHours ?? '',
    sleepBedtime: state.sleep?.bedtime ?? '',
    sleepWake: state.sleep?.wake ?? '',
    sleepQuality: state.sleep?.quality ?? '',
    sleepWakings: state.sleep?.wakings ?? '',
    energy: state.wellbeing?.energy ?? '',
    muscles: state.wellbeing?.muscles ?? '',
    forearms: state.wellbeing?.forearms ?? '',
    calm: state.wellbeing?.calm ?? '',
    mood: state.wellbeing?.mood ?? '',
    willingness: state.wellbeing?.willingness ?? '',
    recoveryPrs: state.wellbeing?.recoveryPrs ?? '',
    prevSessionIntensity: state.wellbeing?.prevSessionIntensity ?? '',
    painFingers: state.pain?.fingers ?? '',
    painForearm: state.pain?.forearm ?? '',
    painElbow: state.pain?.elbow ?? '',
    painShoulders: state.pain?.shoulders ?? '',
    painBack: state.pain?.back ?? '',
    painSkin: state.pain?.skin ?? '',
    painOther: state.pain?.other ?? '',
    wantsPhysio: !!state.pain?.wantsPhysio,
    fuelScore: state.hydration?.fuelScore ?? '',
    note: state.hydration?.note ?? '',
    flagsRed: (evalResult.flags?.red || []).map((f) => f.key).join('|'),
    flagsYellow: (evalResult.flags?.yellow || []).map((f) => f.key).join('|')
  };

  try {
    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => { /* silent */ });
  } catch (_) { /* silent */ }
}

/**
 * Send an anonymous refusal marker: only date, timestamp and the word
 * "refusé". The coach team sees that someone declined to share their
 * check-in today; the athlete identity is intentionally omitted.
 */
export function sendRefusalToSheet() {
  const url = state.coachSheetUrl;
  if (!url) return;
  const today = new Date();
  const payload = {
    timestamp: today.toISOString(),
    date: todayDateKey(today),
    status: 'refusé'
  };
  try {
    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => { /* silent */ });
  } catch (_) { /* silent */ }
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
    },
    {
      labelKey: 'result.stat.prevIntensity',
      value: state.wellbeing.prevSessionIntensity,
      tone: toneFromIntensity(state.wellbeing.prevSessionIntensity),
      icon: 'I',
      formatter: (v) => String(v),
      unit: '/5'
    },
    {
      labelKey: 'result.stat.fuel',
      value: state.hydration.fuelScore,
      tone: toneFromFuel(state.hydration.fuelScore),
      icon: 'N',
      formatter: (v) => v == null ? '—' : String(v),
      unit: '/5'
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
function toneFromIntensity(v) {
  if (v == null) return 'blue';
  if (v >= 5) return 'red';
  if (v >= 4) return 'yellow';
  return 'green';
}
function toneFromFuel(v) {
  if (v == null) return 'blue';
  if (v <= 1) return 'red';
  if (v === 2) return 'yellow';
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
