import { Page } from '@playwright/test';

// ── Credentials (override with env vars in CI) ─────────────────────────────
export const ACCOUNTANT = {
  email:    process.env.TEST_ACCOUNTANT_EMAIL    || 'test-accountant@isaloumapps.com',
  password: process.env.TEST_ACCOUNTANT_PASSWORD || 'TestPass123!',
};

export const CLIENT = {
  email:    process.env.TEST_CLIENT_EMAIL    || 'test-client@isaloumapps.com',
  password: process.env.TEST_CLIENT_PASSWORD || 'TestPass456!',
};

// ── Reusable login helpers ─────────────────────────────────────────────────
export async function loginAsAccountant(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(ACCOUNTANT.email);
  await page.getByLabel(/password/i).fill(ACCOUNTANT.password);
  await page.getByRole('button', { name: /sign in|login|connexion/i }).click();
  await page.waitForURL('**/accountant/dashboard', { timeout: 15_000 });
}

export async function loginAsClient(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(CLIENT.email);
  await page.getByLabel(/password/i).fill(CLIENT.password);
  await page.getByRole('button', { name: /sign in|login|connexion/i }).click();
  // Client may land on change-password if isFirstLogin, or dashboard
  await page.waitForURL(/\/(client\/dashboard|client\/change-password)/, { timeout: 15_000 });
}
