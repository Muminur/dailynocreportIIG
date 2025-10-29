/**
 * E2E Test: Responsive Design
 */

import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    
    // Page should load
    const body = await page.locator('body');
    await expect(body).toBeVisible();
    
    // Check that content doesn't overflow
    const overflowX = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    expect(overflowX).toBeFalsy();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await page.goto('/');
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle viewport orientation changes', async ({ page }) => {
    // Portrait
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Landscape
    await page.setViewportSize({ width: 812, height: 375 });
    await page.waitForLoadState('networkidle');
    
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});

