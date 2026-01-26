import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByText(/login to your account/i)).toBeVisible();
    await expect(page.getByLabelText(/national id|email/i)).toBeVisible();
    await expect(page.getByLabelText(/password/i)).toBeVisible();
  });

  test('should switch between login methods', async ({ page }) => {
    const nationalIdButton = page.getByRole('button', { name: /national id/i });
    const emailButton = page.getByRole('button', { name: /email/i });

    await expect(nationalIdButton).toBeVisible();
    await emailButton.click();
    await expect(emailButton).toHaveClass(/bg-white/);
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /login/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /register/i });
    await registerLink.click();
    await expect(page).toHaveURL(/.*register/);
  });
});

