/**
 * CEC Check-in - evaluation.js
 * Pure logic: state -> { track, color, flags, message keys }
 * Track A = vert (charge complète)
 * Track B = jaune (allégé) ou rouge (récup) ou medical (stop)
 */

import { state } from './state.js';

/**
 * Evaluate the current state and return a structured result.
 */
export function evaluate() {
  const flags = { red: [], yellow: [] };
  let medicalOverride = false;

  // PIP dorsal — hard stop
  if (state.pain.pipDorsal) {
    medicalOverride = true;
    flags.red.push({ key: 'flagPipDorsal' });
  }

  // Sleep duration
  const sleep = state.sleep.durationHours;
  if (sleep > 0 && sleep < 7) flags.red.push({ key: 'flagSleepShort' });
  else if (sleep > 0 && sleep < 8) flags.yellow.push({ key: 'flagSleepBorderline' });

  // Likerts (1-5; lower = worse)
  const likertChecks = [
    ['energy', 'flagLowEnergy', 'flagMidEnergy'],
    ['muscles', 'flagLowMuscles', 'flagMidMuscles'],
    ['forearms', 'flagLowForearms', 'flagMidForearms'],
    ['calm', 'flagLowCalm', 'flagMidCalm'],
    ['mood', 'flagLowMood', 'flagMidMood']
  ];
  likertChecks.forEach(([field, lowKey, midKey]) => {
    const v = state.wellbeing[field];
    if (v === null || v === undefined) return;
    if (v <= 2) flags.red.push({ key: lowKey });
    else if (v === 3) flags.yellow.push({ key: midKey });
  });

  // Sliders 0-10 (higher = better)
  if (state.wellbeing.willingness <= 4) flags.red.push({ key: 'flagLowWilling' });
  else if (state.wellbeing.willingness <= 6) flags.yellow.push({ key: 'flagMidWilling' });

  if (state.wellbeing.recoveryPrs <= 4) flags.red.push({ key: 'flagLowRecovery' });
  else if (state.wellbeing.recoveryPrs <= 6) flags.yellow.push({ key: 'flagMidRecovery' });

  // Pain NRS (higher = worse)
  if (state.pain.fingers >= 4) flags.red.push({ key: 'flagPainFingersHigh' });
  else if (state.pain.fingers >= 2) flags.yellow.push({ key: 'flagPainFingersMid' });

  if (state.pain.forearm >= 7) flags.red.push({ key: 'flagPainForearmHigh' });
  else if (state.pain.forearm >= 5) flags.yellow.push({ key: 'flagPainForearmMid' });

  if (state.pain.elbow >= 6) flags.red.push({ key: 'flagPainElbowHigh' });
  else if (state.pain.elbow >= 4) flags.yellow.push({ key: 'flagPainElbowMid' });

  if (state.pain.shoulders >= 6) flags.yellow.push({ key: 'flagPainShoulderMid' });
  if (state.pain.back >= 5) flags.yellow.push({ key: 'flagPainBackMid' });

  // Hydration / nutrition
  if (state.hydration.urine !== null && state.hydration.urine >= 4) {
    flags.yellow.push({ key: 'flagUrineDark' });
  }
  if (state.hydration.skippedMeal) {
    flags.yellow.push({ key: 'flagSkippedMeal' });
  }

  // Decision
  let track = 'A';
  let color = 'green';
  let messageKey = 'result.messageGreen';
  let kindnessKey = 'result.kindnessGreen';

  if (medicalOverride) {
    track = 'B';
    color = 'red';
    messageKey = 'result.messageMedical';
    kindnessKey = 'result.kindnessMedical';
  } else if (flags.red.length >= 1) {
    track = 'B';
    color = 'red';
    messageKey = 'result.messageRed';
    kindnessKey = 'result.kindnessRed';
  } else if (flags.yellow.length >= 3) {
    track = 'B';
    color = 'red';
    messageKey = 'result.messageYellowHard';
    kindnessKey = 'result.kindnessYellowHard';
  } else if (flags.yellow.length >= 1) {
    track = 'B';
    color = 'yellow';
    messageKey = 'result.messageYellowSoft';
    kindnessKey = 'result.kindnessYellowSoft';
  }

  // Ring fill ratio: 1 for green, 0.6 for yellow, 0.3 for red
  let ringRatio = 1;
  if (color === 'yellow') ringRatio = 0.6;
  else if (color === 'red') ringRatio = 0.3;

  // Granular readiness score 0-100 (independent of track decision)
  const score = computeReadinessScore(medicalOverride);

  return {
    track,
    color,
    medicalOverride,
    flags,
    messageKey,
    kindnessKey,
    ringRatio,
    score
  };
}

/**
 * Compute a 0-100 readiness score from the current state.
 * Weighted sum of positive signals minus pain penalties.
 * PIP dorsal = automatic 0.
 */
function computeReadinessScore(medicalOverride) {
  if (medicalOverride) return 0;

  let score = 0;
  let max = 0;

  // Sleep duration (8h target, max 25 pts)
  if (state.sleep.durationHours > 0) {
    score += Math.min(25, (state.sleep.durationHours / 8) * 25);
  }
  max += 25;

  // Likert wellbeing fields (5 fields × 7 pts = 35 pts)
  const likertFields = ['energy', 'muscles', 'forearms', 'calm', 'mood'];
  likertFields.forEach((f) => {
    const v = state.wellbeing[f];
    if (v !== null && v !== undefined) {
      score += ((v - 1) / 4) * 7;
    }
    max += 7;
  });

  // Willingness + recovery sliders (2 × 10 = 20 pts)
  score += (state.wellbeing.willingness / 10) * 10;
  score += (state.wellbeing.recoveryPrs / 10) * 10;
  max += 20;

  // Pain penalty: each pain ≥ threshold subtracts points
  // Pain fingers/forearm/elbow weighted heaviest
  let painPenalty = 0;
  painPenalty += state.pain.fingers * 1.5;     // 0-15
  painPenalty += state.pain.forearm * 1.2;     // 0-12
  painPenalty += state.pain.elbow * 1.0;       // 0-10
  painPenalty += state.pain.shoulders * 0.6;
  painPenalty += state.pain.back * 0.6;
  painPenalty += state.pain.skin * 0.3;
  // Cap penalty at 30 points total
  painPenalty = Math.min(30, painPenalty);
  score -= painPenalty;

  // Hydration penalty
  if (state.hydration.urine !== null && state.hydration.urine >= 4) score -= 5;
  if (state.hydration.skippedMeal) score -= 4;

  // Normalize to 0-100
  const pct = Math.round(Math.max(0, Math.min(100, (score / max) * 100)));
  return pct;
}
