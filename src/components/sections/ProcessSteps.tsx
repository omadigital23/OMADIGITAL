'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const STEPS = [
  { num: '01', icon: '🎯', titleKey: 'step1Title', descKey: 'step1Desc' },
  { num: '02', icon: '🔍', titleKey: 'step2Title', descKey: 'step2Desc' },
  { num: '03', icon: '⚙️', titleKey: 'step3Title', descKey: 'step3Desc' },
  { num: '04', icon: '🚀', titleKey: 'step4Title', descKey: 'step4Desc' },
];

export default function ProcessSteps() {
  const t = useTranslations('process');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-bg-secondary overflow-hidden">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
            {t('sectionTitle')}{' '}
            <span className="gradient-text">{t('sectionTitleAccent')}</span>
          </h2>
          <p className="mt-4 text-text-secondary max-w-xl mx-auto">{t('sectionSubtitle')}</p>
        </motion.div>

        <div className="relative">
          {/* Ligne de connexion desktop */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-accent-violet/30 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.15 }}
                className="flex flex-col items-center text-center relative"
              >
                {/* Cercle numéroté */}
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center shadow-glow">
                    <span className="text-3xl">{step.icon}</span>
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg-primary border border-border-subtle text-[10px] font-bold text-accent-violet flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-text-primary mb-2">{t(step.titleKey)}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{t(step.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Garantie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap justify-center gap-6"
        >
          {['g1', 'g2', 'g3'].map((key) => (
            <div key={key} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-bg-card border border-border-subtle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-cyan)" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span className="text-sm text-text-secondary">{t(key)}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
