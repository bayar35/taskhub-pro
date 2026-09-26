import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated user from / to /login', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*\/login/, { timeout: 30000 });
  });

  test('should allow access to /login without auth', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Нэвтрэх' })).toBeVisible();
  });

  test('should allow access to /register without auth', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Бүртгүүлэх' })).toBeVisible();
  });
});