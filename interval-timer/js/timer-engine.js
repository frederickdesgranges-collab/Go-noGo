/* =====================================================================
 *  timer-engine.js — Moteur du minuteur d'intervalles.
 *
 *  Construit la séquence de phases à partir de la config :
 *    échauffement → [travail, repos] × N → retour au calme
 *  puis déroule le compte à rebours phase par phase.
 *
 *  Le moteur est « sans interface » : il appelle des callbacks
 *  (onTick, onPhaseEnter, onCountdownBeep, onFinish) que l'app branche.
 *  Il utilise un timer basé sur l'horloge (Date.now) pour rester précis
 *  même si le navigateur ralentit le setInterval en arrière-plan.
 * ===================================================================== */

const TimerEngine = (() => {

  let sequence = [];      // [{ type, durationSec, seriesIndex, seriesTotal }]
  let index = 0;          // phase courante dans la séquence
  let remaining = 0;      // secondes restantes (entier affiché)
  let phaseEndAt = 0;     // timestamp de fin de la phase courante
  let tickHandle = null;
  let running = false;
  let lastBeepSecond = -1;

  const cb = {
    onTick: () => {},          // (remainingSec, phase)
    onPhaseEnter: () => {},    // (phase, indexInSequence)
    onCountdownBeep: () => {}, // () -> bip des 3 dernières secondes
    onPhaseChangeBeep: () => {}, // () -> bip de changement de phase
    onFinish: () => {},        // ()
  };

  function on(handlers) { Object.assign(cb, handlers); }

  /** Construit la séquence de phases. config voir app.js getConfig(). */
  function build(config) {
    const seq = [];
    const dur = (p) => p.min * 60 + p.sec;

    if (config.warmup.enabled && dur(config.warmup) > 0) {
      seq.push({ type: "warmup", durationSec: dur(config.warmup), seriesIndex: 0, seriesTotal: config.series });
    }
    for (let i = 1; i <= config.series; i++) {
      if (dur(config.work) > 0)
        seq.push({ type: "work", durationSec: dur(config.work), seriesIndex: i, seriesTotal: config.series });
      // Pas de repos après la dernière série (sauf s'il y a un retour au calme,
      // mais on suit la convention : repos entre séries seulement).
      if (dur(config.rest) > 0 && i < config.series)
        seq.push({ type: "rest", durationSec: dur(config.rest), seriesIndex: i, seriesTotal: config.series });
    }
    if (config.cooldown.enabled && dur(config.cooldown) > 0) {
      seq.push({ type: "cooldown", durationSec: dur(config.cooldown), seriesIndex: config.series, seriesTotal: config.series });
    }
    sequence = seq;
    index = 0;
    return seq;
  }

  function currentPhase() { return sequence[index] || null; }

  function totalDuration() {
    return sequence.reduce((s, p) => s + p.durationSec, 0);
  }

  /** Démarre (ou redémarre depuis le début). */
  function start() {
    if (!sequence.length) return;
    index = 0;
    running = true;
    enterPhase(0);
    loop();
  }

  function enterPhase(i) {
    index = i;
    const phase = sequence[i];
    remaining = phase.durationSec;
    phaseEndAt = Date.now() + remaining * 1000;
    lastBeepSecond = -1;
    cb.onPhaseChangeBeep();
    cb.onPhaseEnter(phase, i);
    cb.onTick(remaining, phase);
  }

  function loop() {
    clearInterval(tickHandle);
    // 200 ms : assez fin pour des bips et un affichage précis.
    tickHandle = setInterval(stepClock, 200);
  }

  function stepClock() {
    if (!running) return;
    const msLeft = phaseEndAt - Date.now();
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000));

    if (secLeft !== remaining) {
      remaining = secLeft;
      const phase = currentPhase();
      cb.onTick(remaining, phase);

      // Bips des 3 dernières secondes (3,2,1) — une fois par seconde.
      if (remaining <= 3 && remaining >= 1 && remaining !== lastBeepSecond) {
        lastBeepSecond = remaining;
        cb.onCountdownBeep();
      }
    }

    if (msLeft <= 0) advance();
  }

  function advance() {
    if (index + 1 < sequence.length) {
      enterPhase(index + 1);
    } else {
      stop();
      cb.onFinish();
    }
  }

  /** Passer la phase courante. */
  function skip() {
    if (!running) return;
    advance();
  }

  function pause() {
    if (!running) return;
    running = false;
    clearInterval(tickHandle);
    // On mémorise le temps restant pour la reprise.
    remaining = Math.max(0, Math.ceil((phaseEndAt - Date.now()) / 1000));
  }

  function resume() {
    if (running || !sequence.length) return;
    running = true;
    phaseEndAt = Date.now() + remaining * 1000;
    loop();
  }

  function stop() {
    running = false;
    clearInterval(tickHandle);
  }

  function isRunning() { return running; }

  return {
    on, build, start, pause, resume, skip, stop,
    currentPhase, totalDuration, isRunning,
    get index() { return index; },
    get sequence() { return sequence; },
  };
})();
