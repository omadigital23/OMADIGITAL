'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import Image from 'next/image';

const testimonialKeys = [
  {
    quoteKey: 'quote1',
    nameKey: 'name1',
    companyKey: 'company1',
    roleKey: 'role1',
    linkKey: 'link1',
    logo: '/images/logo_sojif.png',
    rating: 5,
  },
  {
    quoteKey: 'quote2',
    nameKey: 'name2',
    companyKey: 'company2',
    roleKey: 'role2',
    linkKey: 'link2',
    logo: '/images/logo_nubia_aura.png',
    rating: 5,
  },
  {
    quoteKey: 'quote3',
    nameKey: 'name3',
    companyKey: 'company3',
    roleKey: 'role3',
    linkKey: 'link3',
    logo: '/images/logo_gueye_agro.png',
    rating: 5,
  },
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
        {testimonialKeys.map((item, i) => {
          const link = t(item.linkKey);
          return (
            <motion.div
              key={item.nameKey}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15 }}
              className="relative flex flex-col p-8 rounded-2xl bg-bg-card border border-border-subtle hover:border-border-medium transition-all"
            >
              {/* Quote mark */}
              <div className="absolute top-4 right-6 text-6xl text-accent-violet/10 font-serif leading-none">&ldquo;</div>

              {/* Header: logo + infos */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0 border border-border-subtle">
                  <Image
                    src={item.logo}
                    alt={t(item.companyKey)}
                    width={56}
                    height={56}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div>
                  <div className="font-medium text-text-primary text-sm">{t(item.nameKey)}</div>
                  <div className="text-xs text-text-muted">
                    {t(item.roleKey)}, {t(item.companyKey)}
                  </div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, j) => (
                  <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent-gold)" stroke="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-secondary text-sm leading-relaxed italic flex-1">
                &ldquo;{t(item.quoteKey)}&rdquo;
              </p>

              {/* Lien discret */}
              {link && (
                <div className="mt-5 pt-4 border-t border-border-subtle">
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-violet hover:text-accent-blue transition-colors"
                  >
                    {t('viewSite')} →
                  </a>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
