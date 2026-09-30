import { test, expect } from '@playwright/test';
import { uniqueUser, registerViaUI } from './utils/auth';

test.describe('Navigation E2E', () => {
  test('1. protected route redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    // Login эсвэл register руу шилжинэ
    await expect(page).toHaveURL(/\/(login|register)/, { timeout: 10_000 });
  });

  test('2. 404 page for unknown route', async ({ page }) => {
    await page.goto('/this-does-not-exist-xyz');
    await expect(
      page.getByText(/404|not found|олдсонгүй/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});