'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { getWhatsAppUrl } from '@/lib/constants';

export default function StickyAuditBar() {
  const t = useTranslations('stickyBar');
  const locale = useLocale();
  const whatsappUrl = getWhatsAppUrl(locale);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Apparaît après 4s ou après scroll de 400px
    const timer = setTimeout(() => setVisible(true), 4000);
    const onScroll = () => {
      if (window.scrollY > 400) setVisible(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Disparaît quand on est proche du formulaire CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    const target = document.getElementById('contact');
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
        >
          <div className="mx-4 mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl gradient-bg shadow-glow border border-white/10">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight truncate">{t('title')}</p>
              <p className="text-white/70 text-xs truncate">{t('subtitle')}</p>
            </div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-white text-bg-primary font-semibold text-xs px-4 py-2 rounded-xl hover:bg-white/90 transition-colors"
            >
              {t('cta')}
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 text-white/50 hover:text-white p-1"
              aria-label="Fermer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
