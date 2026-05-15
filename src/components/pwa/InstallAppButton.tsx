'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type InstallChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
}

declare global {
  interface Window {
    __omaAppInstalled?: boolean;
    __omaInstallPrompt?: BeforeInstallPromptEvent | null;
    __omaPwaInstallInitialized?: boolean;
    __omaPwaInstallFallbackReady?: boolean;
  }
}

let serviceWorkerRegistrationStarted = false;
const INSTALL_PROMPT_CHANGE_EVENT = 'oma-installprompt-change';

function getDeferredPrompt() {
  return window.__omaInstallPrompt ?? null;
}

function setDeferredPrompt(prompt: BeforeInstallPromptEvent | null) {
  window.__omaInstallPrompt = prompt;
  window.dispatchEvent(new CustomEvent(INSTALL_PROMPT_CHANGE_EVENT, {
    detail: { available: Boolean(prompt) },
  }));
}

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function setupPwaInstallListeners() {
  if (window.__omaPwaInstallInitialized || window.__omaPwaInstallFallbackReady) {
    return;
  }

  window.__omaPwaInstallFallbackReady = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    setDeferredPrompt(event as BeforeInstallPromptEvent);
  });

  window.addEventListener('appinstalled', () => {
    window.__omaAppInstalled = true;
    setDeferredPrompt(null);
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
  const [canPrompt, setCanPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    setupPwaInstallListeners();
    registerServiceWorker();

    const updateInstallState = () => {
      setCanPrompt(Boolean(getDeferredPrompt()));
      setInstalled(Boolean(window.__omaAppInstalled) || isStandaloneDisplay());
    };
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    updateInstallState();

    window.addEventListener(INSTALL_PROMPT_CHANGE_EVENT, updateInstallState);
    standaloneQuery.addEventListener('change', updateInstallState);

    return () => {
      window.removeEventListener(INSTALL_PROMPT_CHANGE_EVENT, updateInstallState);
      standaloneQuery.removeEventListener('change', updateInstallState);
    };
  }, []);

  if (installed) {
    return null;
  }

  if (!canPrompt) {
    return null;
  }

  const handleInstall = async () => {
    const promptEvent = getDeferredPrompt();

    if (!promptEvent || isPrompting) return;

    setIsPrompting(true);
    setDeferredPrompt(null);

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice.catch(() => null);

      if (choice?.outcome === 'accepted') {
        window.__omaAppInstalled = true;
        setInstalled(true);
      }
    } finally {
      setIsPrompting(false);
      onAfterClick?.();
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handleInstall();
      }}
      disabled={isPrompting}
      className={className ?? `inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-bg-glass px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-accent-cyan/40 hover:bg-accent-cyan/10 disabled:cursor-wait disabled:opacity-70 ${fullWidth ? 'w-full' : ''}`}
      aria-label={t('label')}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 3v11" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
        <path d="M6 17h12" />
      </svg>
      <span>{t('label')}</span>
    </button>
  );
}
