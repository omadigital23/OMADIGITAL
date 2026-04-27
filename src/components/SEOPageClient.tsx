'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import Button from '@/components/ui/Button';
import { WHATSAPP_URL } from '@/lib/constants';

interface SEOPageProps {
  title: string;
  subtitle: string;
  description: string;
  localContext: string;
  faqs?: { q: string; a: string }[];
  serviceEmoji: string;
  pricingInfo: { from: string; to: string };
}

export default function SEOPageClient({
  title,
  subtitle,
  description,
  localContext,
  faqs,
  serviceEmoji,
  pricingInfo,
}: SEOPageProps) {
  const t = useTranslations('seoPages');

  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <section className="container-custom mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-5xl mb-6 block">{serviceEmoji}</span>
            <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-text-primary leading-tight mb-4">
              {title}
            </h1>
            <p className="text-lg text-accent-violet mb-4">{subtitle}</p>
            <p className="text-text-secondary leading-relaxed mb-8">{description}</p>
            <Button size="lg" href={WHATSAPP_URL} external>
              {t('ctaText')} {'->'}
            </Button>
          </motion.div>
        </section>

        <section className="container-custom mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle">
              <p className="text-text-secondary leading-relaxed text-lg">{localContext}</p>
            </div>
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
                {pricingInfo.from} FCFA
              </p>
              <p className="text-text-muted text-sm mb-6">
                {t('pricingRange', { price: pricingInfo.to })}
              </p>
              <Button href={WHATSAPP_URL} external>
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
              href={WHATSAPP_URL}
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
