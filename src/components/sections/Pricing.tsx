'use client';

import { useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, useInView } from 'motion/react';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { getWhatsAppUrl } from '@/lib/constants';

type PlanCategory = 'website' | 'mobile' | 'ai';

const plans: Record<
  PlanCategory,
  { tier: string; priceKey: string; descKey: string; featuresKey: string; popular?: boolean }[]
> = {
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

const FEATURE_SLOTS = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'] as const;

export default function Pricing() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const whatsappUrl = getWhatsAppUrl(locale);
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

      {/* Category tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-bg-card rounded-xl p-1 border border-border-subtle">
          {(Object.keys(plans) as PlanCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setActive(category)}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                active === category
                  ? 'gradient-bg text-white shadow-glow'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {t(categoryLabels[category])}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {plans[active].map((plan, index) => (
          <motion.div
            key={`${active}-${plan.tier}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{t('includes')}</p>
                {FEATURE_SLOTS.map((slot) => {
                  const featureText = t(`features.${plan.featuresKey}.${slot}` as Parameters<typeof t>[0]);
                  if (!featureText) return null;
                  return (
                    <div key={slot} className="flex items-start gap-2 text-sm text-text-secondary">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--color-accent-cyan)"
                        strokeWidth="2"
                        className="shrink-0 mt-0.5"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {featureText}
                    </div>
                  );
                })}
              </div>

              <a
                href={whatsappUrl}
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
