import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test('should show register form', async ({ page }) => {
    await page.goto('/register');
    await expect(
      page.getByRole('heading', { name: 'Бүртгүүлэх' })
    ).toBeVisible();
  });

  test('should show username validation error', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Бүртгүүлэх' }).click();

    // Zod schema-ийн яг тексттэй тааруулна (ямар ч нэмэлт үггүй)
    await expect(
      page.getByText('Хэрэглэгчийн нэр 3+ тэмдэгт байх ёстой')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show password validation error', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Хэрэглэгчийн нэр').fill('testuser');
    await page.getByLabel('Нууц үг').fill('123');
    await page.getByRole('button', { name: 'Бүртгүүлэх' }).click();

    await expect(
      page.getByText('Нууц үг 8+ тэмдэгт байх ёстой')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should render link to login page', async ({ page }) => {
    await page.goto('/register');
    await expect(
      page.getByRole('link', { name: 'Нэвтрэх' })
    ).toBeVisible();
  });
});