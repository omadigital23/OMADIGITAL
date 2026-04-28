'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from '@/i18n/navigation';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getWhatsAppUrl } from '@/lib/constants';

const services = [
  {
    id: 'website',
    icon: '🌐',
    titleKey: 'website',
    descKey: 'websiteDesc',
    priceKey: 'starterWebPrice',
    href: '/creation-site-web-senegal',
    featured: false,
  },
  {
    id: 'mobile',
    icon: '📱',
    titleKey: 'mobile',
    descKey: 'mobileDesc',
    priceKey: 'starterMobilePrice',
    href: '/application-mobile-senegal',
    featured: false,
  },
  {
    id: 'ai',
    icon: '🤖',
    titleKey: 'ai',
    descKey: 'aiDesc',
    priceKey: 'starterAIPrice',
    href: '/automatisation-ia-senegal',
    featured: true,
  },
];

export default function Services() {
  const t = useTranslations('services');
  const tPricing = useTranslations('pricing');
  const locale = useLocale();
  const whatsappUrl = getWhatsAppUrl(locale);
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
                  {tPricing(service.priceKey)} FCFA
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href={service.href}
                  className="inline-flex items-center gap-2 text-sm text-accent-violet hover:text-accent-blue transition-colors group"
                >
                  {t('learnMore')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-green-400 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
