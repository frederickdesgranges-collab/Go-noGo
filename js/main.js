/**
 * CEC Check-in - main.js
 * Boot, landing → form → result flow, global events.
 */

import { state, loadPreferences, saveLang, saveCoachSheetUrl, saveDiscipline, saveProfile, resetForm, saveAthleteName, todayDateKey, normalizeText, getSubmitRecord, setSubmitRecord, saveScore } from './state.js';
import { applyTranslations, t } from './translations.js';
import {
  buildLikertScales,
  wireFormControls,
  validateForm,
  syncFormFromState,
  updateProgressBar,
  onAnyChange
} from './form-logic.js';
import { evaluate } from './evaluation.js';
import { renderResult, sendToCoachSheet, sendRefusalToSheet } from './result-screen.js';

let lastEvaluation = null;

function boot() {
  loadPreferences();

  buildLikertScales();
  wireFormControls();
  onAnyChange(() => {
    updateProgressBar();
    // Any tweak to the form invalidates the previous send/refuse, so the
    // buttons must come back online — that is the user's "modification"
    // gate for resubmitting. A stale status line is cleared too.
    unlockSendButtons();
    clearSendStatus();
  });

  applyTranslations(state.lang);
  syncFormFromState();
  refreshHeaderDate();
  refreshLangButton();
  updateProgressBar();

  wireGlobalEvents();
  wireLandingScreen();
  showLanding();
}

function wireGlobalEvents() {
  document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('settings-backdrop').addEventListener('click', closeSettings);
  document.getElementById('settings-save').addEventListener('click', saveSettings);
  document.getElementById('submit-btn').addEventListener('click', onSubmit);
  document.getElementById('confirm-btn').addEventListener('click', onSendToCoach);
  document.getElementById('refuse-btn').addEventListener('click', onRefuseSend);
  document.getElementById('restart-btn').addEventListener('click', restart);

  const scrollCue = document.getElementById('scroll-cue');
  if (scrollCue) {
    scrollCue.addEventListener('click', () => {
      const details = document.getElementById('result-details');
      if (details) details.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Scroll-driven hero choreography
  wireScrollChoreography();

  // Form section scroll-reveal + watermark parallax
  wireSectionParallax();

  // Progression chart: drag-to-pan for desktop (touch already works via overflow-x)
  wireProgressionDrag();

  // Reveal details when they enter the viewport
  const detailsEl = document.getElementById('result-details');
  if (detailsEl && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          detailsEl.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    io.observe(detailsEl);
  } else if (detailsEl) {
    detailsEl.classList.add('visible');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });
}

/* ============================================
   Landing screen
   ============================================ */
function wireLandingScreen() {
  const form = document.getElementById('landing-form');
  const nameInput = document.getElementById('landing-athlete-name');
  if (state.athleteName) nameInput.value = state.athleteName;

  if (state.discipline) setActiveDiscipline(state.discipline);
  if (state.profile) setActiveProfile(state.profile);

  document.querySelectorAll('.discipline-card').forEach((card) => {
    card.addEventListener('click', () => {
      const d = card.dataset.discipline;
      setActiveDiscipline(d);
      saveDiscipline(d);
    });
  });

  document.querySelectorAll('.profile-card').forEach((card) => {
    card.addEventListener('click', () => {
      const p = card.dataset.profile;
      setActiveProfile(p);
      saveProfile(p);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onLandingStart();
  });

  const landingLang = document.getElementById('landing-lang-toggle');
  if (landingLang) landingLang.addEventListener('click', toggleLanguage);

  // Smooth scroll cue → signin section
  const cue = document.getElementById('parallax-scroll-cue');
  if (cue) {
    cue.addEventListener('click', () => {
      const target = document.getElementById('signin-section');
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  }

  wireParallax();
}

function setActiveDiscipline(d) {
  document.querySelectorAll('.discipline-card').forEach((card) => {
    const isActive = card.dataset.discipline === d;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}

function setActiveProfile(p) {
  document.querySelectorAll('.profile-card').forEach((card) => {
    const isActive = card.dataset.profile === p;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
}

/**
 * Parallax scroll listener. Landing now flows in the document, so we
 * listen on window scroll. CSS layers compensate via translateY(--pscroll
 * * factor). Bigger factor = layer appears slower (lags = depth).
 */
function wireParallax() {
  const screen = document.getElementById('screen-landing');
  const stage = document.getElementById('parallax-stage');
  if (!screen || !stage) return;
  let ticking = false;

  function update() {
    ticking = false;
    const sy = window.scrollY || document.documentElement.scrollTop || 0;
    const stageH = stage.offsetHeight || window.innerHeight;
    const fade = Math.max(0, 1 - sy / (stageH * 0.7));
    screen.style.setProperty('--pscroll', `${sy}px`);
    screen.style.setProperty('--pscroll-fade', String(fade));
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

function onLandingStart() {
  const nameInput = document.getElementById('landing-athlete-name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.classList.remove('invalid');
    void nameInput.offsetWidth;
    nameInput.classList.add('invalid');
    nameInput.focus();
    showToast(t(state.lang, 'landing.missingName'), 'error');
    return;
  }
  if (!state.discipline) {
    showToast(t(state.lang, 'landing.missingDiscipline'), 'error');
    return;
  }
  if (!state.profile) {
    showToast(t(state.lang, 'landing.missingProfile'), 'error');
    return;
  }
  saveAthleteName(name);
  const hiddenName = document.getElementById('athlete-name');
  if (hiddenName) hiddenName.value = name;

  transitionLandingToForm();
}

function showLanding() {
  const landing = document.getElementById('screen-landing');
  const form = document.getElementById('screen-form');
  const result = document.getElementById('screen-result');
  if (landing) landing.hidden = false;
  if (form) form.hidden = true;
  if (result) result.hidden = true;
}

function transitionLandingToForm() {
  const landing = document.getElementById('screen-landing');
  const form = document.getElementById('screen-form');
  if (!landing || !form) return;
  landing.classList.add('exiting');
  // After the photo zoom and content fade, hide landing and reveal form
  setTimeout(() => {
    landing.hidden = true;
    landing.classList.remove('exiting');
    form.hidden = false;
    form.classList.add('entering-from-landing');
    setTimeout(() => form.classList.remove('entering-from-landing'), 1000);
    syncFormFromState();
    refreshHeaderDate();
    updateProgressBar();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, 700);
}

function backToLanding() {
  const landing = document.getElementById('screen-landing');
  const form = document.getElementById('screen-form');
  const result = document.getElementById('screen-result');
  if (landing) landing.hidden = false;
  if (form) form.hidden = true;
  if (result) result.hidden = true;
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ============================================
   Language
   ============================================ */
function toggleLanguage() {
  const next = state.lang === 'fr' ? 'en' : 'fr';
  saveLang(next);
  applyTranslations(next);
  refreshHeaderDate();
  refreshLangButton();
  if (lastEvaluation && !document.getElementById('screen-result').hidden) {
    renderResult(lastEvaluation);
  }
  syncFormFromState();
}

function refreshLangButton() {
  const code = state.lang.toUpperCase();
  const headerEl = document.getElementById('lang-code');
  if (headerEl) headerEl.textContent = code;
  const landingEl = document.getElementById('landing-lang-code');
  if (landingEl) landingEl.textContent = code;
}

function refreshHeaderDate() {
  const locale = state.lang === 'en' ? 'en-CA' : 'fr-CA';
  const formatted = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const el = document.getElementById('header-date');
  if (el) el.textContent = formatted;
}

/* ============================================
   Settings modal
   ============================================ */
function openSettings() {
  const modal = document.getElementById('settings-modal');
  const sheetEl = document.getElementById('coach-sheet-url');
  if (sheetEl) sheetEl.value = state.coachSheetUrl || '';
  document.querySelectorAll('input[name="lang-pref"]').forEach((r) => {
    r.checked = r.value === state.lang;
  });
  modal.hidden = false;
}

function closeSettings() {
  document.getElementById('settings-modal').hidden = true;
}

function saveSettings() {
  const sheetEl = document.getElementById('coach-sheet-url');
  saveCoachSheetUrl(sheetEl ? sheetEl.value : '');
  const langInput = document.querySelector('input[name="lang-pref"]:checked');
  if (langInput && langInput.value !== state.lang) {
    saveLang(langInput.value);
    applyTranslations(state.lang);
    refreshHeaderDate();
    refreshLangButton();
    syncFormFromState();
  }
  showToast(t(state.lang, 'settings.saved'), 'success');
  closeSettings();
}

/* ============================================
   Form submit / result
   ============================================ */
function onSubmit() {
  const validation = validateForm();
  if (!validation.ok) {
    showToast(validation.message, 'error');
    if (validation.focus) {
      validation.focus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  const now = Date.now();
  const dayKey = todayDateKey();
  const athleteKey = normalizeText(state.athleteName || '');

  // Eval lock: once a result has been committed today within the window,
  // do NOT re-evaluate. The athlete can still browse / edit the form, but
  // cannot re-roll the score by tweaking answers — that is the whole point
  // of the lock. Fails open when athlete name is empty or storage unusable.
  if (athleteKey) {
    const rec = getSubmitRecord(dayKey, athleteKey);
    if (rec && rec.lastEvalTs && (now - rec.lastEvalTs) < RESUBMIT_LOCK_MINUTES * 60 * 1000) {
      const minLeft = Math.ceil((RESUBMIT_LOCK_MINUTES * 60000 - (now - rec.lastEvalTs)) / 60000);
      const msg = t(state.lang, 'result.evalLocked').replace('{min}', String(minLeft));
      if (lastEvaluation) {
        // Athlete has an in-memory result already — bring them back to it
        // with a status line so they see the lock is real.
        goToResultScreen();
        renderResult(lastEvaluation);
        showSendStatus(msg, 'error');
      } else {
        // No result loaded this session (e.g. page reload) — toast on form.
        showToast(msg, 'error');
      }
      return;
    }
  }

  lastEvaluation = evaluate();

  // Persist the eval moment so a later Submit within the window is blocked.
  // Preserve any existing send-related fields (count / lastTs).
  if (athleteKey) {
    const prev = getSubmitRecord(dayKey, athleteKey) || {};
    setSubmitRecord(dayKey, athleteKey, {
      count: prev.count || 0,
      lastTs: prev.lastTs || 0,
      lastEvalTs: now
    });
  }

  // Fresh result view: buttons enabled, no stale status line. The 10-min
  // lock also applies when the athlete taps send (see onSendToCoach).
  unlockSendButtons();
  clearSendStatus();
  goToResultScreen();
  renderResult(lastEvaluation);
}

let formSentForThisCheckin = false;
// Tracked separately so a Refuse can still be followed by an actual Send if
// the athlete changes their mind. Only Confirm definitively closes both.
let formRefusedForThisCheckin = false;

// TUNABLE: how long (minutes) before the same athlete may resend on the
// same day. Deters "re-answer until green". Device-clock based, so it is
// a deterrent, not tamper-proof — and it will also block a legitimate
// correction inside the window. Accepted trade-off for a safety tool.
const RESUBMIT_LOCK_MINUTES = 10;

function onSendToCoach() {
  if (!lastEvaluation) return;
  if (formSentForThisCheckin) return;
  // One athlete-driven action: POST the full check-in to the staff
  // dashboard Google Sheet. No private athlete↔coach channel.
  if (!state.coachSheetUrl) {
    showToast(t(state.lang, 'result.noConfig'), 'error');
    openSettings();
    return;
  }

  const now = Date.now();
  const dayKey = todayDateKey();
  const athleteKey = normalizeText(state.athleteName || '');

  // Default meta = first submission. Only refined when we have an athlete
  // key AND a working storage record (fail open otherwise).
  let submitMeta = { count: 1, isResubmit: false };

  if (athleteKey) {
    const rec = getSubmitRecord(dayKey, athleteKey); // { count, lastTs } | null
    if (rec && rec.lastTs && (now - rec.lastTs) < RESUBMIT_LOCK_MINUTES * 60 * 1000) {
      // Inside the lock window: block the network send entirely.
      const minLeft = Math.ceil((RESUBMIT_LOCK_MINUTES * 60000 - (now - rec.lastTs)) / 60000);
      const msg = t(state.lang, 'result.resubmitLocked').replace('{min}', String(minLeft));
      unlockSendButtons(); // keep the button usable for a later legit retry
      showSendStatus(msg, 'error');
      return;
    }
    const prevCount = (rec && rec.count) || 0;
    submitMeta = { count: prevCount + 1, isResubmit: prevCount >= 1 };
    setSubmitRecord(dayKey, athleteKey, {
      count: submitMeta.count,
      lastTs: now,
      // Preserve the eval-lock moment so it isn't reset by a send.
      lastEvalTs: (rec && rec.lastEvalTs) || now
    });
  }

  sendToCoachSheet(lastEvaluation, submitMeta);
  // Mark today's history row as submitted (merge upsert: keeps score/track/color).
  saveScore(dayKey, { status: 'submitted', sentAt: now });
  lockSendButtons();
  if (submitMeta.isResubmit) {
    showSendStatus(
      t(state.lang, 'result.resubmitRecorded').replace('{n}', String(submitMeta.count)),
      'success'
    );
  } else {
    showToast(t(state.lang, 'result.sentToast'), 'success');
  }
}

function onRefuseSend() {
  // A definitive send overrides everything; do not let refuse run after send.
  if (formSentForThisCheckin) return;
  // Don't allow double-refuse (would just spam anonymous rows).
  if (formRefusedForThisCheckin) return;
  if (!state.coachSheetUrl) {
    showToast(t(state.lang, 'result.noConfig'), 'error');
    openSettings();
    return;
  }
  sendRefusalToSheet();
  saveScore(todayDateKey(), { status: 'refused', refusedAt: Date.now() });
  // ONLY the refuse button locks. The athlete can still change their mind
  // and tap "Envoyer aux coachs" afterwards — the inline status line nudges
  // them that the option is still on the table.
  lockRefuseButtonOnly();
  showSendStatus(t(state.lang, 'result.refusedHint'), 'success');
  showToast(t(state.lang, 'result.refusedToast'), 'success');
}

// Sent is definitive — both buttons go offline.
function lockSendButtons() {
  formSentForThisCheckin = true;
  formRefusedForThisCheckin = true; // refuse no longer relevant once sent
  const confirmBtn = document.getElementById('confirm-btn');
  const refuseBtn = document.getElementById('refuse-btn');
  if (confirmBtn) confirmBtn.disabled = true;
  if (refuseBtn) refuseBtn.disabled = true;
}

// Refuse-only lock: confirm stays usable so a mind-change can still send.
function lockRefuseButtonOnly() {
  formRefusedForThisCheckin = true;
  const refuseBtn = document.getElementById('refuse-btn');
  if (refuseBtn) refuseBtn.disabled = true;
}

function unlockSendButtons() {
  formSentForThisCheckin = false;
  formRefusedForThisCheckin = false;
  const confirmBtn = document.getElementById('confirm-btn');
  const refuseBtn = document.getElementById('refuse-btn');
  if (confirmBtn) confirmBtn.disabled = false;
  if (refuseBtn) refuseBtn.disabled = false;
}

/**
 * Inline, persistent status line under the send buttons (role=status,
 * aria-live=polite). Used for the resubmit-lock notice and the
 * resubmission-recorded confirmation. Non-blocking — never alert().
 */
function showSendStatus(message, kind) {
  const el = document.getElementById('send-status');
  if (!el) return;
  el.textContent = message;
  el.classList.remove('is-error', 'is-success');
  if (kind === 'error') el.classList.add('is-error');
  else if (kind === 'success') el.classList.add('is-success');
  el.hidden = false;
}

function clearSendStatus() {
  const el = document.getElementById('send-status');
  if (!el) return;
  el.textContent = '';
  el.classList.remove('is-error', 'is-success');
  el.hidden = true;
}

function goToResultScreen() {
  document.getElementById('screen-form').hidden = true;
  const screen = document.getElementById('screen-result');
  screen.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restart() {
  resetForm();
  document.querySelectorAll('.likert .likert-btn.active').forEach((b) => {
    b.classList.remove('active');
    b.setAttribute('aria-checked', 'false');
  });
  syncFormFromState();
  updateProgressBar();
  unlockSendButtons();
  clearSendStatus();
  backToLanding();
}

/* ============================================
   Scroll-driven mini-header reveal
   No more photo choreography — the score is the immediate hero.
   We just slide the sticky compact summary down once the user
   scrolls past the hero card.
   ============================================ */
function wireScrollChoreography() {
  const hero = document.getElementById('hero-card');
  const scrollCue = document.getElementById('scroll-cue');
  const miniHeader = document.getElementById('mini-header');
  if (!hero) return;

  let ticking = false;
  function update() {
    ticking = false;
    const sy = window.scrollY;
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const p = clamp01(sy / (heroHeight * 0.55));

    if (scrollCue) scrollCue.classList.toggle('faded', p > 0.08);
    if (miniHeader) miniHeader.classList.toggle('visible', p > 0.45);
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

function clamp01(v) { return Math.max(0, Math.min(1, v)); }

/**
 * Make the progression timeline pannable with mouse drag (touch
 * already works via native overflow-x: auto + -webkit-overflow-scrolling).
 */
function wireProgressionDrag() {
  const scroller = document.getElementById('progression-scroll');
  if (!scroller) return;
  let down = false;
  let startX = 0;
  let startScroll = 0;

  scroller.addEventListener('mousedown', (e) => {
    down = true;
    startX = e.pageX;
    startScroll = scroller.scrollLeft;
    scroller.style.cursor = 'grabbing';
    scroller.style.userSelect = 'none';
  });
  ['mouseup', 'mouseleave'].forEach((ev) => scroller.addEventListener(ev, () => {
    down = false;
    scroller.style.cursor = '';
    scroller.style.userSelect = '';
  }));
  scroller.addEventListener('mousemove', (e) => {
    if (!down) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    scroller.scrollLeft = startScroll - dx;
  });
}

/**
 * Form section reveal-on-scroll + parallax on the giant letter watermark.
 * Each .section-card-premium fades up when ~20% in view, and its
 * watermark gets a per-section CSS variable (--section-shift) tied to
 * its position relative to the viewport — drives a slow vertical drift
 * via translate3d in CSS.
 */
function wireSectionParallax() {
  const sections = document.querySelectorAll('.section-card-premium');
  if (!sections.length) return;

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    sections.forEach((s) => io.observe(s));
  } else {
    sections.forEach((s) => s.classList.add('in-view'));
  }

  let ticking = false;
  function updateParallax() {
    ticking = false;
    const vh = window.innerHeight;
    const center = vh / 2;
    sections.forEach((s) => {
      const rect = s.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const shift = sectionCenter - center; // px from viewport center
      s.style.setProperty('--section-shift', `${shift.toFixed(0)}px`);
    });
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  updateParallax();
}

/* ============================================
   Toast
   ============================================ */
let toastTimer = null;
function showToast(message, kind = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';
  if (kind === 'error') toast.classList.add('toast-error');
  else if (kind === 'success') toast.classList.add('toast-success');
  toast.hidden = false;
  void toast.offsetWidth;
  toast.classList.add('visible');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => { toast.hidden = true; }, 250);
  }, 3200);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
