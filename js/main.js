/**
 * CEC Check-in - main.js
 * Boot, global event wiring, screen transitions.
 */

import { state, loadPreferences, saveLang, saveCoachPhone, resetForm } from './state.js';
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

  // Build dynamic UI parts before applying translations so labels are present.
  buildLikertScales();
  wireFormControls();
  onAnyChange(() => updateProgressBar());

  applyTranslations(state.lang);
  syncFormFromState();
  refreshHeaderDate();
  refreshLangButton();
  updateProgressBar();

  wireGlobalEvents();
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettings();
  });
}

function toggleLanguage() {
  const next = state.lang === 'fr' ? 'en' : 'fr';
  saveLang(next);
  applyTranslations(next);
  refreshHeaderDate();
  refreshLangButton();
  // Re-render result if visible (translated copy)
  if (lastEvaluation && !document.getElementById('screen-result').hidden) {
    renderResult(lastEvaluation);
  }
  syncFormFromState();
}

function refreshLangButton() {
  document.getElementById('lang-code').textContent = state.lang.toUpperCase();
}

function refreshHeaderDate() {
  const locale = state.lang === 'en' ? 'en-CA' : 'fr-CA';
  const formatted = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  document.getElementById('header-date').textContent = formatted;
}

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
  goToFormScreen();
}

let toastTimer = null;
function showToast(message, kind = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast';
  if (kind === 'error') toast.classList.add('toast-error');
  else if (kind === 'success') toast.classList.add('toast-success');
  toast.hidden = false;
  // Force reflow so the transition runs
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
