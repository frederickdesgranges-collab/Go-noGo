/**
 * CEC Check-in - main.js
 * Boot, landing → form → result flow, global events.
 */

import { state, loadPreferences, saveLang, saveCoachPhone, saveDiscipline, resetForm, saveAthleteName } from './state.js';
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
import { renderResult } from './result-screen.js';
import { sendToCoach } from './whatsapp.js';

let lastEvaluation = null;

function boot() {
  loadPreferences();

  buildLikertScales();
  wireFormControls();
  onAnyChange(() => updateProgressBar());

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
  document.getElementById('settings-open').addEventListener('click', openSettings);
  document.getElementById('settings-close').addEventListener('click', closeSettings);
  document.getElementById('settings-backdrop').addEventListener('click', closeSettings);
  document.getElementById('settings-save').addEventListener('click', saveSettings);
  document.getElementById('submit-btn').addEventListener('click', onSubmit);
  document.getElementById('whatsapp-btn').addEventListener('click', onSendWhatsapp);
  document.getElementById('edit-btn').addEventListener('click', goToFormScreen);
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

  // Pre-select previously chosen discipline
  if (state.discipline) {
    setActiveDiscipline(state.discipline);
  }

  document.querySelectorAll('.discipline-card').forEach((card) => {
    card.addEventListener('click', () => {
      const d = card.dataset.discipline;
      setActiveDiscipline(d);
      saveDiscipline(d);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    onLandingStart();
  });

  // Landing-only language toggle
  const landingLang = document.getElementById('landing-lang-toggle');
  if (landingLang) landingLang.addEventListener('click', toggleLanguage);
}

function setActiveDiscipline(d) {
  document.querySelectorAll('.discipline-card').forEach((card) => {
    const isActive = card.dataset.discipline === d;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });
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
  saveAthleteName(name);
  // Also seed the (hidden) form input value for downstream code that reads it
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
  document.getElementById('coach-phone').value = state.coachPhone || '';
  document.querySelectorAll('input[name="lang-pref"]').forEach((r) => {
    r.checked = r.value === state.lang;
  });
  modal.hidden = false;
}

function closeSettings() {
  document.getElementById('settings-modal').hidden = true;
}

function saveSettings() {
  const phoneInput = document.getElementById('coach-phone').value.replace(/\D+/g, '');
  saveCoachPhone(phoneInput);
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
  lastEvaluation = evaluate();
  goToResultScreen();
  renderResult(lastEvaluation);
}

function onSendWhatsapp() {
  if (!lastEvaluation) return;
  const ok = sendToCoach(lastEvaluation);
  if (!ok) {
    showToast(t(state.lang, 'whatsapp.noPhone'), 'error');
    openSettings();
  }
}

function goToFormScreen() {
  document.getElementById('screen-result').hidden = true;
  document.getElementById('screen-form').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
  backToLanding();
}

/* ============================================
   Scroll-driven hero choreography
   ============================================
   Phase 1 (0    → 0.22): photo full, score hidden
   Phase 2 (0.22 → 0.55): photo shrinks/fades, big score fades in
   Phase 3 (0.45 → 1.0):  mini-header slides down (overlaps with big score)
   Phase 4 (0.7  → 1.0):  big score fades out, mini stays sticky
   The mini-header now appears WHILE the big score is still visible,
   so the user always sees a score number on screen ("le score doit rester").
   ============================================ */
function wireScrollChoreography() {
  const photoCard = document.getElementById('hero-photo-card');
  const scoreStage = document.getElementById('hero-score-stage');
  const heroText = document.getElementById('hero-text-block');
  const scrollCue = document.getElementById('scroll-cue');
  const miniHeader = document.getElementById('mini-header');
  if (!photoCard || !scoreStage) return;

  let ticking = false;

  function update() {
    ticking = false;
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const range = vh * 1.2; // total scroll-distance for the full choreography
    const p = clamp01(sy / range);

    // Photo: scales down 1 → 0.55, opacity 1 → 0.05, drift up to -40px
    const scale = 1 - 0.45 * p;
    const photoOpacity = Math.max(0.05, 1 - 1.05 * p);
    photoCard.style.transform = `translateY(${(-40 * p).toFixed(1)}px) scale(${scale.toFixed(3)})`;
    photoCard.style.opacity = String(photoOpacity);

    // Big score: fades IN from 0.22 to 0.55, then OUT from 0.7 to 0.95
    const fadeIn = clamp01((p - 0.22) / 0.33);
    const fadeOut = 1 - clamp01((p - 0.7) / 0.25);
    const scoreOpacity = fadeIn * fadeOut;
    scoreStage.classList.toggle('visible', scoreOpacity > 0.05);
    scoreStage.style.opacity = String(scoreOpacity);
    // Subtle upward drift past the photo midpoint
    const scoreY = -50 * Math.max(0, p - 0.5);
    scoreStage.style.transform = `translateY(${scoreY.toFixed(1)}px)`;

    // Hero text (message + kindness) appears once big score is fading out
    if (heroText) heroText.classList.toggle('visible', p > 0.55);

    // Scroll cue
    if (scrollCue) scrollCue.classList.toggle('faded', p > 0.08);

    // Mini header: appears DURING phase 2 (around p = 0.45) so the
    // small score is on top of the screen by the time the big one
    // starts fading away. The mini stays sticky from there on.
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
