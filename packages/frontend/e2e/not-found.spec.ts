import { test, expect } from '@playwright/test';

test.describe('404 Page', () => {
  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-12345');
    await expect(page.locator('h1')).toContainText('404');
  });

  test('should have link back to home', async ({ page }) => {
    await page.goto('/unknown-page-12345');
    const homeLink = page.getByRole('link', { name: 'Нүүр хуудас' });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/');
  });
});