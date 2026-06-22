/* =====================================================================
 *  audio.js — Bips générés avec la Web Audio API (aucun fichier audio).
 *
 *  Deux sons :
 *   - beepCountdown() : bip court/aigu pour les 3 dernières secondes.
 *   - beepPhaseChange() : bip plus long/grave au changement de phase.
 *
 *  Le volume de ces bips est INDÉPENDANT du volume Spotify.
 *  Le contexte audio doit être « débloqué » par une interaction utilisateur
 *  (clic sur Démarrer) : c'est une exigence des navigateurs mobiles.
 * ===================================================================== */

const Beeper = (() => {
  let ctx = null;
  let enabled = true;

  /** À appeler sur un clic utilisateur (ex. Démarrer) pour autoriser le son. */
  function unlock() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
  }

  function setEnabled(v) { enabled = !!v; }

  /** Joue une tonalité simple. freq en Hz, dur en secondes, gain 0..1. */
  function tone(freq, dur, gain = 0.25) {
    if (!enabled || !ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;

    const t0 = ctx.currentTime;
    // Petite enveloppe pour éviter les « clics » à l'attaque/relâche.
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(amp).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** Bip court des 3 dernières secondes. */
  function beepCountdown() { tone(880, 0.12, 0.3); }

  /** Bip distinct du changement de phase (double, plus grave). */
  function beepPhaseChange() {
    tone(523, 0.18, 0.35);
    setTimeout(() => tone(784, 0.28, 0.35), 160);
  }

  return { unlock, setEnabled, beepCountdown, beepPhaseChange };
})();
