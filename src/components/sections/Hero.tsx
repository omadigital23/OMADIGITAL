'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { WHATSAPP_URL, STATS } from '@/lib/constants';

export default function Hero() {
  const t = useTranslations();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden mesh-bg">
      {/* Floating orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[15%] left-[10%] w-64 h-64 rounded-full bg-accent-violet/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[30%] right-[10%] w-80 h-80 rounded-full bg-accent-blue/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[20%] left-[30%] w-48 h-48 rounded-full bg-accent-purple/5 blur-3xl"
        />
      </div>

      <div className="container-custom relative z-10 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge variant="accent" className="mb-6">{t('hero.badge')}</Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-balance"
          >
            {t('hero.title')}{' '}
            <span className="gradient-text">{t('hero.titleAccent')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" href={WHATSAPP_URL} external>
              {t('hero.ctaPrimary')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
            <Button variant="secondary" size="lg" href="#services">
              {t('hero.ctaSecondary')}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto"
          >
            {STATS.map((stat) => (
              <AnimatedCounter
                key={stat.labelKey}
                value={stat.value}
                suffix={stat.suffix}
                label={t(stat.labelKey)}
              />
            ))}
          </motion.div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          {['badge1', 'badge2', 'badge3', 'badge4'].map((key) => (
            <div key={key} className="flex items-center gap-2 text-text-muted text-sm">
              <div className="w-2 h-2 rounded-full bg-accent-cyan" />
              {t(`trustBadges.${key}`)}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent" />
    </section>
  );
}
