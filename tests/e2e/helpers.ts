import type { Page } from '@playwright/test';

export async function waitForAppHydration(page: Page) {
  await page.locator('html[data-oma-hydrated="true"]').waitFor({ timeout: 15_000 });
}
