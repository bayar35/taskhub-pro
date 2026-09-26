import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test('should show register form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Бүртгүүлэх' })).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Бүртгүүлэх' }).click();
    await expect(page.getByText('Хэрэглэгчийн нэр дор хаяж 3 тэмдэгт')).toBeVisible();
  });
});