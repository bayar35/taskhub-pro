import { test, expect } from '@playwright/test';
import { uniqueUser, registerViaUI, loginViaUI } from './utils/auth';

test.describe('Authentication E2E', () => {
  test('1. register → dashboard', async ({ page }) => {
    const user = uniqueUser('reg');
    await registerViaUI(page, user);

    // Dashboard эсвэл Todo page дээр байх ёстой
    await expect(page).toHaveURL(/\/(dashboard|todos|$)/);
    // Хэрэглэгчийн нэр эсвэл logout товч харагдах
    await expect(
      page.getByText(new RegExp(user.username, 'i')).first()
        .or(page.getByRole('button', { name: /logout|гарах/i }))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('2. login with valid credentials', async ({ page }) => {
    const user = uniqueUser('login');
    await registerViaUI(page, user);

    // Logout (хэрэв байвал)
    const logoutBtn = page.getByRole('button', { name: /logout|гарах/i });
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
    }

    await loginViaUI(page, user);
    await expect(page).toHaveURL(/\/(dashboard|todos|$)/);
  });

  test('3. reject invalid password', async ({ page }) => {
    const user = uniqueUser('badpw');
    await registerViaUI(page, user);

    await page.goto('/login');
    await page.getByLabel(/username|нэр|хэрэглэгчийн нэр/i).fill(user.username);
    await page.getByLabel(/password|нууц үг/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /нэвтрэх|login|sign in/i }).click();

    // Алдааны мэдэгдэл эсвэл login дээрээ үлдэх
    await expect(
      page.getByText(/буруу|invalid|error|алдаа/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('4. logout clears session', async ({ page }) => {
    const user = uniqueUser('logout');
    await registerViaUI(page, user);

    // ✅ ЗӨВ — force click + toaster хаах
const logoutBtn = page.getByRole('button', { name: /logout|гарах/i });
await expect(logoutBtn).toBeVisible({ timeout: 10_000 });

// Toast-уудыг хаах
await page.evaluate(() => {
  document.querySelectorAll('[data-rht-toaster]').forEach((el) => el.remove());
});

await logoutBtn.click({ force: true });

    await expect(page).toHaveURL(/\/(login|register|$)/, { timeout: 10_000 });
  });
});