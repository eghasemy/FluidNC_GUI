import { test, expect } from '@playwright/test';

test.describe('Basic E2E Setup Tests', () => {
  test('should load the FluidNC GUI application', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Should see one of the main navigation options
    await expect(page.locator('button')).toBeVisible();
    
    // Should see some indication this is the FluidNC GUI
    await expect(page.locator('text=FluidNC, text=Wizard, text=Configuration')).toBeVisible();
  });

  test('should have navigation between different modes', async ({ page }) => {
    await page.goto('/');
    
    // Look for navigation buttons
    const wizardButton = page.locator('button:has-text("Wizard")');
    const expertButton = page.locator('button:has-text("Expert")');
    const validationButton = page.locator('button:has-text("Validation")');
    
    // At least one navigation option should be available
    const hasNavigation = (await wizardButton.isVisible()) || 
                         (await expertButton.isVisible()) || 
                         (await validationButton.isVisible());
    
    expect(hasNavigation).toBe(true);
  });

  test('should be able to switch between application modes', async ({ page }) => {
    await page.goto('/');
    
    // Find and click wizard button if available
    const wizardButton = page.locator('button:has-text("Wizard"), button:has-text("Full Wizard")');
    if (await wizardButton.isVisible()) {
      await wizardButton.click();
      await page.waitForTimeout(1000);
      
      // Should show wizard content
      await expect(page.locator('text=Wizard, text=Configuration')).toBeVisible();
      
      // Try to go to expert mode
      const expertButton = page.locator('button:has-text("Expert")');
      if (await expertButton.isVisible()) {
        await expertButton.click();
        await page.waitForTimeout(1000);
        
        // Should show expert editor
        await expect(page.locator('text=Expert, text=Editor')).toBeVisible();
      }
    }
  });
});