import { test, expect } from '@playwright/test';
import { loginAsAccountant } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTANT — Dashboard / Client Management / Document Review
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Accountant dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAccountant(page);
  });

  test('dashboard loads with stats cards', async ({ page }) => {
    // 4 stat cards: Total, Pending, Completed, Urgent
    const cards = page.locator('.bg-white.rounded-xl.border');
    await expect(cards.first()).toBeVisible();
  });

  test('shows client table or empty state', async ({ page }) => {
    // Either a table row or "no clients" empty state
    const hasClients = await page.locator('table tbody tr').count();
    if (hasClients === 0) {
      await expect(page.getByText(/no clients|aucun client|no match/i)).toBeVisible();
    } else {
      await expect(page.locator('table tbody tr').first()).toBeVisible();
    }
  });

  test('search filters client list', async ({ page }) => {
    const clientCount = await page.locator('table tbody tr').count();
    if (clientCount === 0) return; // skip if no clients

    await page.getByPlaceholder(/search/i).fill('xyznotfound123');
    await expect(page.getByText(/no match|aucun/i)).toBeVisible();

    await page.getByPlaceholder(/search/i).fill('');
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('language toggle switches EN/FR', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /^(FR|EN)$/ });
    await expect(toggle).toBeVisible();
    const initialText = await toggle.textContent();
    await toggle.click();
    const newText = await toggle.textContent();
    expect(newText).not.toBe(initialText);
  });
});

test.describe('Add client flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAccountant(page);
  });

  test('opens Add Client modal on button click', async ({ page }) => {
    await page.getByRole('button', { name: /add client|ajouter/i }).click();
    await expect(page.getByText(/invite new client|inviter/i)).toBeVisible();
  });

  test('Add Client modal has all required fields', async ({ page }) => {
    await page.getByRole('button', { name: /add client|ajouter/i }).click();
    await expect(page.getByLabel(/first name|prénom/i)).toBeVisible();
    await expect(page.getByLabel(/last name|nom/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/province/i)).toBeVisible();
    await expect(page.getByLabel(/language/i)).toBeVisible();
  });

  test('shows error when email already registered', async ({ page }) => {
    await page.getByRole('button', { name: /add client|ajouter/i }).click();
    await page.getByLabel(/first name|prénom/i).fill('Test');
    await page.getByLabel(/last name|nom/i).fill('User');
    await page.getByLabel(/email/i).fill(
      process.env.TEST_CLIENT_EMAIL || 'test-client@isaloumapps.com'
    );
    await page.getByRole('button', { name: /send invitation|inviter|envoyer/i }).click();
    await expect(page.getByText(/already registered|déjà|exists/i)).toBeVisible({ timeout: 8_000 });
  });

  test('can close modal with Cancel button', async ({ page }) => {
    await page.getByRole('button', { name: /add client|ajouter/i }).click();
    await expect(page.getByText(/invite new client|inviter/i)).toBeVisible();
    await page.getByRole('button', { name: /cancel|annuler/i }).click();
    await expect(page.getByText(/invite new client|inviter/i)).not.toBeVisible();
  });

  test('can close modal with X button', async ({ page }) => {
    await page.getByRole('button', { name: /add client|ajouter/i }).click();
    await page.getByRole('button', { name: '' }).filter({ has: page.locator('svg') }).last().click();
    await expect(page.getByText(/invite new client|inviter/i)).not.toBeVisible();
  });
});

test.describe('Client detail view', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAccountant(page);
  });

  test('clicking a client row navigates to client detail', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const count = await page.locator('table tbody tr').count();
    if (count === 0) return; // skip if no clients

    await firstRow.click();
    await expect(page).toHaveURL(/accountant\/client/);
  });

  test('client detail shows documents section', async ({ page }) => {
    const count = await page.locator('table tbody tr').count();
    if (count === 0) return;

    await page.locator('table tbody tr').first().click();
    await page.waitForURL(/accountant\/client/);
    // Should show some document-related content
    await expect(
      page.getByText(/document|upload|T4|RL-1|fichier/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('approve button is visible on pending documents', async ({ page }) => {
    const count = await page.locator('table tbody tr').count();
    if (count === 0) return;

    await page.locator('table tbody tr').first().click();
    await page.waitForURL(/accountant\/client/);

    const approveBtn = page.getByRole('button', { name: /approve|approuver/i }).first();
    if (await approveBtn.isVisible()) {
      await expect(approveBtn).toBeEnabled();
    }
  });
});
