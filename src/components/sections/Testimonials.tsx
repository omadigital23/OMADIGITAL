'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

const testimonialKeys = [
  { quoteKey: 'quote1', nameKey: 'name1', companyKey: 'company1', roleKey: 'role1', rating: 5 },
  { quoteKey: 'quote2', nameKey: 'name2', companyKey: 'company2', roleKey: 'role2', rating: 5 },
  { quoteKey: 'quote3', nameKey: 'name3', companyKey: 'company3', roleKey: 'role3', rating: 5 },
];

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 md:py-28 container-custom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-16"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
          {t('sectionTitle')}{' '}
          <span className="gradient-text">{t('sectionTitleAccent')}</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {testimonialKeys.map((item, i) => (
          <motion.div
            key={item.nameKey}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="relative p-8 rounded-2xl bg-bg-card border border-border-subtle hover:border-border-medium transition-all"
          >
            {/* Quote mark */}
            <div className="absolute top-4 right-6 text-6xl text-accent-violet/10 font-serif leading-none">&ldquo;</div>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: item.rating }).map((_, j) => (
                <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent-gold)" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-text-secondary text-sm leading-relaxed mb-6 italic">
              &ldquo;{t(item.quoteKey)}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">
                {t(item.nameKey).charAt(0)}
              </div>
              <div>
                <div className="font-medium text-text-primary text-sm">{t(item.nameKey)}</div>
                <div className="text-xs text-text-muted">
                  {t(item.roleKey)}, {t(item.companyKey)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
