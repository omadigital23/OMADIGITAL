import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
    test('Prevents checkout submission with empty cart', async ({ page }) => {
        // Navigate straight to the checkout page with an empty cart
        await page.goto('/fr/checkout');

        // Wait for load
        await page.waitForLoadState('networkidle');

        // Expected behavior: Empty cart message and a button to continue shopping
        const emptyCartHeading = page.getByRole('heading', { name: 'Votre panier est vide' });
        await expect(emptyCartHeading).toBeVisible();

        const continueShoppingBtn = page.getByRole('link', { name: 'Continuer vos achats' });
        await expect(continueShoppingBtn).toBeVisible();
    });
});
