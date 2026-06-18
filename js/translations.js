/**
 * CEC Check-in - translations.js
 * FR / EN string tables. Resolved by dotted key (e.g. "sleep.bedtime").
 */

export const translations = {
  fr: {
    meta: {
      title: 'CEC Check-in Matinal · Innsbruck 2026',
      description: 'Check-in matinal autoévalué pour les athlètes CEC en camp Innsbruck 2026.'
    },
    header: {
      title: 'Check-in Matinal',
      settings: 'Paramètres'
    },
    landing: {
      tag: 'CLIMBING ESCALADE CANADA',
      camp: 'INNSBRUCK · JUILLET 2026',
      eyebrow: 'YWCH 2026 · INNSBRUCK TRAINING CAMP',
      eyebrowMain: 'YWCH 2026',
      eyebrowSub: 'INNSBRUCK TRAINING CAMP',
      title: 'Check‑in matinal',
      sub: '60 secondes pour décider la journée. Honnête. Précis. Stratégique.',
      scrollHint: 'Faire défiler',
      signinEyebrow: 'Bienvenue, athlète',
      signinTitle: 'Identifie‑toi pour commencer',
      athleteLabel: 'Athlète',
      athletePlaceholder: 'Ton prénom',
      disciplineLabel: 'Discipline du jour',
      lead: 'Lead',
      leadHint: 'Difficulté',
      boulder: 'Bloc',
      boulderHint: 'Boulder',
      speed: 'Vitesse',
      speedHint: 'Speed',
      combined: 'Combiné',
      combinedHint: 'Combined',
      profileLabel: 'Compétition à Arco ?',
      profileCompeting: 'Compétitionne à Arco',
      profileCompetingHint: 'YWCH 2026',
      profileNotCompeting: 'Ne compétitionne pas',
      profileNotCompetingHint: "Camp d'entraînement",
      start: 'Commencer le check-in',
      disclosureTitle: 'Tu décides quand envoyer',
      disclaimer: "Rien n'est envoyé tant que tu n'as pas cliqué sur Confirmer. Ton check-in arrive dans le tableau privé de l'équipe coachs.",
      missingName: 'Indique ton prénom pour démarrer.',
      missingDiscipline: 'Choisis une discipline.',
      missingProfile: 'Choisis ton profil Arco.'
    },
    athlete: {
      label: 'Athlète',
      placeholder: 'Ton prénom'
    },
    block: {
      progressive: 'Charge progressive',
      accumulation: 'Accumulation',
      overreach: 'Overreaching planifié',
      noOverreach: 'Pas d\'overreaching',
      midOff: 'Off · récupération',
      taper: 'Affûtage complet',
      taperLight: 'Affûtage allégé',
      overreach2: '2e overreach · volume',
      off: 'Jour off',
      transit: 'Transit · jour de voyage'
    },
    reco: {
      followPlan: 'Tu peux faire l\'intensité prévue. On respecte le plan.',
      pushHard: 'Tu es prêt. On pousse fort comme prévu.',
      cautious: 'On démarre prudemment. Réévalue après le warm-up.',
      lighter: 'On allège la journée. Volume et intensité réduits.',
      offDay: 'Journée off. Récupération active uniquement.'
    },
    sections: {
      sleep: {
        eyebrow: 'Section A · Nuit',
        title: 'Sommeil',
        hint: 'Renseigne tes horaires de la nuit dernière.'
      },
      wellbeing: {
        eyebrow: 'Section B · Corps & tête',
        title: 'Bien‑être',
        hint: 'Échelle uniforme. 1 = très mauvais. 5 = au top. Plus haut = mieux.'
      },
      pain: {
        eyebrow: 'Section C · Douleur',
        title: 'Douleur · NRS 0‑10',
        hint: '0 = aucune douleur. 10 = douleur maximale.'
      },
      hydration: {
        eyebrow: 'Section D · Veille',
        title: 'Nutrition & hydratation',
        hint: 'Un seul curseur pour résumer ta veille.'
      }
    },
    sleep: {
      bedtime: 'Heure de coucher',
      wake: 'Heure de réveil',
      duration: 'Durée',
      quality: 'Qualité du sommeil',
      qualityLow: 'Très mal',
      qualityHigh: 'Excellent',
      wakings: 'Réveils nocturnes',
      hours: 'h'
    },
    wellbeing: {
      energy: "Niveau d'énergie",
      energyLow: 'Vidé',
      energyHigh: "Plein d'énergie",
      muscles: 'État des muscles',
      musclesLow: 'Très courbatés',
      musclesHigh: 'Frais et dispos',
      forearms: 'Avant-bras / mains / doigts',
      forearmsLow: 'Cuits',
      forearmsHigh: 'Pleine forme',
      priority: 'PRIORITÉ',
      calm: 'Calme et sérénité',
      calmLow: 'Très stressé',
      calmHigh: 'Très serein',
      mood: 'Humeur',
      moodLow: 'Très basse',
      moodHigh: 'Excellente',
      willingness: "Disposition à grimper aujourd'hui",
      recoveryPrs: 'Récupération PRS',
      recoveryPrsHint: 'Perceived Recovery Status — à quel point tu te sens récupéré de la dernière séance, sur 10.',
      recoveryPrsLow: 'Pas récupéré',
      recoveryPrsHigh: 'Totalement récupéré',
      prevSessionIntensity: "Intensité de la séance d'hier",
      prevSessionIntensityHint: '0 = repos / très facile · 5 = séance très exigeante.',
      prevSessionIntensityLow: 'Repos',
      prevSessionIntensityHigh: 'Très intense'
    },
    pain: {
      fingers: 'Doigts et articulations',
      physioRequestTitle: "Je veux voir le physio aujourd'hui",
      physioRequestExplain: 'Coche si tu as un inconfort que tu veux faire évaluer. Le coach sera averti. Vois le physio avant ta séance.',
      forearm: 'Avant-bras (zone fléchisseurs)',
      shoulders: 'Épaules / lats',
      elbow: 'Coude médial',
      back: 'Bas du dos',
      skin: 'Peau (paumes / doigts)',
      other: 'Autre douleur (optionnel)',
      otherPlaceholder: 'Décris brièvement…'
    },
    hydration: {
      fuel: 'Bien nourri et hydraté la veille ?',
      fuelHint: '0 = repas et eau négligés · 5 = nutrition et hydratation au top.',
      fuelLow: 'Manqué',
      fuelHigh: 'Au top',
      note: 'Note libre (optionnel)',
      notePlaceholder: 'Quelque chose à ajouter pour le coach ?'
    },
    scale: {
      zero: '0',
      ten: '10'
    },
    form: {
      submit: 'Calculer mon Track du jour',
      disclaimer: "Tes réponses partent à l'équipe de coachs uniquement quand tu cliques sur Confirmer."
    },
    validation: {
      missingName: 'Indique ton prénom avant de continuer.',
      missingLikert: 'Réponds à toutes les questions obligatoires de la section Sommeil et Bien-être.'
    },
    result: {
      trackA: 'TRACK A',
      trackB: 'TRACK B',
      readiness: 'READINESS',
      todaysCheckin: 'Check-in du jour',
      helloPrefix: 'Bonjour',
      planTitle: 'Plan du jour',
      planDayLabel: 'Jour',
      planOf: 'sur',
      planIntensity: 'Intensité',
      planAdjusted: 'Ajustée selon ton score',
      planTracking: 'Suivi du camp',
      planTrackingSub: '10 jours d\'entraînement Innsbruck',
      planAm: 'Matin',
      planPm: 'Après-midi',
      progressionTitle: 'Progression de la forme',
      progressionSub: 'Score Readiness sur la durée',
      eventCamp: 'Camp',
      eventArco: 'Arco',
      progressionEmpty: 'Pas encore de données. Ton score apparaîtra dès le premier check-in du camp.',
      progressionLast: 'Aujourd\'hui',
      progressionAvg: 'Moyenne',
      progressionRecorded: 'Saisis',
      indicators: 'Indicateurs',
      noFlags: "Aucun signal d'alerte. Belle nuit, beau profil.",
      scrollHint: 'Voir les détails',
      confirm: 'Envoyer aux coachs',
      refuse: "Refuser l'envoi",
      sentToast: "Envoyé au tableau de l'équipe coachs.",
      refusedToast: 'Refus enregistré. Aucune réponse partagée.',
      resubmitLocked: 'Tu as deja envoye ton check-in. Attends {min} min avant de renvoyer, ou parle a ton coach.',
      resubmitRecorded: "Reprise n°{n} enregistree. Le coach verra que c'est une nouvelle reponse.",
      noConfig: "Configure d'abord l'URL du tableau dans les Paramètres.",
      edit: 'Modifier',
      restart: 'Recommencer',
      messageGreen: "Tu es prêt(e) ! Charge complète.",
      kindnessGreen: "On y va à fond, mais on reste à l'écoute du corps. Si quelque chose change, parle au coach immédiatement.",
      messageYellowSoft: "Tu n'es pas à 100%. On réévalue sur le terrain.",
      kindnessYellowSoft: "Démarrage progressif, on ajuste après le warm-up. Sois honnête avec toi-même.",
      messageYellowHard: 'Plusieurs signaux de fatigue. On allège la journée.',
      kindnessYellowHard: "C'est OK de ralentir aujourd'hui. La récup fait partie de la prépa.",
      messageRed: "Journée de récupération. Volume réduit, technique à l'aise.",
      kindnessRed: "Écouter son corps, c'est aussi un acte de performance. On reviendra plus fort demain.",
      messageLowScore: "Tes signaux sont corrects mais ta réserve du jour est basse. Journée prudente.",
      messageHeadInjury: 'Arrete. Possible blessure a la tete. Ne grimpe pas avant un avis physio ou medecin.',
      kindnessHeadInjury: 'La tete passe avant tout. Previens un coach maintenant.',
      physioBanner: "Tu as demandé à voir le physio. Vois-le avant de grimper.",
      flagHeadInjury: 'Possible blessure a la tete',
      flagFreeTextReview: 'Note a lire par le coach',
      flagSleepShort: 'Sommeil très court (< 6h)',
      flagSleepBorderline: 'Sommeil court & qualité faible (< 7h)',
      flagLowEnergy: 'Énergie basse',
      flagLowMuscles: 'Muscles courbatés',
      flagLowForearms: 'Avant-bras cuits',
      flagMidForearms: 'Avant-bras moyens',
      flagLowCalm: 'Stress élevé',
      flagLowMood: 'Humeur basse',
      flagLowWilling: 'Disposition très basse',
      flagMidWilling: 'Disposition moyenne',
      flagLowRecovery: 'Récupération PRS basse',
      flagMidRecovery: 'Récupération PRS moyenne',
      flagPainFingersHigh: 'Douleur doigts élevée',
      flagPainFingersMid: 'Douleur doigts modérée',
      flagPainForearmHigh: 'Douleur avant-bras forte',
      flagPainForearmMid: 'Douleur avant-bras modérée',
      flagPainElbowHigh: 'Douleur coude médial forte',
      flagPainElbowMid: 'Douleur coude médial modérée',
      flagPainShoulderMid: 'Douleur épaule modérée',
      flagPainBackMid: 'Douleur bas du dos modérée',
      flagFuelLow: 'Nutrition / hydratation insuffisante',
      flagFuelMid: 'Nutrition / hydratation à surveiller',
      flagPrevSessionHard: 'Séance d\'hier très exigeante',
      stat: {
        sleep: 'Sommeil',
        energy: 'Énergie',
        muscles: 'Muscles',
        forearms: 'Avant-bras',
        calm: 'Sérénité',
        mood: 'Humeur',
        willingness: 'Disposition',
        recovery: 'Récup PRS',
        prevIntensity: 'Intensité veille',
        fuel: 'Nutrition / hydratation',
        unitHours: 'h',
        unitOf5: '/5',
        unitOf10: '/10'
      }
    },
    settings: {
      title: 'Paramètres',
      coachSheetUrl: "URL du tableau privé de l'équipe coachs",
      coachSheetUrlHint: "Tableau partagé entre tous les coachs (règle de trois). Pré-configuré pour le camp Innsbruck 2026.",
      langLabel: 'Langue',
      langFr: 'Français',
      langEn: 'English',
      save: 'Enregistrer',
      saved: 'Paramètres enregistrés.'
    }
  },
  en: {
    meta: {
      title: 'CEC Morning Check-in · Innsbruck 2026',
      description: 'Self-assessed morning check-in for CEC athletes at Innsbruck 2026 camp.'
    },
    header: {
      title: 'Morning Check-in',
      settings: 'Settings'
    },
    landing: {
      tag: 'CLIMBING ESCALADE CANADA',
      camp: 'INNSBRUCK · JULY 2026',
      eyebrow: 'YWCH 2026 · INNSBRUCK TRAINING CAMP',
      eyebrowMain: 'YWCH 2026',
      eyebrowSub: 'INNSBRUCK TRAINING CAMP',
      title: 'Morning check‑in',
      sub: '60 seconds to set the day. Honest. Precise. Strategic.',
      scrollHint: 'Scroll',
      signinEyebrow: 'Welcome, athlete',
      signinTitle: 'Sign in to start',
      athleteLabel: 'Athlete',
      athletePlaceholder: 'Your first name',
      disciplineLabel: "Today's discipline",
      lead: 'Lead',
      leadHint: 'Difficulty',
      boulder: 'Boulder',
      boulderHint: 'Bouldering',
      speed: 'Speed',
      speedHint: 'Speed',
      combined: 'Combined',
      combinedHint: 'Combined',
      profileLabel: 'Competing in Arco?',
      profileCompeting: 'Competing in Arco',
      profileCompetingHint: 'YWCH 2026',
      profileNotCompeting: 'Not competing',
      profileNotCompetingHint: 'Training camp only',
      start: 'Start check-in',
      disclosureTitle: 'You decide when to send',
      disclaimer: 'Nothing is sent until you tap Confirm. Your check-in lands in the private coach team dashboard.',
      missingName: 'Enter your first name to start.',
      missingDiscipline: 'Pick a discipline.',
      missingProfile: 'Pick your Arco profile.'
    },
    athlete: {
      label: 'Athlete',
      placeholder: 'Your first name'
    },
    block: {
      progressive: 'Progressive load',
      accumulation: 'Accumulation',
      overreach: 'Planned overreaching',
      noOverreach: 'No overreaching',
      midOff: 'Off · recovery',
      taper: 'Complete saw taper',
      taperLight: 'Lightweight taper',
      overreach2: '2nd overreach · volume',
      off: 'Off day',
      transit: 'Transit · travel day'
    },
    reco: {
      followPlan: 'Run the planned intensity. Stick to the plan.',
      pushHard: 'You\'re ready. Push hard as planned.',
      cautious: 'Start cautiously. Reassess after warm-up.',
      lighter: 'Lighter day today. Reduced volume and intensity.',
      offDay: 'Off day. Active recovery only.'
    },
    sections: {
      sleep: {
        eyebrow: 'Section A · Night',
        title: 'Sleep',
        hint: 'Enter your timings from last night.'
      },
      wellbeing: {
        eyebrow: 'Section B · Body & mind',
        title: 'Well‑being',
        hint: 'Uniform scale. 1 = very poor. 5 = top form. Higher = better.'
      },
      pain: {
        eyebrow: 'Section C · Pain',
        title: 'Pain · NRS 0‑10',
        hint: '0 = no pain. 10 = maximum pain.'
      },
      hydration: {
        eyebrow: 'Section D · Yesterday',
        title: 'Nutrition & hydration',
        hint: 'A single slider to sum up yesterday.'
      }
    },
    sleep: {
      bedtime: 'Bedtime',
      wake: 'Wake-up time',
      duration: 'Duration',
      quality: 'Sleep quality',
      qualityLow: 'Very poor',
      qualityHigh: 'Excellent',
      wakings: 'Night wakings',
      hours: 'h'
    },
    wellbeing: {
      energy: 'Energy level',
      energyLow: 'Drained',
      energyHigh: 'Full of energy',
      muscles: 'Muscle state',
      musclesLow: 'Very sore',
      musclesHigh: 'Fresh and ready',
      forearms: 'Forearms / hands / fingers',
      forearmsLow: 'Cooked',
      forearmsHigh: 'Top shape',
      priority: 'PRIORITY',
      calm: 'Calm & serenity',
      calmLow: 'Very stressed',
      calmHigh: 'Very calm',
      mood: 'Mood',
      moodLow: 'Very low',
      moodHigh: 'Excellent',
      willingness: 'Willingness to climb today',
      recoveryPrs: 'PRS recovery',
      recoveryPrsHint: 'Perceived Recovery Status — how recovered you feel from the last session, out of 10.',
      recoveryPrsLow: 'Not recovered',
      recoveryPrsHigh: 'Fully recovered',
      prevSessionIntensity: "Yesterday's session intensity",
      prevSessionIntensityHint: '0 = rest / very easy · 5 = very demanding session.',
      prevSessionIntensityLow: 'Rest',
      prevSessionIntensityHigh: 'Very intense'
    },
    pain: {
      fingers: 'Fingers and joints',
      physioRequestTitle: 'I want to see the physio today',
      physioRequestExplain: 'Check this if you have a discomfort you want checked. Your coach will be notified. See the physio before your session.',
      forearm: 'Forearm (flexor area)',
      shoulders: 'Shoulders / lats',
      elbow: 'Medial elbow',
      back: 'Lower back',
      skin: 'Skin (palms / fingers)',
      other: 'Other pain (optional)',
      otherPlaceholder: 'Describe briefly…'
    },
    hydration: {
      fuel: 'Well fed and hydrated yesterday?',
      fuelHint: '0 = meals and water neglected · 5 = nutrition and hydration on point.',
      fuelLow: 'Missed',
      fuelHigh: 'On point',
      note: 'Free note (optional)',
      notePlaceholder: 'Anything to add for coach?'
    },
    scale: {
      zero: '0',
      ten: '10'
    },
    form: {
      submit: "Calculate today's Track",
      disclaimer: 'Your answers reach the coach team only when you tap Confirm.'
    },
    validation: {
      missingName: 'Enter your first name before continuing.',
      missingLikert: 'Answer all required questions in the Sleep and Well-being sections.'
    },
    result: {
      trackA: 'TRACK A',
      trackB: 'TRACK B',
      readiness: 'READINESS',
      todaysCheckin: "Today's check-in",
      helloPrefix: 'Hello',
      planTitle: "Today's plan",
      planDayLabel: 'Day',
      planOf: 'of',
      planIntensity: 'Intensity',
      planAdjusted: 'Adjusted to your score',
      planTracking: 'Camp tracker',
      planTrackingSub: '10 training days in Innsbruck',
      planAm: 'AM',
      planPm: 'PM',
      progressionTitle: 'Form progression',
      progressionSub: 'Readiness score over time',
      eventCamp: 'Camp',
      eventArco: 'Arco',
      progressionEmpty: 'No data yet. Your score will show up after your first check-in.',
      progressionLast: 'Today',
      progressionAvg: 'Average',
      progressionRecorded: 'Recorded',
      indicators: 'Indicators',
      noFlags: 'No alert signals. Solid night, solid profile.',
      scrollHint: 'See details',
      confirm: 'Send to coaches',
      refuse: 'Decline sending',
      sentToast: 'Sent to the coach team dashboard.',
      refusedToast: 'Refusal logged. No answers shared.',
      resubmitLocked: 'You already sent your check-in. Wait {min} min before resending, or talk to your coach.',
      resubmitRecorded: 'Resubmission n°{n} recorded. Your coach will see this is a new answer.',
      noConfig: 'First, set the dashboard URL in Settings.',
      edit: 'Edit',
      restart: 'Restart',
      messageGreen: "You're ready! Full load.",
      kindnessGreen: "Push hard, but stay tuned to your body. If anything changes, talk to coach immediately.",
      messageYellowSoft: "You're not at 100%. We'll reassess on the wall.",
      kindnessYellowSoft: 'Easy start, we adjust after warm-up. Be honest with yourself.',
      messageYellowHard: "Multiple fatigue signals. Lighter day today.",
      kindnessYellowHard: "It's OK to slow down today. Recovery is part of the prep.",
      messageRed: 'Recovery day. Reduced volume, easy technique work.',
      kindnessRed: "Listening to your body is also a performance act. We'll come back stronger tomorrow.",
      messageLowScore: "Your signals are fine but your reserve today is low. Easy day.",
      messageHeadInjury: 'Stop. Possible head injury. Do not climb before a physio or doctor clears you.',
      kindnessHeadInjury: 'Your head comes first. Tell a coach right now.',
      physioBanner: "You asked to see the physio. See them before climbing.",
      flagHeadInjury: 'Possible head injury',
      flagFreeTextReview: 'Note flagged for coach review',
      flagSleepShort: 'Very short sleep (< 6h)',
      flagSleepBorderline: 'Short sleep & poor quality (< 7h)',
      flagLowEnergy: 'Low energy',
      flagLowMuscles: 'Sore muscles',
      flagLowForearms: 'Cooked forearms',
      flagMidForearms: 'Mid forearm state',
      flagLowCalm: 'High stress',
      flagLowMood: 'Low mood',
      flagLowWilling: 'Very low willingness',
      flagMidWilling: 'Mid willingness',
      flagLowRecovery: 'Low PRS recovery',
      flagMidRecovery: 'Mid PRS recovery',
      flagPainFingersHigh: 'High finger pain',
      flagPainFingersMid: 'Moderate finger pain',
      flagPainForearmHigh: 'Strong forearm pain',
      flagPainForearmMid: 'Moderate forearm pain',
      flagPainElbowHigh: 'Strong medial elbow pain',
      flagPainElbowMid: 'Moderate medial elbow pain',
      flagPainShoulderMid: 'Moderate shoulder pain',
      flagPainBackMid: 'Moderate lower back pain',
      flagFuelLow: 'Insufficient nutrition / hydration',
      flagFuelMid: 'Nutrition / hydration to watch',
      flagPrevSessionHard: "Yesterday's session was very demanding",
      stat: {
        sleep: 'Sleep',
        energy: 'Energy',
        muscles: 'Muscles',
        forearms: 'Forearms',
        calm: 'Calm',
        mood: 'Mood',
        willingness: 'Willingness',
        recovery: 'PRS recovery',
        prevIntensity: 'Yesterday intensity',
        fuel: 'Nutrition / hydration',
        unitHours: 'h',
        unitOf5: '/5',
        unitOf10: '/10'
      }
    },
    settings: {
      title: 'Settings',
      coachSheetUrl: 'Coach team private dashboard URL',
      coachSheetUrlHint: 'Shared dashboard monitored by all coaches (rule of three). Pre-configured for the Innsbruck 2026 camp.',
      langLabel: 'Language',
      langFr: 'Français',
      langEn: 'English',
      save: 'Save',
      saved: 'Settings saved.'
    }
  }
};

/**
 * Resolve a dotted key against a translation tree.
 * Returns the key itself as a fallback if missing.
 */
export function resolveKey(tree, key) {
  if (!key) return '';
  const parts = key.split('.');
  let node = tree;
  for (const part of parts) {
    if (node && Object.prototype.hasOwnProperty.call(node, part)) {
      node = node[part];
    } else {
      return key;
    }
  }
  return typeof node === 'string' ? node : key;
}

/**
 * Get a translated string for the given key using the active language.
 */
export function t(lang, key) {
  const tree = translations[lang] || translations.fr;
  return resolveKey(tree, key);
}

/**
 * Apply translations to all elements with [data-i18n] in the document.
 * If [data-i18n-attr] is set, the value is written into that attribute
 * instead of the element textContent.
 */
export function applyTranslations(lang) {
  const root = document;
  const nodes = root.querySelectorAll('[data-i18n]');
  nodes.forEach((node) => {
    const key = node.getAttribute('data-i18n');
    const attr = node.getAttribute('data-i18n-attr');
    const value = t(lang, key);
    if (attr) {
      node.setAttribute(attr, value);
    } else {
      node.textContent = value;
    }
  });
  document.documentElement.setAttribute('lang', lang);
}
