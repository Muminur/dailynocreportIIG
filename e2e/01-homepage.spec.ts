/**
 * E2E Test: Homepage and Basic Navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/NOC/i);
    
    // Should show some content
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have sign-in button', async ({ page }) => {
    await page.goto('/');
    
    // Look for sign in link/button
    const signIn = page.getByRole('link', { name: /sign in/i });
    await expect(signIn).toBeVisible();
  });

  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    // Try to access dashboard
    await page.goto('/dashboard');
    
    // Should redirect to auth page
    await page.waitForURL(/auth|signin/i);
    expect(page.url()).toMatch(/auth|signin/i);
  });
});

