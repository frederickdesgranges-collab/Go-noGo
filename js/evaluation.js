/**
 * CEC Check-in - evaluation.js
 * Pure logic: state -> { track, color, flags, message keys, score }
 * Plus: 10-day camp plan and per-day intensity recommendation.
 */

import { state } from './state.js';

/* ============================================
   10-day Innsbruck camp plan (July 4 → July 13, 2026)
   Intensity is % of max load planned by the coach.
   "Overreaching" labels appear ONLY on days 5-6 per coach's note.
   ============================================ */
const CAMP_START_ISO = '2026-07-04';

/**
 * Day-of-camp for a given Date (1..10), or null if outside the window.
 * Uses local-date math so timezones don't drift the boundary.
 */
export function dayOfCamp(date = new Date()) {
  const start = new Date(`${CAMP_START_ISO}T00:00:00`);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today - start;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 0 || diffDays > 9) return null;
  return diffDays + 1;
}

/**
 * Each plan row = { day, dateLabel, intensity, blockKey, isOff, amKey, pmKey }
 * blockKey is i18n key for the phase label ('block.progressive', etc.)
 */
const PLANS = {
  // Competing in Arco · Top shape (auto-selected when score is high)
  'top-shape': [
    { day: 1,  date: '2026-07-04', intensity: 70,  blockKey: 'block.progressive', isOff: false, am: 'AM', pm: 'PM' },
    { day: 2,  date: '2026-07-05', intensity: 100, blockKey: 'block.progressive', isOff: false, am: 'AM', pm: 'PM' },
    { day: 3,  date: '2026-07-06', intensity: 40,  blockKey: 'block.off',         isOff: true,  am: 'AM', pm: 'Nordkette' },
    { day: 4,  date: '2026-07-07', intensity: 120, blockKey: 'block.overreach',   isOff: false, am: 'AM', pm: 'PM' },
    { day: 5,  date: '2026-07-08', intensity: 110, blockKey: 'block.overreach',   isOff: false, am: 'AM', pm: 'PM' },
    { day: 6,  date: '2026-07-09', intensity: 25,  blockKey: 'block.off',         isOff: true,  am: 'Alpine / Museum', pm: 'PM' },
    { day: 7,  date: '2026-07-10', intensity: 85,  blockKey: 'block.taper',       isOff: false, am: 'AM', pm: 'PM' },
    { day: 8,  date: '2026-07-11', intensity: 30,  blockKey: 'block.taper',       isOff: false, am: 'AM', pm: 'Reflection' },
    { day: 9,  date: '2026-07-12', intensity: 5,   blockKey: 'block.off',         isOff: true,  am: 'AM', pm: 'AM' },
    { day: 10, date: '2026-07-13', intensity: 5,   blockKey: 'block.transit',     isOff: false, am: 'Transit', pm: 'Transit' }
  ],
  // Competing in Arco · Fatigue management (auto when score is mid)
  'fatigue-mgmt': [
    { day: 1,  date: '2026-07-04', intensity: 70, blockKey: 'block.progressive', isOff: false, am: 'AM', pm: 'PM' },
    { day: 2,  date: '2026-07-05', intensity: 75, blockKey: 'block.progressive', isOff: false, am: 'AM', pm: 'PM' },
    { day: 3,  date: '2026-07-06', intensity: 40, blockKey: 'block.off',         isOff: true,  am: 'AM', pm: 'Nordkette' },
    { day: 4,  date: '2026-07-07', intensity: 90, blockKey: 'block.noOverreach', isOff: false, am: 'AM', pm: 'PM' },
    { day: 5,  date: '2026-07-08', intensity: 80, blockKey: 'block.noOverreach', isOff: false, am: 'AM', pm: 'PM' },
    { day: 6,  date: '2026-07-09', intensity: 15, blockKey: 'block.off',         isOff: true,  am: 'Alpine / Museum', pm: 'PM' },
    { day: 7,  date: '2026-07-10', intensity: 60, blockKey: 'block.taperLight',  isOff: false, am: 'AM', pm: 'PM' },
    { day: 8,  date: '2026-07-11', intensity: 20, blockKey: 'block.taperLight',  isOff: false, am: 'AM', pm: 'Reflection' },
    { day: 9,  date: '2026-07-12', intensity: 5,  blockKey: 'block.off',         isOff: true,  am: 'AM', pm: 'AM' },
    { day: 10, date: '2026-07-13', intensity: 5,  blockKey: 'block.transit',     isOff: false, am: 'Transit', pm: 'Transit' }
  ],
  // Not competing in Arco — training camp only
  'not-competing': [
    { day: 1,  date: '2026-07-04', intensity: 70,  blockKey: 'block.accumulation', isOff: false, am: 'AM', pm: 'PM' },
    { day: 2,  date: '2026-07-05', intensity: 100, blockKey: 'block.accumulation', isOff: false, am: 'AM', pm: 'PM' },
    { day: 3,  date: '2026-07-06', intensity: 40,  blockKey: 'block.off',          isOff: true,  am: 'AM', pm: 'Nordkette' },
    { day: 4,  date: '2026-07-07', intensity: 120, blockKey: 'block.overreach',    isOff: false, am: 'AM', pm: 'PM' },
    { day: 5,  date: '2026-07-08', intensity: 110, blockKey: 'block.overreach',    isOff: false, am: 'AM', pm: 'PM' },
    { day: 6,  date: '2026-07-09', intensity: 60,  blockKey: 'block.midOff',       isOff: false, am: 'Alpine / Museum', pm: 'PM' },
    { day: 7,  date: '2026-07-10', intensity: 85,  blockKey: 'block.overreach2',   isOff: false, am: 'AM', pm: 'PM' },
    { day: 8,  date: '2026-07-11', intensity: 70,  blockKey: 'block.overreach2',   isOff: false, am: 'AM', pm: 'Reflection' },
    { day: 9,  date: '2026-07-12', intensity: 5,   blockKey: 'block.off',          isOff: true,  am: 'AM', pm: 'AM' },
    { day: 10, date: '2026-07-13', intensity: 5,   blockKey: 'block.transit',      isOff: false, am: 'Transit', pm: 'Transit' }
  ]
};

/**
 * Resolve which plan (sub-profile) applies given the user's profile and
 * today's score. For competing athletes the score auto-decides between
 * top-shape and fatigue-mgmt; "not-competing" always uses its own plan.
 */
export function resolvePlanKey(score) {
  if (state.profile === 'not-competing') return 'not-competing';
  if (state.profile === 'competing') {
    return score >= 75 ? 'top-shape' : 'fatigue-mgmt';
  }
  return 'top-shape'; // sensible default if profile unset
}

/**
 * Return the full 10-day plan rows for a given plan key.
 */
export function getPlan(planKey) {
  return PLANS[planKey] || PLANS['top-shape'];
}

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

  // Sleep duration — only flag when the deficit is real.
  // < 6h is a clear red zone regardless of quality.
  // 6–7h is only yellow if the athlete also rates the quality poorly (≤3).
  const sleep = state.sleep.durationHours;
  const sleepQuality = state.sleep.quality;
  if (sleep > 0 && sleep < 6) {
    flags.red.push({ key: 'flagSleepShort' });
  } else if (
    sleep > 0 && sleep < 7 &&
    sleepQuality !== null && sleepQuality !== undefined && sleepQuality <= 3
  ) {
    flags.yellow.push({ key: 'flagSleepBorderline' });
  }

  // Likerts (1-5; lower = worse)
  // For energy/muscles/calm/mood, "3" means "moyen / correct" — not a deficit —
  // so we no longer flag it. Only forearms (priority axis) keeps the yellow
  // at 3 since fingers/forearms drive injury risk.
  const likertChecks = [
    ['energy', 'flagLowEnergy', null],
    ['muscles', 'flagLowMuscles', null],
    ['forearms', 'flagLowForearms', 'flagMidForearms'],
    ['calm', 'flagLowCalm', null],
    ['mood', 'flagLowMood', null]
  ];
  likertChecks.forEach(([field, lowKey, midKey]) => {
    const v = state.wellbeing[field];
    if (v === null || v === undefined) return;
    if (v <= 2) flags.red.push({ key: lowKey });
    else if (v === 3 && midKey) flags.yellow.push({ key: midKey });
  });

  // Sliders 0-10 (higher = better)
  if (state.wellbeing.willingness <= 4) flags.red.push({ key: 'flagLowWilling' });
  else if (state.wellbeing.willingness <= 6) flags.yellow.push({ key: 'flagMidWilling' });

  if (state.wellbeing.recoveryPrs <= 4) flags.red.push({ key: 'flagLowRecovery' });
  else if (state.wellbeing.recoveryPrs <= 6) flags.yellow.push({ key: 'flagMidRecovery' });

  // Pain NRS (higher = worse)
  // Fingers: NRS 1-2 is normal climber background; only flag from 3 up.
  if (state.pain.fingers >= 5) flags.red.push({ key: 'flagPainFingersHigh' });
  else if (state.pain.fingers >= 3) flags.yellow.push({ key: 'flagPainFingersMid' });

  if (state.pain.forearm >= 7) flags.red.push({ key: 'flagPainForearmHigh' });
  else if (state.pain.forearm >= 5) flags.yellow.push({ key: 'flagPainForearmMid' });

  if (state.pain.elbow >= 6) flags.red.push({ key: 'flagPainElbowHigh' });
  else if (state.pain.elbow >= 4) flags.yellow.push({ key: 'flagPainElbowMid' });

  if (state.pain.shoulders >= 6) flags.yellow.push({ key: 'flagPainShoulderMid' });
  if (state.pain.back >= 5) flags.yellow.push({ key: 'flagPainBackMid' });

  // Fuel (nutrition + hydration combined, 0-5; higher = better)
  const fuel = state.hydration.fuelScore;
  if (fuel !== null && fuel !== undefined) {
    if (fuel <= 1) flags.red.push({ key: 'flagFuelLow' });
    else if (fuel === 2) flags.yellow.push({ key: 'flagFuelMid' });
  }

  // Previous session intensity (0-5; higher = harder yesterday)
  const prevIntensity = state.wellbeing.prevSessionIntensity;
  if (prevIntensity >= 5) flags.yellow.push({ key: 'flagPrevSessionHard' });

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

  // Granular readiness score 0-100 — penalised by flags so it tracks
  // the A/B decision more tightly. Track A typically lands ≥ 80, Track
  // B yellow lands in the 50-79 band, Track B red dives below 50.
  const score = computeReadinessScore(medicalOverride, flags);

  // Plan + today's recommendation (depends on profile + day + score)
  const planKey = resolvePlanKey(score);
  const plan = getPlan(planKey);
  const dayIdx = dayOfCamp();
  const today = dayIdx ? plan[dayIdx - 1] : null;

  // Adjusted intensity = planned × score factor
  // (score < 50 cuts intensity in half, 100 = full plan)
  let adjustedIntensity = today ? today.intensity : null;
  let adviceKey = 'reco.followPlan';
  if (today && !medicalOverride) {
    if (score < 50) {
      adjustedIntensity = Math.round(today.intensity * 0.5);
      adviceKey = 'reco.lighter';
    } else if (score < 75) {
      adjustedIntensity = Math.round(today.intensity * 0.85);
      adviceKey = 'reco.cautious';
    } else {
      adviceKey = today.intensity >= 100 ? 'reco.pushHard' : 'reco.followPlan';
    }
  } else if (medicalOverride) {
    adjustedIntensity = 0;
    adviceKey = 'reco.medical';
  }

  return {
    track,
    color,
    medicalOverride,
    flags,
    messageKey,
    kindnessKey,
    ringRatio,
    score,
    planKey,
    plan,
    dayIdx,
    today,
    adjustedIntensity,
    adviceKey
  };
}

/**
 * Compute a 0-100 readiness score from the current state.
 * Weighted sum of positive signals minus pain penalties.
 * PIP dorsal = automatic 0.
 */
function computeReadinessScore(medicalOverride, flags) {
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

  // Fuel penalty (low fuel = less ready)
  const fuel = state.hydration.fuelScore;
  if (fuel !== null && fuel !== undefined) {
    if (fuel <= 1) score -= 8;
    else if (fuel === 2) score -= 5;
  }
  // Previous session intensity = contextual fatigue load
  if (state.wellbeing.prevSessionIntensity >= 5) score -= 5;
  else if (state.wellbeing.prevSessionIntensity >= 4) score -= 2;

  // Flag penalty so the score tracks the Track A/B decision.
  // A single yellow flag must drop the score below 75 (visual Track B
  // zone). A single red flag dives into the deep-red zone.
  if (flags) {
    const yellowCount = (flags.yellow?.length) || 0;
    const redCount = (flags.red?.length) || 0;
    score -= yellowCount * 18;
    score -= redCount * 25;
  }

  // Normalize to 0-100
  const pct = Math.round(Math.max(0, Math.min(100, (score / max) * 100)));
  return pct;
}
