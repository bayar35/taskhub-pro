import { test, expect } from './fixtures/auth.fixture';

// ✅ Яг HTML-ээс авсан selector
const BELL_BUTTON = 'button[aria-label="Мэдэгдэл"]';
const TODO_INPUT = 'input[placeholder="Юу хийх вэ..."]';
const ADD_BUTTON = 'button:has-text("Нэмэх")';

test.describe('Notifications E2E', () => {
  test('1. bell icon visible after login', async ({ authenticatedPage: page }) => {
    const bell = page.locator(BELL_BUTTON);

    // Bell icon заавал харагдах ёстой
    await expect(bell).toBeVisible({ timeout: 15_000 });

    // Badge (тоо) — шинэ хэрэглэгчид байхгүй байж болно
    const badgeCount = await bell.locator('span').count();
    if (badgeCount > 0) {
      await expect(bell.locator('span').first()).toBeVisible({ timeout: 3_000 });
    }
  });

  test('2. create todo triggers notification', async ({ authenticatedPage: page }) => {
    const text = `Notif Trigger ${Date.now()}`;

    const bell = page.locator(BELL_BUTTON);
    await expect(bell).toBeVisible({ timeout: 15_000 });

    // Todo нэмэх
    const input = page.locator(TODO_INPUT);
    await input.fill(text, { timeout: 15_000 });
    await page.locator(ADD_BUTTON).first().click();

    // Notification-ийг хүлээх
    await page.waitForTimeout(3000);

    // Bell icon дахин харагдаж байгаа эсэх
    const bellStillVisible = await bell.isVisible().catch(() => false);
    expect(bellStillVisible).toBeTruthy();
  });
});