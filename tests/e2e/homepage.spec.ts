import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AZTEAM|Next.js/i);
  });

  test('should have main content', async ({ page }) => {
    await page.goto('/');
    // The page should have some main content
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
