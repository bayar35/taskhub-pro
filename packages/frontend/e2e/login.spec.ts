import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Нэвтрэх' })).toBeVisible();
    await expect(page.getByPlaceholder('Хэрэглэгчийн нэр')).toBeVisible();
    await expect(page.getByPlaceholder('Нууц үг')).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Нэвтрэх' }).click();
    await expect(page.getByText('Хэрэглэгчийн нэр шаардлагатай')).toBeVisible();
    await expect(page.getByText('Нууц үг шаардлагатай')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'Бүртгүүлэх' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });
});