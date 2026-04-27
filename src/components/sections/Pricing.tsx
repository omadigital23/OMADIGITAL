'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { WHATSAPP_URL } from '@/lib/constants';

type PlanCategory = 'website' | 'mobile' | 'ai';

const plans: Record<PlanCategory, { tier: string; priceKey: string; descKey: string; featuresKey: string; popular?: boolean }[]> = {
  website: [
    { tier: 'starter', priceKey: 'starterWebPrice', descKey: 'starterWebDesc', featuresKey: 'starterWeb' },
    { tier: 'business', priceKey: 'businessWebPrice', descKey: 'businessWebDesc', featuresKey: 'businessWeb', popular: true },
    { tier: 'premium', priceKey: 'premiumWebPrice', descKey: 'premiumWebDesc', featuresKey: 'premiumWeb' },
  ],
  mobile: [
    { tier: 'starter', priceKey: 'starterMobilePrice', descKey: 'starterMobileDesc', featuresKey: 'starterMobile' },
    { tier: 'business', priceKey: 'businessMobilePrice', descKey: 'businessMobileDesc', featuresKey: 'businessMobile', popular: true },
    { tier: 'premium', priceKey: 'premiumMobilePrice', descKey: 'premiumMobileDesc', featuresKey: 'premiumMobile' },
  ],
  ai: [
    { tier: 'starter', priceKey: 'starterAIPrice', descKey: 'starterAIDesc', featuresKey: 'starterAI' },
    { tier: 'business', priceKey: 'businessAIPrice', descKey: 'businessAIDesc', featuresKey: 'businessAI', popular: true },
    { tier: 'premium', priceKey: 'premiumAIPrice', descKey: 'premiumAIDesc', featuresKey: 'premiumAI' },
  ],
};

const categoryLabels: Record<PlanCategory, string> = {
  website: 'websitePlans',
  mobile: 'mobilePlans',
  ai: 'aiPlans',
};

export default function Pricing() {
  const t = useTranslations('pricing');
  const [active, setActive] = useState<PlanCategory>('website');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="pricing" className="py-20 md:py-28 container-custom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-12"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
          {t('sectionTitle')}{' '}
          <span className="gradient-text">{t('sectionTitleAccent')}</span>
        </h2>
        <p className="mt-4 text-text-secondary max-w-xl mx-auto">{t('sectionSubtitle')}</p>
      </motion.div>

      {/* Category toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-bg-card rounded-xl p-1 border border-border-subtle">
          {(Object.keys(plans) as PlanCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                active === cat
                  ? 'gradient-bg text-white shadow-glow'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t(categoryLabels[cat])}
            </button>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans[active].map((plan, i) => (
          <motion.div
            key={`${active}-${plan.tier}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card gradient={plan.popular} className="relative p-8 h-full flex flex-col">
              {plan.popular && (
                <Badge variant="accent" className="absolute top-4 right-4">
                  {t('popular')}
                </Badge>
              )}
              <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                {t(plan.tier)}
              </h3>
              <p className="text-sm text-text-muted mb-5">{t(plan.descKey)}</p>
              <div className="mb-6">
                <span className="font-heading font-bold text-3xl gradient-text">{t(plan.priceKey)}</span>
                <span className="text-text-muted text-sm ml-1">FCFA</span>
              </div>

              <div className="space-y-3 mb-8 flex-grow">
                {(() => {
                  const features: string[] = [];
                  for (let j = 0; j < 8; j++) {
                    try {
                      const key = `${plan.featuresKey}Features.${j}` as string;
                      // We'll use hardcoded features based on category and tier
                    } catch { break; }
                  }
                  // Return features based on tier level
                  const featureMap: Record<string, string[]> = {
                    'starterWeb': ['Site vitrine 5 pages', 'Design responsive', 'Formulaire de contact', 'SEO de base', 'Hébergement 1 an'],
                    'businessWeb': ['Site jusqu\'à 15 pages', 'Design premium', 'Blog intégré', 'SEO avancé', 'Analytics', 'Chat en direct'],
                    'premiumWeb': ['Site e-commerce illimité', 'Paiement Wave/OM', 'Gestion des stocks', 'Dashboard admin', 'Chatbot IA', 'Support 24/7'],
                    'starterMobile': ['App Android ou iOS', 'Design UI/UX', '5 écrans max', 'Notifications push', 'Support 3 mois'],
                    'businessMobile': ['App Android + iOS', 'Design premium', 'Écrans illimités', 'Backend API', 'Paiement mobile', 'Support 6 mois'],
                    'premiumMobile': ['App Android + iOS + Web', 'Architecture scalable', 'IA intégrée', 'Analytics avancés', 'Multi-langue', 'Support 1 an'],
                    'starterAI': ['Chatbot IA basique', '1 workflow automatisé', 'Intégration WhatsApp', 'Formation équipe', 'Support 3 mois'],
                    'businessAI': ['Chatbot IA avancé', '5 workflows', 'CRM automatisé', 'Rapports IA', 'Intégration email/SMS', 'Support 6 mois'],
                    'premiumAI': ['IA sur mesure', 'Workflows illimités', 'Analyse prédictive', 'Dashboard temps réel', 'API personnalisée', 'Support 1 an'],
                  };
                  const feats = featureMap[plan.featuresKey] || [];
                  return feats.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-cyan)" strokeWidth="2" className="shrink-0 mt-0.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {f}
                    </div>
                  ));
                })()}
              </div>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-center py-3 rounded-xl font-medium text-sm transition-all ${
                  plan.popular
                    ? 'gradient-bg text-white hover:shadow-glow'
                    : 'border border-border-subtle text-text-primary hover:border-accent-violet hover:text-accent-violet'
                }`}
              >
                {t('ctaWhatsApp')}
              </a>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
