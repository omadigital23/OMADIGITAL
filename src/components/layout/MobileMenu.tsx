'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { NAV_ITEMS, getWhatsAppUrl } from '@/lib/constants';
import { motion, AnimatePresence } from 'motion/react';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onSwitchLocale: () => void;
}

export default function MobileMenu({ open, onClose, onSwitchLocale }: MobileMenuProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const whatsappUrl = getWhatsAppUrl(locale);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[300px] bg-bg-secondary border-l border-border-subtle z-50 flex flex-col"
          >
            {/* Close */}
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="p-2 text-text-secondary hover:text-text-primary"
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col px-6 gap-2">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block py-3 text-lg text-text-secondary hover:text-text-primary transition-colors border-b border-border-subtle"
                  >
                    {t(item.labelKey.replace('nav.', ''))}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="mt-auto p-6 flex flex-col gap-3">
              <button
                onClick={() => { onSwitchLocale(); onClose(); }}
                className="w-full py-3 text-sm text-text-secondary border border-border-subtle rounded-xl hover:border-border-medium transition-colors"
              >
                {t('languageSwitch')}
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="block w-full py-3 text-center gradient-bg text-white font-medium rounded-xl hover:shadow-glow transition-all"
              >
                {t('auditCta')}
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
