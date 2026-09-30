import { test, expect } from './fixtures/auth.fixture';

// ✅ Яг HTML-ээс авсан selectors
const TODO_INPUT = 'input[placeholder="Юу хийх вэ..."]';
const ADD_BUTTON = 'button:has-text("Нэмэх")';
const TODO_CONTAINER = 'li';  // Todo item нь <li>

test.describe('Todo CRUD E2E', () => {
  test('1. create a todo', async ({ authenticatedPage: page }) => {
    const text = `E2E Todo ${Date.now()}`;

    const input = page.locator(TODO_INPUT);
    await input.fill(text, { timeout: 15_000 });

    await page.locator(ADD_BUTTON).first().click();

    await expect(page.getByText(text)).toBeVisible({ timeout: 15_000 });
  });

  test('2. toggle todo completion', async ({ authenticatedPage: page }) => {
    const text = `Toggle Todo ${Date.now()}`;

    // Todo нэмэх
    const input = page.locator(TODO_INPUT);
    await input.fill(text, { timeout: 15_000 });
    await page.locator(ADD_BUTTON).first().click();
    await page.waitForTimeout(1000);

    // Тухайн todo-г агуулсан <li>-г олох
    const todoItem = page
      .locator(TODO_CONTAINER)
      .filter({ hasText: text })
      .first();

    // ✅ Checkbox нь <button> эсвэл ⬜✅ emoji
    const checkbox = todoItem.locator('button').first();
    await checkbox.click({ force: true, timeout: 15_000 });

    // Completed state шалгах — <p> дээр line-through class байх ёстой
    await page.waitForTimeout(1500);
    const todoText = todoItem.locator('p').first();
    await expect(todoText).toHaveClass(/line-through/, { timeout: 10_000 });
  });

  test('3. delete a todo', async ({ authenticatedPage: page }) => {
    const text = `Delete Todo ${Date.now()}`;

    const input = page.locator(TODO_INPUT);
    await input.fill(text, { timeout: 15_000 });
    await page.locator(ADD_BUTTON).first().click();
    await page.waitForTimeout(1000);

    // Todo item олох
    const todoItem = page
      .locator(TODO_CONTAINER)
      .filter({ hasText: text })
      .first();

    // ✅ Delete button нь "text-red-500" class-тай <button> 🗑
    const deleteBtn = todoItem.locator('button.text-red-500').first();
    await deleteBtn.click({ force: true, timeout: 15_000 });

    await expect(page.getByText(text)).not.toBeVisible({ timeout: 10_000 });
  });

  test('4. empty text rejected', async ({ authenticatedPage: page }) => {
    const beforeCount = await page.locator(TODO_CONTAINER).count();

    await page.locator(ADD_BUTTON).first().click({ force: true });
    await page.waitForTimeout(1500);

    const afterCount = await page.locator(TODO_CONTAINER).count();
    expect(afterCount).toBe(beforeCount);
  });
});