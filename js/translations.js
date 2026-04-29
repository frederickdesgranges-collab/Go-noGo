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
      disclaimer: 'Tes réponses ne quittent ton téléphone que si tu choisis de les envoyer au coach.',
      missingName: 'Indique ton prénom pour démarrer.',
      missingDiscipline: 'Choisis une discipline.',
      missingProfile: 'Choisis ton profil Arco.'
    },
    athlete: {
      label: 'Athlète',
      placeholder: 'Ton prénom'
    },
    sections: {
      sleep: {
        title: 'Sommeil',
        hint: 'Renseigne tes horaires de la nuit dernière.'
      },
      wellbeing: {
        title: 'Bien-être',
        hint: 'Échelle uniforme. 1 = très mauvais. 5 = au top. Plus haut = mieux.'
      },
      pain: {
        title: 'Douleur (NRS 0-10)',
        hint: '0 = aucune douleur. 10 = douleur maximale.'
      },
      hydration: {
        title: 'Hydratation et nutrition',
        hint: 'Indicateurs simples mais cruciaux pour la performance.'
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
      recoveryPrs: 'Récupération PRS'
    },
    pain: {
      fingers: 'Doigts et articulations',
      pipDorsalTitle: 'Douleur DORSALE sur articulation PIP ?',
      pipDorsalExplain: "Douleur sur le DESSUS de l'articulation entre la 1re et la 2e phalange (pas la pulpe). Signal d'arrêt impératif.",
      forearm: 'Avant-bras (zone fléchisseurs)',
      shoulders: 'Épaules / lats',
      elbow: 'Coude médial',
      back: 'Bas du dos',
      skin: 'Peau (paumes / doigts)',
      other: 'Autre douleur (optionnel)',
      otherPlaceholder: 'Décris brièvement…'
    },
    hydration: {
      urine: 'Couleur de la première urine',
      urineLow: 'Clair',
      urineHigh: 'Très foncé',
      skippedMeal: 'As-tu sauté un repas hier ?',
      note: 'Note libre (optionnel)',
      notePlaceholder: 'Quelque chose à ajouter pour le coach ?'
    },
    scale: {
      zero: '0',
      ten: '10'
    },
    form: {
      submit: 'Calculer mon Track du jour',
      disclaimer: "Tes réponses ne sont envoyées qu'à ton coach via WhatsApp, et seulement si tu décides de les partager."
    },
    validation: {
      missingName: 'Indique ton prénom avant de continuer.',
      missingLikert: 'Réponds à toutes les questions obligatoires de la section Bien-être, Sommeil et Hydratation.'
    },
    result: {
      trackA: 'TRACK A',
      trackB: 'TRACK B',
      readiness: 'READINESS',
      todaysCheckin: 'Check-in du jour',
      helloPrefix: 'Bonjour',
      indicators: 'Indicateurs',
      noFlags: "Aucun signal d'alerte. Belle nuit, beau profil.",
      scrollHint: 'Voir les détails',
      sendWhatsapp: 'Envoyer au coach via WhatsApp',
      edit: 'Modifier',
      restart: 'Recommencer',
      messageGreen: "Tu es prêt(e) ! Charge complète, journée d'overreaching activée.",
      kindnessGreen: "On y va à fond, mais on reste à l'écoute du corps. Si quelque chose change, parle au coach immédiatement.",
      messageYellowSoft: "Tu n'es pas à 100%. On réévalue sur le terrain.",
      kindnessYellowSoft: "Démarrage progressif, on ajuste après le warm-up. Sois honnête avec toi-même.",
      messageYellowHard: 'Plusieurs signaux de fatigue. On allège la journée.',
      kindnessYellowHard: "C'est OK de ralentir aujourd'hui. La récup fait partie de la prépa.",
      messageRed: "Journée de récupération. Volume réduit, technique à l'aise.",
      kindnessRed: "Écouter son corps, c'est aussi un acte de performance. On reviendra plus fort demain.",
      messageMedical: "STOP. Évaluation médicale requise avant toute charge.",
      kindnessMedical: "Préviens immédiatement le coach et l'équipe médicale. Ne grimpe pas aujourd'hui.",
      flagPipDorsal: 'PIP dorsale signalée — arrêt impératif',
      flagSleepShort: 'Sommeil court (< 7h)',
      flagSleepBorderline: 'Sommeil limite (< 8h)',
      flagLowEnergy: 'Énergie basse',
      flagMidEnergy: 'Énergie moyenne',
      flagLowMuscles: 'Muscles courbatés',
      flagMidMuscles: 'Muscles moyens',
      flagLowForearms: 'Avant-bras cuits',
      flagMidForearms: 'Avant-bras moyens',
      flagLowCalm: 'Stress élevé',
      flagMidCalm: 'Sérénité moyenne',
      flagLowMood: 'Humeur basse',
      flagMidMood: 'Humeur moyenne',
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
      flagUrineDark: 'Hydratation insuffisante',
      flagSkippedMeal: 'Repas sauté hier',
      stat: {
        sleep: 'Sommeil',
        energy: 'Énergie',
        muscles: 'Muscles',
        forearms: 'Avant-bras',
        calm: 'Sérénité',
        mood: 'Humeur',
        willingness: 'Disposition',
        recovery: 'Récup PRS',
        unitHours: 'h',
        unitOf5: '/5',
        unitOf10: '/10'
      }
    },
    settings: {
      title: 'Paramètres',
      coachPhone: 'Numéro WhatsApp du coach',
      coachPhoneHint: 'Format international sans + ni espace. Exemple Canada : 14186095751.',
      langLabel: 'Langue',
      langFr: 'Français',
      langEn: 'English',
      save: 'Enregistrer',
      saved: 'Paramètres enregistrés.'
    },
    whatsapp: {
      title: '🇨🇦 CEC · Check-in matinal',
      noPhone: "Configure d'abord le numéro du coach dans les Paramètres.",
      labelAthlete: 'Athlète',
      labelDate: 'Date',
      labelDiscipline: 'Discipline',
      labelTrack: 'Track du jour',
      labelMessage: 'Message',
      labelFlags: 'Indicateurs',
      labelData: 'Données clés',
      labelNote: 'Note',
      labelNoFlags: 'Aucun signal',
      sleep: 'Sommeil',
      energy: 'Énergie',
      muscles: 'Muscles',
      forearms: 'Avant-bras',
      calm: 'Sérénité',
      mood: 'Humeur',
      willingness: 'Disposition',
      recovery: 'Récup PRS',
      pip: 'PIP dorsale',
      pipYes: 'OUI',
      pipNo: 'non'
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
      title: 'Morning check-in',
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
      disclaimer: 'Your answers stay on your phone until you choose to send them to coach.',
      missingName: 'Enter your first name to start.',
      missingDiscipline: 'Pick a discipline.',
      missingProfile: 'Pick your Arco profile.'
    },
    athlete: {
      label: 'Athlete',
      placeholder: 'Your first name'
    },
    sections: {
      sleep: {
        title: 'Sleep',
        hint: 'Enter your timings from last night.'
      },
      wellbeing: {
        title: 'Well-being',
        hint: 'Uniform scale. 1 = very poor. 5 = top form. Higher = better.'
      },
      pain: {
        title: 'Pain (NRS 0-10)',
        hint: '0 = no pain. 10 = maximum pain.'
      },
      hydration: {
        title: 'Hydration & Nutrition',
        hint: 'Simple but crucial performance markers.'
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
      recoveryPrs: 'PRS recovery'
    },
    pain: {
      fingers: 'Fingers and joints',
      pipDorsalTitle: 'DORSAL pain on PIP joint?',
      pipDorsalExplain: 'Pain on the TOP of the joint between the 1st and 2nd phalanx (not the pad). Mandatory stop signal.',
      forearm: 'Forearm (flexor area)',
      shoulders: 'Shoulders / lats',
      elbow: 'Medial elbow',
      back: 'Lower back',
      skin: 'Skin (palms / fingers)',
      other: 'Other pain (optional)',
      otherPlaceholder: 'Describe briefly…'
    },
    hydration: {
      urine: 'First urine color',
      urineLow: 'Clear',
      urineHigh: 'Very dark',
      skippedMeal: 'Did you skip a meal yesterday?',
      note: 'Free note (optional)',
      notePlaceholder: 'Anything to add for coach?'
    },
    scale: {
      zero: '0',
      ten: '10'
    },
    form: {
      submit: "Calculate today's Track",
      disclaimer: 'Your answers are only sent to your coach via WhatsApp, and only if you choose to share them.'
    },
    validation: {
      missingName: 'Enter your first name before continuing.',
      missingLikert: 'Answer all required questions in the Sleep, Well-being and Hydration sections.'
    },
    result: {
      trackA: 'TRACK A',
      trackB: 'TRACK B',
      readiness: 'READINESS',
      todaysCheckin: "Today's check-in",
      helloPrefix: 'Hello',
      indicators: 'Indicators',
      noFlags: 'No alert signals. Solid night, solid profile.',
      scrollHint: 'See details',
      sendWhatsapp: 'Send to coach via WhatsApp',
      edit: 'Edit',
      restart: 'Restart',
      messageGreen: "You're ready! Full load, overreaching day activated.",
      kindnessGreen: "Push hard, but stay tuned to your body. If anything changes, talk to coach immediately.",
      messageYellowSoft: "You're not at 100%. We'll reassess on the wall.",
      kindnessYellowSoft: 'Easy start, we adjust after warm-up. Be honest with yourself.',
      messageYellowHard: "Multiple fatigue signals. Lighter day today.",
      kindnessYellowHard: "It's OK to slow down today. Recovery is part of the prep.",
      messageRed: 'Recovery day. Reduced volume, easy technique work.',
      kindnessRed: "Listening to your body is also a performance act. We'll come back stronger tomorrow.",
      messageMedical: 'STOP. Medical evaluation required before any load.',
      kindnessMedical: 'Notify the coach and medical team immediately. Do not climb today.',
      flagPipDorsal: 'Dorsal PIP reported — mandatory stop',
      flagSleepShort: 'Short sleep (< 7h)',
      flagSleepBorderline: 'Borderline sleep (< 8h)',
      flagLowEnergy: 'Low energy',
      flagMidEnergy: 'Mid energy',
      flagLowMuscles: 'Sore muscles',
      flagMidMuscles: 'Mid muscle state',
      flagLowForearms: 'Cooked forearms',
      flagMidForearms: 'Mid forearm state',
      flagLowCalm: 'High stress',
      flagMidCalm: 'Mid serenity',
      flagLowMood: 'Low mood',
      flagMidMood: 'Mid mood',
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
      flagUrineDark: 'Insufficient hydration',
      flagSkippedMeal: 'Skipped meal yesterday',
      stat: {
        sleep: 'Sleep',
        energy: 'Energy',
        muscles: 'Muscles',
        forearms: 'Forearms',
        calm: 'Calm',
        mood: 'Mood',
        willingness: 'Willingness',
        recovery: 'PRS recovery',
        unitHours: 'h',
        unitOf5: '/5',
        unitOf10: '/10'
      }
    },
    settings: {
      title: 'Settings',
      coachPhone: "Coach's WhatsApp number",
      coachPhoneHint: 'International format without + or spaces. Canada example: 14186095751.',
      langLabel: 'Language',
      langFr: 'Français',
      langEn: 'English',
      save: 'Save',
      saved: 'Settings saved.'
    },
    whatsapp: {
      title: '🇨🇦 CEC · Morning check-in',
      noPhone: "First, set the coach's number in Settings.",
      labelAthlete: 'Athlete',
      labelDate: 'Date',
      labelDiscipline: 'Discipline',
      labelTrack: "Today's track",
      labelMessage: 'Message',
      labelFlags: 'Indicators',
      labelData: 'Key data',
      labelNote: 'Note',
      labelNoFlags: 'No alerts',
      sleep: 'Sleep',
      energy: 'Energy',
      muscles: 'Muscles',
      forearms: 'Forearms',
      calm: 'Calm',
      mood: 'Mood',
      willingness: 'Willingness',
      recovery: 'PRS recovery',
      pip: 'Dorsal PIP',
      pipYes: 'YES',
      pipNo: 'no'
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
