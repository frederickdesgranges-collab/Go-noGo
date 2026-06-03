/**
 * CEC Check-in - whatsapp.js
 * Build a formatted check-in message, copy it to the clipboard, and
 * open the shared coach team WhatsApp group so the athlete can paste it.
 * Going through a group invite link (not a phone number) keeps the
 * exchange visible to every coach — règle de trois.
 */

import { state } from './state.js';
import { t } from './translations.js';
import { formatHours } from './form-logic.js';

const TRACK_EMOJI = {
  green: '🟢',
  yellow: '🟡',
  red: '🔴'
};

/**
 * Build the WhatsApp message text from the current state and evaluation.
 */
export function buildMessage(evalResult) {
  const lang = state.lang;
  const tt = (k) => t(lang, k);
  const dateStr = formatTodayDate(lang);
  const emoji = TRACK_EMOJI[evalResult.color] || '⚪';
  const trackLabel = evalResult.track === 'A' ? tt('result.trackA') : tt('result.trackB');
  const message = tt(evalResult.messageKey);
  const flagsAll = [
    ...evalResult.flags.red.map((f) => `🔴 ${tt(`result.${f.key}`)}`),
    ...evalResult.flags.yellow.map((f) => `🟡 ${tt(`result.${f.key}`)}`)
  ];
  const flagsBlock = flagsAll.length
    ? flagsAll.join('\n')
    : `✅ ${tt('whatsapp.labelNoFlags')}`;

  const data = [
    `• ${tt('whatsapp.sleep')} : ${formatHours(state.sleep.durationHours, lang)}`,
    `• ${tt('whatsapp.energy')} : ${nullDash(state.wellbeing.energy)}/5`,
    `• ${tt('whatsapp.muscles')} : ${nullDash(state.wellbeing.muscles)}/5`,
    `• ${tt('whatsapp.forearms')} : ${nullDash(state.wellbeing.forearms)}/5`,
    `• ${tt('whatsapp.calm')} : ${nullDash(state.wellbeing.calm)}/5`,
    `• ${tt('whatsapp.mood')} : ${nullDash(state.wellbeing.mood)}/5`,
    `• ${tt('whatsapp.willingness')} : ${state.wellbeing.willingness}/10`,
    `• ${tt('whatsapp.recovery')} : ${state.wellbeing.recoveryPrs}/10`,
    `• ${tt('whatsapp.prevIntensity')} : ${state.wellbeing.prevSessionIntensity}/5`,
    `• ${tt('whatsapp.fuel')} : ${nullDash(state.hydration.fuelScore)}/5`,
    `• ${tt('whatsapp.physio')} : ${state.pain.wantsPhysio ? tt('whatsapp.physioYes') : tt('whatsapp.physioNo')}`
  ].join('\n');

  const disciplineLine = state.discipline
    ? `\n*${tt('whatsapp.labelDiscipline') || 'Discipline'}* : ${tt(`landing.${state.discipline}`)}`
    : '';

  const lines = [
    `*${tt('whatsapp.title')}*`,
    '',
    `*${tt('whatsapp.labelAthlete')}* : ${state.athleteName || '—'}`,
    `*${tt('whatsapp.labelDate')}* : ${dateStr}${disciplineLine}`,
    `*${tt('whatsapp.labelTrack')}* : ${emoji} ${trackLabel}`,
    '',
    `*${tt('whatsapp.labelMessage')}* : ${message}`,
    '',
    `*${tt('whatsapp.labelFlags')}* :`,
    flagsBlock,
    '',
    `*${tt('whatsapp.labelData')}* :`,
    data
  ];

  if (state.hydration.note && state.hydration.note.trim()) {
    lines.push('', `*${tt('whatsapp.labelNote')}* : ${state.hydration.note.trim()}`);
  }

  if (state.pain.other && state.pain.other.trim()) {
    lines.push(`• ${state.pain.other.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Copy the message to the clipboard and open the shared coach group.
 * Returns true if the group was opened, false if the group URL is missing.
 * The clipboard step is best-effort; a failure there does not block the
 * group open, since the athlete can still type a short notice manually.
 */
export async function sendToCoach(evalResult) {
  const url = (state.coachGroupUrl || '').trim();
  if (!url) return false;
  const text = buildMessage(evalResult);
  await copyToClipboard(text);
  window.open(url, '_blank', 'noopener');
  return true;
}

async function copyToClipboard(text) {
  // Modern path — requires a user-initiated event (we are inside one).
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) { /* fall through */ }
  }
  // Legacy fallback for older WebViews / non-secure contexts.
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

function nullDash(v) {
  return v === null || v === undefined ? '—' : String(v);
}

function formatTodayDate(lang) {
  const locale = lang === 'en' ? 'en-CA' : 'fr-CA';
  return new Date().toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
