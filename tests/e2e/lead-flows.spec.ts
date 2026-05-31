import { expect, test } from '@playwright/test';
import { waitForAppHydration } from './helpers';

test('contact form submits through the API and shows success', async ({ page }) => {
  let contactPayload: Record<string, unknown> | null = null;

  await page.route('**/api/contact', async (route) => {
    contactPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/fr/contact', { waitUntil: 'domcontentloaded' });
  await waitForAppHydration(page);
  const contactForm = page.getByRole('form', { name: 'Envoyez-nous un message' });
  await contactForm.getByLabel('Nom complet').fill('Client Test');
  await contactForm.getByRole('textbox', { name: 'Email', exact: true }).fill('client@example.com');
  await contactForm.getByLabel('Téléphone').fill('+221 77 123 45 67');
  await contactForm.getByLabel('Service souhaité').selectOption('website');
  await contactForm.getByLabel('Votre message').fill('Je veux un site web professionnel.');
  const contactResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/contact') && response.request().method() === 'POST'
  );
  await contactForm.getByRole('button', { name: 'Envoyer le message' }).click();
  expect((await contactResponse).status()).toBe(200);

  await expect(page.getByText('Message envoyé')).toBeVisible();
  expect(contactPayload).toMatchObject({
    name: 'Client Test',
    email: 'client@example.com',
    phone: '+221 77 123 45 67',
    service: 'website',
  });
});

test('newsletter form submits through the API and shows success', async ({ page }) => {
  let newsletterPayload: Record<string, unknown> | null = null;

  await page.route('**/api/newsletter', async (route) => {
    newsletterPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto('/fr', { waitUntil: 'domcontentloaded' });
  await waitForAppHydration(page);
  const footer = page.getByRole('contentinfo');
  const newsletterForm = footer.getByRole('form', { name: 'Newsletter' });
  await footer.scrollIntoViewIfNeeded();
  await newsletterForm.getByLabel('Votre email').fill('newsletter@example.com');
  const newsletterResponse = page.waitForResponse(
    (response) => response.url().endsWith('/api/newsletter') && response.request().method() === 'POST'
  );
  await newsletterForm.getByRole('button', { name: "S'abonner" }).click();
  expect((await newsletterResponse).status()).toBe(200);

  await expect(page.getByText('Merci pour votre inscription')).toBeVisible();
  expect(newsletterPayload).toMatchObject({
    email: 'newsletter@example.com',
    companyWebsite: '',
  });
});
