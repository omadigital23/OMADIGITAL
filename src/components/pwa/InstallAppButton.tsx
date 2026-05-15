'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';

type InstallChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let pwaListenersReady = false;
let serviceWorkerRegistrationStarted = false;
const promptSubscribers = new Set<(available: boolean) => void>();
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

function notifyPromptSubscribers() {
  promptSubscribers.forEach((subscriber) => subscriber(Boolean(deferredPrompt)));
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function setupPwaInstallListeners() {
  if (pwaListenersReady) {
    return;
  }

  pwaListenersReady = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notifyPromptSubscribers();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyPromptSubscribers();
  });
}

function registerServiceWorker() {
  if (serviceWorkerRegistrationStarted || !('serviceWorker' in navigator) || !window.isSecureContext) {
    return;
  }

  serviceWorkerRegistrationStarted = true;

  const register = () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  };

  if (document.readyState === 'complete') {
    register();
    return;
  }

  window.addEventListener('load', register, { once: true });
}

type InstallAppButtonProps = {
  className?: string;
  fullWidth?: boolean;
  onAfterClick?: () => void;
};

export default function InstallAppButton({
  className,
  fullWidth = false,
  onAfterClick,
}: InstallAppButtonProps) {
  const t = useTranslations('installApp');
  const [canPrompt, setCanPrompt] = useState(Boolean(deferredPrompt));
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [checkingInstallability, setCheckingInstallability] = useState(false);

  useEffect(() => {
    setupPwaInstallListeners();
    registerServiceWorker();

    const updateInstalled = () => setInstalled(isStandaloneDisplay());
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    updateInstalled();

    promptSubscribers.add(setCanPrompt);
    standaloneQuery.addEventListener('change', updateInstalled);

    return () => {
      promptSubscribers.delete(setCanPrompt);
      standaloneQuery.removeEventListener('change', updateInstalled);
    };
  }, []);

  if (installed) {
    return null;
  }

  const promptNativeInstall = async () => {
    const promptEvent = deferredPrompt;

    if (!promptEvent) {
      return false;
    }

    deferredPrompt = null;
    notifyPromptSubscribers();
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice.catch(() => null);

    if (choice?.outcome === 'accepted') {
      setInstalled(true);
    }

    onAfterClick?.();
    return true;
  };

  const waitForNativePrompt = async () => {
    for (let attempt = 0; attempt < 18; attempt += 1) {
      if (deferredPrompt) {
        return true;
      }

      await sleep(150);
    }

    return Boolean(deferredPrompt);
  };

  const handleInstall = async () => {
    if (await promptNativeInstall()) {
      return;
    }

    setCheckingInstallability(true);

    if ('serviceWorker' in navigator && window.isSecureContext) {
      await Promise.race([
        navigator.serviceWorker.ready.catch(() => undefined),
        sleep(2500),
      ]);
    }

    const promptAvailable = await waitForNativePrompt();
    setCheckingInstallability(false);

    if (promptAvailable && await promptNativeInstall()) {
      return;
    }

    setShowHelp(true);
    onAfterClick?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          void handleInstall();
        }}
        disabled={checkingInstallability}
        className={className ?? `inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-bg-glass px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-accent-cyan/40 hover:bg-accent-cyan/10 ${fullWidth ? 'w-full' : ''}`}
        aria-label={t('label')}
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3v11" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
          <path d="M6 17h12" />
        </svg>
        <span>{checkingInstallability ? t('preparing') : canPrompt ? t('label') : t('shortLabel')}</span>
      </button>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-border-subtle bg-bg-secondary p-5 shadow-float"
              initial={{ y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.98 }}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">
                    {t('eyebrow')}
                  </p>
                  <h2 id="install-app-title" className="font-heading text-xl font-semibold text-text-primary">
                    {t('helpTitle')}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-subtle text-text-secondary transition-colors hover:text-text-primary"
                  aria-label={t('close')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
                <p>{t('desktopHelp')}</p>
                <p>{t('mobileHelp')}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="mt-5 w-full rounded-xl gradient-bg px-4 py-3 text-sm font-semibold text-white transition-shadow hover:shadow-glow"
              >
                {t('understood')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
