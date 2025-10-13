/**
 * 🎯 STRATÉGIES CTA MARKETING AVANCÉES - OMA DIGITAL
 * Techniques persuasives pour éviter les prix directs et maximiser les conversions
 */

export const MARKETING_CTA_STRATEGIES = {
  
  /**
   * 🚫 DÉTECTION QUESTIONS PRIX - Mots déclencheurs
   */
  PRICE_TRIGGERS: [
    'prix', 'price', 'coût', 'cost', 'tarif', 'combien', 'how much',
    'CFA', 'euro', 'dollar', 'budget', 'investissement', 'payer',
    'gratuit', 'free', 'cher', 'expensive', 'abordable', 'affordable'
  ],

  /**
   * 💰 RÉPONSES ANTI-PRIX avec CTA psychologique
   */
  PRICE_DEFLECTION_RESPONSES: {
    fr: [
      {
        response: "Le plus important n'est pas le budget initial, mais votre retour sur investissement. Nos solutions génèrent plus qu'elles ne coûtent !",
        cta: "Calculer votre ROI personnalisé en 2 minutes",
        psychology: "focus_on_roi"
      },
      {
        response: "Plutôt que de parler chiffres, laissez-moi vous montrer la valeur créée. Nos clients voient en moyenne un retour dès les 30 premiers jours.",
        cta: "Découvrir combien vous pourriez économiser",
        psychology: "value_demonstration"
      },
      {
        response: "Chaque PME étant unique, analysons d'abord votre situation. Ce qui compte vraiment, c'est combien vous allez gagner grâce à ces outils.",
        cta: "Audit gratuit pour évaluer votre potentiel",
        psychology: "personalization"
      },
      {
        response: "Nos 200+ clients PME ont en moyenne doublé leurs revenus en 90 jours. L'investissement devient rapidement rentable.",
        cta: "Voir comment d'autres PME comme vous ont réussi",
        psychology: "social_proof"
      }
    ],
    en: [
      {
        response: "The most important thing isn't the initial budget, but your return on investment. Our solutions generate more than they cost!",
        cta: "Calculate your personalized ROI in 2 minutes",
        psychology: "focus_on_roi"
      },
      {
        response: "Rather than talk numbers, let me show you the value created. Our clients see ROI within the first 30 days on average.",
        cta: "Discover how much you could save",
        psychology: "value_demonstration"
      },
      {
        response: "Every business is unique, let's first analyze your situation. What really matters is how much you'll gain from these tools.",
        cta: "Free audit to evaluate your potential",
        psychology: "personalization"
      },
      {
        response: "Our 200+ SME clients have doubled their revenue on average in 90 days. The investment quickly becomes profitable.",
        cta: "See how other SMEs like yours have succeeded",
        psychology: "social_proof"
      }
    ]
  },

  /**
   * 🎯 CTA PAR TYPE DE SERVICE
   */
  SERVICE_SPECIFIC_CTAS: {
    whatsapp_automation: {
      fr: [
        "Voir votre futur chatbot WhatsApp en action",
        "Calculer combien d'heures vous pourriez économiser",
        "Découvrir comment gérer 10x plus de clients",
        "Audit gratuit de vos conversations WhatsApp actuelles"
      ],
      en: [
        "See your future WhatsApp chatbot in action",
        "Calculate how many hours you could save",
        "Discover how to manage 10x more clients",
        "Free audit of your current WhatsApp conversations"
      ]
    },
    website: {
      fr: [
        "Audit gratuit de votre site actuel",
        "Voir combien de ventes vous perdez chaque jour",
        "Calculer votre potentiel de conversion",
        "Découvrir pourquoi vos concurrents vendent plus"
      ],
      en: [
        "Free audit of your current website",
        "See how many sales you're losing each day",
        "Calculate your conversion potential",
        "Discover why your competitors sell more"
      ]
    },
    mobile_app: {
      fr: [
        "Prototype de votre app en 48h",
        "Voir comment une app booste vos ventes",
        "Calculer le ROI d'une app mobile pour votre secteur"
      ],
      en: [
        "Prototype of your app in 48h",
        "See how an app boosts your sales",
        "Calculate the ROI of a mobile app for your sector"
      ]
    }
  },

  /**
   * 🧠 TECHNIQUES PSYCHOLOGIQUES
   */
  PSYCHOLOGY_TECHNIQUES: {
    urgency: {
      fr: [
        "Chaque jour sans automatisation vous coûte des ventes",
        "Vos concurrents prennent déjà de l'avance",
        "Plus vous attendez, plus vous perdez d'opportunités"
      ],
      en: [
        "Every day without automation costs you sales",
        "Your competitors are already getting ahead",
        "The longer you wait, the more opportunities you lose"
      ]
    },
    social_proof: {
      fr: [
        "Découvrez pourquoi 98% de nos clients recommandent OMA",
        "Rejoignez les 200+ PME qui ont transformé leur business",
        "Voir les résultats de PME similaires à la vôtre"
      ],
      en: [
        "Discover why 98% of our clients recommend OMA",
        "Join the 200+ SMEs who transformed their business",
        "See results from SMEs similar to yours"
      ]
    },
    scarcity: {
      fr: [
        "Places limitées pour notre audit gratuit ce mois-ci",
        "Seulement quelques créneaux disponibles pour une démo",
        "Offre découverte réservée aux 10 premières PME"
      ],
      en: [
        "Limited spots for our free audit this month",
        "Only a few slots available for a demo",
        "Discovery offer reserved for the first 10 SMEs"
      ]
    }
  }
};

/**
 * 🤖 FONCTION DE SÉLECTION CTA INTELLIGENT
 */
export const selectSmartCTA = (
  userMessage: string, 
  language: 'fr' | 'en' = 'fr'
): { response: string; cta: string; technique: string } => {
  
  const hasPriceTrigger = MARKETING_CTA_STRATEGIES.PRICE_TRIGGERS.some(
    trigger => userMessage.toLowerCase().includes(trigger)
  );

  if (hasPriceTrigger) {
    // Question prix détectée -> réponse anti-prix
    const deflections = MARKETING_CTA_STRATEGIES.PRICE_DEFLECTION_RESPONSES[language];
    // Fallback to French if no English deflections available
    const safeDeflections = (deflections && deflections.length > 0) ? deflections : MARKETING_CTA_STRATEGIES.PRICE_DEFLECTION_RESPONSES.fr;
    const randomIndex = Math.floor(Math.random() * safeDeflections.length);
    const randomDeflection = safeDeflections[randomIndex];
    
    // Ensure we have a valid deflection
    if (randomDeflection) {
      return {
        response: randomDeflection.response || '',
        cta: randomDeflection.cta || '',
        technique: randomDeflection.psychology || 'default'
      };
    } else {
      // Fallback if something goes wrong
      return {
        response: '',
        cta: language === 'en' ? 'Let\'s discuss your needs' : 'Discutons de vos besoins',
        technique: 'default'
      };
    }
  }

  // CTA générique avec technique psychologique
  const techniques: ('social_proof' | 'urgency' | 'scarcity')[] = ['social_proof', 'urgency', 'scarcity'];
  const randomTechnique: 'social_proof' | 'urgency' | 'scarcity' = techniques[Math.floor(Math.random() * techniques.length)] || 'social_proof';
  
  // Check if the technique exists and has translations for the requested language
  const techniqueData = MARKETING_CTA_STRATEGIES.PSYCHOLOGY_TECHNIQUES[randomTechnique as keyof typeof MARKETING_CTA_STRATEGIES.PSYCHOLOGY_TECHNIQUES];
  if (!techniqueData) {
    // Fallback to a default technique if the selected one doesn't exist
    const defaultTechnique: 'social_proof' = 'social_proof';
    const defaultPhrases = MARKETING_CTA_STRATEGIES.PSYCHOLOGY_TECHNIQUES[defaultTechnique as keyof typeof MARKETING_CTA_STRATEGIES.PSYCHOLOGY_TECHNIQUES][language as keyof typeof MARKETING_CTA_STRATEGIES.PSYCHOLOGY_TECHNIQUES.social_proof] || 
                          MARKETING_CTA_STRATEGIES.PSYCHOLOGY_TECHNIQUES[defaultTechnique as keyof typeof MARKETING_CTA_STRATEGIES.PSYCHOLOGY_TECHNIQUES].fr;
    // Ensure defaultPhrases is valid before accessing length
    if (defaultPhrases && Array.isArray(defaultPhrases) && defaultPhrases.length > 0) {
      const randomPhraseIndex = Math.floor(Math.random() * defaultPhrases.length);
      const randomPhrase = defaultPhrases[randomPhraseIndex] || (language === 'en' ? 'Discover our services' : 'Découvrir nos services');
      
      return {
        response: '',
        cta: randomPhrase,
        technique: defaultTechnique
      };
    } else {
      // Ultimate fallback
      return {
        response: '',
        cta: language === 'en' ? 'Discover our services' : 'Découvrir nos services',
        technique: 'default'
      };
    }
  }
  
  const phrases = techniqueData[language as keyof typeof techniqueData] || techniqueData.fr;
  // Ensure we have phrases to select from
  if (!phrases || !Array.isArray(phrases) || phrases.length === 0) {
    // Fallback to French phrases if none available in requested language
    const frPhrases = techniqueData.fr || [];
    if (frPhrases.length > 0) {
      const randomPhraseIndex = Math.floor(Math.random() * frPhrases.length);
      const randomPhrase = frPhrases[randomPhraseIndex] || (language === 'en' ? 'Discover our services' : 'Découvrir nos services');
      return {
        response: '',
        cta: randomPhrase,
        technique: randomTechnique
      };
    } else {
      // Ultimate fallback
      return {
        response: '',
        cta: language === 'en' ? 'Discover our services' : 'Découvrir nos services',
        technique: 'default'
      };
    }
  }
  
  // Ensure phrases is an array before accessing length
  const safePhrases = Array.isArray(phrases) ? phrases : [];
  if (safePhrases.length === 0) {
    return {
      response: '',
      cta: language === 'en' ? 'Discover our services' : 'Découvrir nos services',
      technique: 'default'
    };
  }
  
  const randomPhraseIndex = Math.floor(Math.random() * safePhrases.length);
  const randomPhrase = safePhrases[randomPhraseIndex] || (language === 'en' ? 'Discover our services' : 'Découvrir nos services');

  return {
    response: '',
    cta: randomPhrase,
    technique: randomTechnique
  };
};

/**
 * Generate marketing response (compatibility export)
 */
export function generateMarketingResponse(message: string, language: 'fr' | 'en' = 'fr') {
  return selectSmartCTA(message, language);
}

export default MARKETING_CTA_STRATEGIES;