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
  const [blockedByContent, setBlockedByContent] = useState(false);

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

  // Hide where the page already has dense CTAs or forms.
  useEffect(() => {
    const targets = ['services', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (targets.length === 0) return;

    const visibility = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visibility.set(entry.target, entry.isIntersecting));
        setBlockedByContent(Array.from(visibility.values()).some(Boolean));
      },
      { threshold: 0.18 }
    );

    targets.forEach((target) => {
      visibility.set(target, false);
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, []);

  if (dismissed || blockedByContent) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="fixed bottom-4 left-4 z-30 md:hidden"
        >
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-bg-card/95 p-1.5 shadow-glow backdrop-blur">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full gradient-bg px-4 py-2 text-xs font-semibold text-white transition-shadow hover:shadow-glow"
            >
              {t('cta')}
            </a>
            <button
              onClick={() => setDismissed(true)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
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
