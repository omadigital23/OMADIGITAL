'use client';

import { useTranslations } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const services = [
  {
    id: 'website',
    icon: '🌐',
    titleKey: 'website',
    descKey: 'websiteDesc',
    price: '150 000',
    href: '/creation-site-web-senegal',
    featured: false,
  },
  {
    id: 'mobile',
    icon: '📱',
    titleKey: 'mobile',
    descKey: 'mobileDesc',
    price: '300 000',
    href: '/application-mobile-senegal',
    featured: false,
  },
  {
    id: 'ai',
    icon: '🤖',
    titleKey: 'ai',
    descKey: 'aiDesc',
    price: '200 000',
    href: '/automatisation-ia-senegal',
    featured: true,
  },
];

export default function Services() {
  const t = useTranslations('services');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} id="services" className="py-20 md:py-28 container-custom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="text-center mb-16"
      >
        <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl">
          {t('sectionTitle')}{' '}
          <span className="gradient-text">{t('sectionTitleAccent')}</span>
        </h2>
        <p className="mt-4 text-text-secondary max-w-xl mx-auto">
          {t('sectionSubtitle')}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {services.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.15 }}
          >
            <Card gradient={service.featured} className="relative p-8 h-full flex flex-col">
              {service.featured && (
                <Badge variant="accent" className="absolute top-4 right-4">
                  {t('featured')}
                </Badge>
              )}
              <span className="text-4xl mb-5 block">{service.icon}</span>
              <h3 className="font-heading font-semibold text-xl text-text-primary mb-3">
                {t(service.titleKey)}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed mb-6 flex-grow">
                {t(service.descKey)}
              </p>
              <div className="mb-5">
                <span className="text-xs text-text-muted">{t('startingAt')}</span>
                <span className="block font-heading font-bold text-2xl gradient-text">
                  {service.price} FCFA
                </span>
              </div>
              <Link
                href={service.href}
                className="inline-flex items-center gap-2 text-sm text-accent-violet hover:text-accent-blue transition-colors group"
              >
                {t('learnMore')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
