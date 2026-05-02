'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import Button from '@/components/ui/Button';
import { getWhatsAppUrl } from '@/lib/constants';
import {
  AuditReportPreview,
  ServiceMockup,
  getServiceVisualCopy,
  type ServiceVariant,
} from '@/components/VisualMockups';

interface SEOPageProps {
  title: string;
  subtitle: string;
  description: string;
  localContext: string;
  faqs?: { q: string; a: string }[];
  serviceEmoji: string;
  serviceVariant: ServiceVariant;
  pricingInfo: {
    from: string;
    to?: string;
    currencyLabel?: string;
    note?: string;
  };
}

export default function SEOPageClient({
  title,
  subtitle,
  description,
  localContext,
  faqs,
  serviceEmoji,
  serviceVariant,
  pricingInfo,
}: SEOPageProps) {
  const t = useTranslations('seoPages');
  const locale = useLocale();
  const whatsappUrl = getWhatsAppUrl(locale);
  const visual = getServiceVisualCopy(serviceVariant, locale);
  const isEnglish = locale === 'en';
  const currencyLabel = pricingInfo.currencyLabel ?? 'FCFA';
  const priceText = [pricingInfo.from, currencyLabel].filter(Boolean).join(' ');
  const rangeText =
    pricingInfo.to && currencyLabel === 'FCFA'
      ? t('pricingRange', { price: pricingInfo.to })
      : pricingInfo.to && currencyLabel
        ? t('pricingRange', { price: `${pricingInfo.to} ${currencyLabel}` })
      : pricingInfo.to
        ? t('pricingRange', { price: pricingInfo.to })
        : pricingInfo.note;

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <section className="container-custom mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center"
          >
            <div className="text-center lg:text-left">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-glass px-4 py-2 text-sm text-text-secondary">
                <span className="text-lg" aria-hidden="true">{serviceEmoji}</span>
                {visual.eyebrow}
              </span>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-text-primary leading-tight mb-4 text-balance">
                {title}
              </h1>
              <p className="text-lg text-accent-violet mb-4">{subtitle}</p>
              <p className="text-text-secondary leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">{description}</p>

              <div className="mb-8 grid gap-3 sm:grid-cols-3">
                {visual.deliverables.map((item) => (
                  <div key={item} className="rounded-xl border border-border-subtle bg-bg-card/70 p-3 text-left">
                    <div className="mb-2 grid h-7 w-7 place-items-center rounded-lg bg-accent-cyan/10 text-accent-cyan">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <p className="text-sm text-text-secondary">{item}</p>
                  </div>
                ))}
              </div>

              <Button size="lg" href={whatsappUrl} external>
                {t('ctaText')} {'->'}
              </Button>
            </div>

            <ServiceMockup variant={serviceVariant} locale={locale} className="mx-auto w-full max-w-[520px]" />
          </motion.div>
        </section>

        <section className="container-custom mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch"
          >
            <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle">
              <p className="text-xs uppercase text-accent-cyan mb-3">
                {isEnglish ? 'Local market context' : 'Contexte du marche local'}
              </p>
              <p className="text-text-secondary leading-relaxed text-lg">{localContext}</p>
            </div>
            <AuditReportPreview locale={locale} />
          </motion.div>
        </section>

        <section className="container-custom mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-accent-violet/10 to-accent-blue/10 border border-accent-violet/20">
              <h2 className="font-heading font-bold text-2xl mb-4">{t('pricingTitle')}</h2>
              <p className="text-text-secondary mb-2">{t('pricingFrom')}</p>
              <p className="font-heading font-bold text-4xl gradient-text mb-1">
                {priceText}
              </p>
              {rangeText && <p className="text-text-muted text-sm mb-6">{rangeText}</p>}
              <Button href={whatsappUrl} external>
                {t('pricingCta')}
              </Button>
            </div>
          </motion.div>
        </section>

        {faqs && faqs.length > 0 && (
          <section className="container-custom mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-center mb-10">
                {t('faqTitle')}
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={`${faq.q}-${index}`}
                    className="group p-6 rounded-xl bg-bg-card border border-border-subtle"
                  >
                    <summary className="font-heading font-medium text-text-primary cursor-pointer list-none flex items-center justify-between">
                      {faq.q}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0 group-open:rotate-180 transition-transform"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>
                    <p className="mt-4 text-text-secondary leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        <section className="container-custom">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl gradient-bg">
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-white mb-4">
              {t('ctaText')}
            </h2>
            <p className="text-white/70 mb-6">{t('ctaSubtext')}</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-bg-primary font-medium px-8 py-3 rounded-full hover:shadow-lg transition-all"
            >
              {t('whatsappCta')} {'->'}
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
