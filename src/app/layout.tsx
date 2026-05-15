import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { getSiteUrl } from '@/lib/site-url';

const pwaInstallBootstrap = `
(function () {
  if (window.__omaPwaInstallInitialized) return;
  window.__omaPwaInstallInitialized = true;
  window.__omaInstallPrompt = null;
  window.__omaAppInstalled = false;

  function notifyInstallPromptChange() {
    window.dispatchEvent(new CustomEvent('oma-installprompt-change', {
      detail: { available: Boolean(window.__omaInstallPrompt) }
    }));
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    window.__omaInstallPrompt = event;
    notifyInstallPromptChange();
  });

  window.addEventListener('appinstalled', function () {
    window.__omaInstallPrompt = null;
    window.__omaAppInstalled = true;
    notifyInstallPromptChange();
  });

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script id="oma-pwa-install-bootstrap" strategy="beforeInteractive">
        {pwaInstallBootstrap}
      </Script>
      {children}
    </>
  );
}
