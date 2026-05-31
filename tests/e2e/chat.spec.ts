import { expect, test } from '@playwright/test';
import { waitForAppHydration } from './helpers';

test('chat widget sends a message and renders the assistant reply', async ({ page }) => {
  let chatPayload: Record<string, unknown> | null = null;

  await page.route('**/api/chat', async (route) => {
    chatPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Réponse test OMA pour votre projet.',
        suggestions: [],
        leadCaptured: false,
        leadStage: 'discovery',
        degraded: false,
      }),
    });
  });

  await page.goto('/fr', { waitUntil: 'domcontentloaded' });
  await waitForAppHydration(page);
  await page.getByRole('button', { name: 'Assistant OMA' }).click();
  const chatDialog = page.getByRole('dialog', { name: 'Assistant OMA' });
  await expect(chatDialog).toBeVisible();

  await chatDialog.getByPlaceholder('Tapez votre message...').fill('Bonjour, je veux un audit.');
  await chatDialog.getByRole('button', { name: 'Envoyer', exact: true }).click();

  await expect(chatDialog.getByText('Réponse test OMA pour votre projet.')).toBeVisible();
  expect(chatPayload).toMatchObject({
    locale: 'fr',
  });
});
