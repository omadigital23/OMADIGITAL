export const pwaInstallBootstrap = `
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
