/**
 * CEC Check-in - whatsapp.js
 * Build a formatted check-in message and open wa.me with it pre-filled.
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
    `• ${tt('whatsapp.pip')} : ${state.pain.pipDorsal ? tt('whatsapp.pipYes') : tt('whatsapp.pipNo')}`
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
 * Open the WhatsApp web/app deep-link with the pre-filled message.
 * Returns true on success, false if the coach phone number is missing.
 */
export function sendToCoach(evalResult) {
  const phone = (state.coachPhone || '').replace(/\D+/g, '');
  if (!phone) return false;
  const text = buildMessage(evalResult);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
  return true;
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
