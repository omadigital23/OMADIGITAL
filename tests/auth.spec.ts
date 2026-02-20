import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('User can open login modal and toggle to signup', async ({ page }) => {
        // Navigate to the home page (assuming French locale for default testing)
        await page.goto('/fr');

        // Wait for the page to load completely
        await page.waitForLoadState('networkidle');

        // Click the login/profile button in the header
        // Header.tsx uses aria-label="Sign in" for the unauthenticated state
        const loginButton = page.getByLabel('Sign in');
        await expect(loginButton).toBeVisible();
        await loginButton.click();

        // Verify the modal is open by checking for its heading
        const modalHeading = page.getByRole('heading', { name: 'Se connecter' });
        await expect(modalHeading).toBeVisible();

        // The login form should have email and password fields
        await expect(page.getByPlaceholder(/Email/i)).toBeVisible();
        await expect(page.getByPlaceholder(/Mot de passe/i).first()).toBeVisible();

        // Toggle to Sign Up
        await page.getByRole('button', { name: /Pas encore inscrit/i }).click();

        // Verify signup fields appear
        await expect(page.getByRole('heading', { name: 'Créer un compte' })).toBeVisible();
        await expect(page.getByPlaceholder(/Prénom/i)).toBeVisible();
        await expect(page.getByPlaceholder(/Nom/i, { exact: true })).toBeVisible();

        // Check client-side validation for empty submission on signup
        await page.getByRole('button', { name: 'Créer un compte', exact: true }).click();

        // Zod validation errors should appear under the inputs
        await expect(page.getByText('Le prénom doit contenir au moins 2 caractères')).toBeVisible();
        await expect(page.getByText('Le nom doit contenir au moins 2 caractères')).toBeVisible();
        await expect(page.getByText('Email invalide').first()).toBeVisible();
        await expect(page.getByText('Le mot de passe doit contenir au moins 6 caractères')).toBeVisible();
    });
});
