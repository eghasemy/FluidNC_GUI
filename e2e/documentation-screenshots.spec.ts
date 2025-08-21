import { test, expect } from '@playwright/test';

test.describe('Application Documentation Screenshots', () => {
  test('should capture screenshots of different app sections for documentation', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load completely
    await page.waitForTimeout(3000);
    
    // Take a full page screenshot of the main application
    await page.screenshot({ 
      path: '/tmp/fluidnc-gui-main-page.png', 
      fullPage: true 
    });
    
    // Try to navigate to different sections if they exist
    const navigationButtons = [
      'Wizard',
      'Expert',
      'Validation',
      'Configuration',
      'Setup'
    ];
    
    for (const buttonText of navigationButtons) {
      const button = page.locator(`button:has-text("${buttonText}")`);
      if (await button.isVisible()) {
        await button.click();
        await page.waitForTimeout(2000);
        
        // Take screenshot of this section
        await page.screenshot({ 
          path: `/tmp/fluidnc-gui-${buttonText.toLowerCase()}-section.png`, 
          fullPage: true 
        });
        
        console.log(`Captured screenshot for ${buttonText} section`);
      }
    }
    
    // Try to find and interact with any forms or configuration areas
    const configElements = page.locator('input, select, textarea');
    const configCount = await configElements.count();
    
    if (configCount > 0) {
      await page.screenshot({ 
        path: '/tmp/fluidnc-gui-configuration-interface.png', 
        fullPage: true 
      });
      console.log('Captured configuration interface screenshot');
    }
  });
});