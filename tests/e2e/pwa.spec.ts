import { expect, test } from '@playwright/test';
import { waitForAppHydration } from './helpers';

test('native PWA install button appears only when a browser prompt is available', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'desktop header install button is covered on Chromium');

  await page.goto('/fr', { waitUntil: 'domcontentloaded' });
  await waitForAppHydration(page);
  await expect(page.getByRole('button', { name: /Installer/ })).toHaveCount(0);

  await page.evaluate(() => {
    const testWindow = window as Window & { __omaPwaPromptedForTest?: boolean };

    Object.defineProperty(window, '__omaInstallPrompt', {
      configurable: true,
      writable: true,
      value: {
        prompt: async () => {
          testWindow.__omaPwaPromptedForTest = true;
        },
        userChoice: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
      },
    });

    window.dispatchEvent(
      new CustomEvent('oma-installprompt-change', {
        detail: { available: true },
      })
    );
  });

  await page.getByRole('button', { name: /Installer/ }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const testWindow = window as Window & { __omaPwaPromptedForTest?: boolean };
        return testWindow.__omaPwaPromptedForTest === true;
      })
    )
    .toBe(true);
});
