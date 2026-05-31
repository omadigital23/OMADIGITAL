import { expect, test } from '@playwright/test';

test('localized home page renders without browser errors', async ({ page }) => {
  const browserErrors: string[] = [];

  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(message.text());
    }
  });

  await page.goto('/fr');

  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('#main-content')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /OMA Digital/i }).first()).toBeVisible();
  expect(browserErrors).toEqual([]);
});
