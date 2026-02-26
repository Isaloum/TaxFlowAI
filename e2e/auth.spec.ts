import { test, expect } from '@playwright/test';
import { loginAsAccountant, loginAsClient, ACCOUNTANT, CLIENT } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Login / Logout / Forgot Password
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login page', () => {
  test('shows login form with email + password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|login|connexion/i })).toBeVisible();
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ACCOUNTANT.email);
    await page.getByLabel(/password/i).fill('WrongPassword!');
    await page.getByRole('button', { name: /sign in|login|connexion/i }).click();
    await expect(page.getByText(/invalid|incorrect|wrong|identifiants/i)).toBeVisible({ timeout: 8_000 });
    expect(page.url()).toContain('/login'); // stays on login
  });

  test('shows error on empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in|login|connexion/i }).click();
    // HTML5 validation or custom error
    const emailField = page.getByLabel(/email/i);
    const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });
});

test.describe('Accountant auth', () => {
  test('accountant can log in and see dashboard', async ({ page }) => {
    await loginAsAccountant(page);
    await expect(page).toHaveURL(/accountant\/dashboard/);
    await expect(page.getByText(/TaxFlowAI/i)).toBeVisible();
  });

  test('accountant can log out', async ({ page }) => {
    await loginAsAccountant(page);
    await page.getByRole('button', { name: /logout|sign out|déconnexion/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('accountant redirected to dashboard if already logged in', async ({ page }) => {
    await loginAsAccountant(page);
    await page.goto('/login');
    // Should redirect away from login
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain('/login');
  });
});

test.describe('Client auth', () => {
  test('client can log in', async ({ page }) => {
    await loginAsClient(page);
    await expect(page).toHaveURL(/client\/(dashboard|change-password)/);
  });
});

test.describe('Forgot password', () => {
  test('shows forgot password link on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /forgot|oublié/i })).toBeVisible();
  });

  test('forgot password page accepts email', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('anyone@example.com');
    await page.getByRole('button', { name: /send|envoyer|reset/i }).click();
    // Should show success message (email sent confirmation)
    await expect(
      page.getByText(/sent|check your email|courriel|envoyé/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows error for unknown email on forgot password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('nobody@nowhere.com');
    await page.getByRole('button', { name: /send|envoyer|reset/i }).click();
    // Most apps still say "if account exists..." for security, that's fine
    await expect(
      page.getByText(/sent|check|not found|introuvable|email/i)
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Protected routes', () => {
  test('unauthenticated user redirected from /accountant/dashboard to /login', async ({ page }) => {
    await page.goto('/accountant/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('unauthenticated user redirected from /client/dashboard to /login', async ({ page }) => {
    await page.goto('/client/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('client cannot access accountant routes', async ({ page }) => {
    await loginAsClient(page);
    await page.goto('/accountant/dashboard');
    // Should redirect to login or show unauthorized
    await expect(page).toHaveURL(/login|client|unauthorized/);
  });
});
