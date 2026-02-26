import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { loginAsClient } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT — Dashboard / Tax Year / Upload / Re-upload
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear() - 1; // e.g. 2024

async function navigateToTaxYear(page: Page, year = CURRENT_YEAR) {
  await page.goto(`/client/tax-year/${year}`);
  await page.waitForLoadState('networkidle');
}

test.describe('Client dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
    // If first login, skip change-password and go to dashboard
    if (page.url().includes('change-password')) {
      await page.goto('/client/dashboard');
    }
  });

  test('dashboard shows tax year cards', async ({ page }) => {
    await page.goto('/client/dashboard');
    await expect(
      page.getByText(/tax year|année fiscale|déclaration/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('language toggle is present', async ({ page }) => {
    await page.goto('/client/dashboard');
    const toggle = page.getByRole('button', { name: /^(FR|EN)$/ });
    await expect(toggle).toBeVisible();
  });

  test('logout works from client dashboard', async ({ page }) => {
    await page.goto('/client/dashboard');
    await page.getByRole('button', { name: /logout|sign out|déconnexion/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Tax year page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
    if (page.url().includes('change-password')) {
      await page.goto('/client/dashboard');
    }
  });

  test('tax year page loads document checklist', async ({ page }) => {
    await navigateToTaxYear(page);
    // Should show at least one document type (T4, RL-1, etc.)
    await expect(
      page.getByText(/T4|RL-1|T5|document/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('upload form is visible', async ({ page }) => {
    await navigateToTaxYear(page);
    await expect(page.getByText(/upload|téléverser/i).first()).toBeVisible({ timeout: 8_000 });
  });

  test('shows status badges for documents', async ({ page }) => {
    await navigateToTaxYear(page);
    // Should show at least one of: "Received", "Under review", "Missing", or "Re-upload"
    await expect(
      page.getByText(/received|under review|missing|re-upload|reçu|en cours/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Document upload', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
    if (page.url().includes('change-password')) {
      await page.goto('/client/dashboard');
    }
    await navigateToTaxYear(page);
  });

  test('can select document type', async ({ page }) => {
    const select = page.getByRole('combobox').first();
    if (await select.isVisible()) {
      const options = await select.locator('option').allTextContents();
      expect(options.length).toBeGreaterThan(1);
    }
  });

  test('upload button is disabled with no file selected', async ({ page }) => {
    const uploadBtn = page.getByRole('button', { name: /upload|téléverser/i }).first();
    if (await uploadBtn.isVisible()) {
      await expect(uploadBtn).toBeDisabled();
    }
  });

  test('file input accepts PDF files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() === 0) return;

    await fileInput.setInputFiles({
      name: 'test-t4.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 test document'),
    });

    // Upload button should now be enabled
    const uploadBtn = page.getByRole('button', { name: /upload|téléverser/i }).first();
    if (await uploadBtn.isVisible()) {
      await expect(uploadBtn).toBeEnabled({ timeout: 3_000 });
    }
  });

  test('rejects non-PDF/image files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() === 0) return;

    await fileInput.setInputFiles({
      name: 'malware.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('MZ fake exe'),
    });

    // Should show error or keep button disabled
    await page.waitForTimeout(500);
    const errorVisible = await page.getByText(/invalid|not allowed|type|format|exe/i).isVisible();
    const btnDisabled = await page.getByRole('button', { name: /upload/i }).first().isDisabled().catch(() => true);
    expect(errorVisible || btnDisabled).toBeTruthy();
  });
});

test.describe('Re-upload flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
    if (page.url().includes('change-password')) {
      await page.goto('/client/dashboard');
    }
    await navigateToTaxYear(page);
  });

  test('Re-upload button appears on rejected documents', async ({ page }) => {
    const reuploadBtn = page.getByRole('button', { name: /re-upload|re-téléverser/i }).first();
    // Only check if a rejected doc exists
    if (await reuploadBtn.isVisible()) {
      await expect(reuploadBtn).toBeEnabled();
    }
  });

  test('clicking Re-upload scrolls to upload form and flashes it', async ({ page }) => {
    const reuploadBtn = page.getByRole('button', { name: /re-upload|re-téléverser/i }).first();
    if (!(await reuploadBtn.isVisible())) return;

    await reuploadBtn.click();

    // Upload section should flash (check for blue border/highlight class)
    await expect(page.locator('[class*="ring-blue"], [class*="border-blue"], [class*="flash"]').first())
      .toBeVisible({ timeout: 5_000 });
  });

  test('after clicking Re-upload, doc shows "Under review" not "Re-upload"', async ({ page }) => {
    const reuploadBtn = page.getByRole('button', { name: /re-upload|re-téléverser/i }).first();
    if (!(await reuploadBtn.isVisible())) return;

    await reuploadBtn.click();

    // The rejected doc's badge should switch to "Under review"
    await expect(
      page.getByText(/under review|en cours de révision/i).first()
    ).toBeVisible({ timeout: 3_000 });

    // Re-upload button should be gone for that doc
    await expect(reuploadBtn).not.toBeVisible();
  });
});

test.describe('Profile page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsClient(page);
    if (page.url().includes('change-password')) {
      await page.goto('/client/dashboard');
    }
  });

  test('profile page loads with form fields', async ({ page }) => {
    await page.goto(`/client/tax-year/${CURRENT_YEAR}/profile`);
    await expect(
      page.getByText(/profile|profil|income|revenu/i).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});
