/**
 * 🎯 STRATÉGIES MARKETING + CTA POUR OMA DIGITAL
 * Astuces pour éviter les prix directs et créer l'urgence/valeur
 */

export const MARKETING_STRATEGIES = {
  
  // 💰 GESTION DES QUESTIONS PRIX
  pricing: {
    patterns: ['prix', 'tarif', 'coût', 'combien', 'budget', 'price', 'cost'],
    responses: {
      fr: [
        "Nos solutions se remboursent en 3 mois grâce aux ventes qu'elles génèrent !",
        "Investissement qui devient rentable dès le premier mois.",
        "Solutions accessibles conçues spécialement pour les PME sénégalaises.",
        "Retour sur investissement garanti ou argent remboursé.",
        "Chaque projet est unique, comme votre business !"
      ],
      en: [
        "Our solutions pay for themselves within 3 months through generated sales!",
        "Investment that becomes profitable from the first month.",
        "Accessible solutions designed specifically for Senegalese SMEs.",
        "Guaranteed ROI or money back.",
        "Each project is unique, just like your business!"
      ]
    },
    cta: [
      "Audit gratuit + devis en 24h",
      "Calculer votre ROI potentiel",
      "Voir votre simulation personnalisée",
      "Démo gratuite de 15 minutes"
    ]
  },

  // 🚀 CRÉATION D'URGENCE
  urgency: {
    phrases: [
      "Vos concurrents automatisent déjà...",
      "Places limitées ce mois-ci",
      "Offre de lancement jusqu'à fin septembre",
      "Les prix augmentent en octobre",
      "Déjà 200+ PME transformées cette année"
    ]
  },

  // 💎 CRÉATION DE VALEUR
  value: {
    benefits: [
      "ROI garanti +200% en 6 mois",
      "Setup en 48h maximum",
      "Formation équipe incluse",
      "Support 24/7 en français",
      "Équipe 100% locale Sénégal-Maroc",
      "Paiement flexible (mensuel possible)"
    ]
  },

  // 🎯 CTA PUISSANTS PAR CONTEXTE
  contextual_cta: {
    whatsapp: [
      "Voir votre chatbot WhatsApp en action",
      "Démo live de votre automatisation",
      "Calculer vos économies de temps",
      "Audit gratuit de vos conversations"
    ],
    website: [
      "Voir des exemples dans votre secteur",
      "Audit gratuit de votre site actuel",
      "Simulation de votre nouveau site",
      "Benchmark vs vos concurrents"
    ],
    general: [
      "Audit gratuit de votre potentiel",
      "Simulation ROI personnalisée",
      "Consultation stratégique gratuite",
      "Voir votre transformation digitale"
    ]
  },

  // 🧠 PSYCHOLOGIE DE VENTE
  psychology: {
    social_proof: [
      "Comme 200+ PME avant vous",
      "Rejoignez nos clients satisfaits",
      "Méthode testée et approuvée",
      "Résultats déjà prouvés"
    ],
    authority: [
      "Experts en transformation digitale",
      "Spécialistes PME africaines",
      "Équipe certifiée",
      "Leaders du marché sénégalais"
    ],
    scarcity: [
      "Places limitées ce mois",
      "Agenda qui se remplit vite",
      "Offre exceptionnelle",
      "Opportunité limitée"
    ]
  }
};

/**
 * 🎯 GÉNÉRATEUR DE RÉPONSES MARKETING
 */
export function generateMarketingResponse(
  context: 'pricing' | 'whatsapp' | 'website' | 'general',
  language: 'fr' | 'en' = 'fr'
): { response: string; cta: string } {
  
  const strategies = MARKETING_STRATEGIES;
  
  switch (context) {
    case 'pricing':
      const pricingResponse = strategies.pricing.responses[language][
        Math.floor(Math.random() * strategies.pricing.responses[language].length)
      ];
      const pricingCTA = strategies.pricing.cta[
        Math.floor(Math.random() * strategies.pricing.cta.length)
      ];
      
      return {
        response: `${pricingResponse} ${strategies.value.benefits[0]}.`,
        cta: pricingCTA
      };
      
    case 'whatsapp':
      return {
        response: "Automatisation WhatsApp qui transforme vos conversations en ventes automatiques. " + 
                 strategies.value.benefits[0] + ".",
        cta: strategies.contextual_cta.whatsapp[0]
      };
      
    case 'website':
      return {
        response: "Sites web qui convertissent vos visiteurs en clients. " + 
                 strategies.psychology.social_proof[0] + ".",
        cta: strategies.contextual_cta.website[0]
      };
      
    default:
      return {
        response: "Solutions qui transforment votre PME en machine à profits. " + 
                 strategies.psychology.authority[0] + ".",
        cta: strategies.contextual_cta.general[0]
      };
  }
}

export default MARKETING_STRATEGIES;