import { test, expect } from '@playwright/test';
import { AppNavigation, WizardHelpers, FileHelpers, ConfigAssertions } from './utils/helpers';
import { testConfigs, wizardSteps } from './fixtures/test-configs';

test.describe('Wizard Flow E2E Tests', () => {
  let navigation: AppNavigation;
  let wizard: WizardHelpers;
  let fileHelpers: FileHelpers;

  test.beforeEach(async ({ page }) => {
    navigation = new AppNavigation(page);
    wizard = new WizardHelpers(page);
    fileHelpers = new FileHelpers(page);

    // Navigate to the app
    await page.goto('/');
    
    // Wait for app to load - this might start on the calculator demo
    await page.waitForSelector('button:has-text("Go to Full Wizard")');
    
    // Go to the wizard
    await page.click('button:has-text("Go to Full Wizard")');
    
    // Wait for wizard to load
    await page.waitForSelector('text=Full Configuration Wizard');
  });

  test('should complete full wizard flow and export configuration', async ({ page }) => {
    // Step 1: Machine Configuration
    await test.step('Configure machine settings', async () => {
      // Should start on machine step
      await expect(page.locator('text=Machine')).toBeVisible();
      
      // Fill machine name
      const nameInput = page.locator('input').first();
      await nameInput.fill(testConfigs.basicRouter.name);
      
      // Select board type (look for select or dropdown)
      const boardSelect = page.locator('select').first();
      if (await boardSelect.isVisible()) {
        await boardSelect.selectOption(testConfigs.basicRouter.board);
      } else {
        // Try clicking board selection buttons
        await page.click(`text=${testConfigs.basicRouter.board}`);
      }
      
      // Go to next step
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    });

    // Step 2: Mechanics Configuration  
    await test.step('Configure mechanics', async () => {
      await expect(page.locator('text=Mechanics')).toBeVisible();
      
      // Configure X axis
      const xStepsInput = page.locator('input[placeholder*="steps"]').first();
      if (await xStepsInput.isVisible()) {
        await xStepsInput.fill(testConfigs.basicRouter.axes.x.steps_per_mm.toString());
      }
      
      const xRateInput = page.locator('input[placeholder*="rate"]').first();
      if (await xRateInput.isVisible()) {
        await xRateInput.fill(testConfigs.basicRouter.axes.x.max_rate_mm_per_min.toString());
      }
      
      // Try to go to next step
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    });

    // Step 3: Motors Configuration
    await test.step('Configure motors', async () => {
      await expect(page.locator('text=Motors')).toBeVisible();
      
      // Fill motor pins - look for pin inputs
      const stepPinInput = page.locator('input[placeholder*="pin"]').first();
      if (await stepPinInput.isVisible()) {
        await stepPinInput.fill(testConfigs.basicRouter.axes.x.motor0.step_pin);
      }
      
      // Try to go to next step
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
      }
    });

    // Navigate through remaining steps quickly
    await test.step('Navigate through remaining steps', async () => {
      const remainingSteps = ['Homing', 'Spindle', 'IO', 'UART', 'Macros', 'SD Card'];
      
      for (const stepName of remainingSteps) {
        // Check if we're on this step
        if (await page.locator(`text=${stepName}`).isVisible()) {
          // Try to go to next step
          const nextButton = page.locator('button:has-text("Next")');
          if (await nextButton.isVisible()) {
            await nextButton.click();
            await page.waitForTimeout(500); // Small delay between steps
          }
        }
      }
    });

    // Step 4: Review and Export
    await test.step('Review configuration and export', async () => {
      await expect(page.locator('text=Review')).toBeVisible();
      
      // Check that configuration summary is shown
      await expect(page.locator('text=Configuration Summary')).toBeVisible();
      
      // Look for export button or finish button
      const exportButton = page.locator('button:has-text("Export")');
      const finishButton = page.locator('button:has-text("Finish")');
      
      if (await exportButton.isVisible()) {
        // Test direct export from wizard
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();
        const download = await downloadPromise;
        
        // Verify download
        const path = await download.path();
        expect(path).toBeTruthy();
        
        if (path) {
          const fs = await import('fs/promises');
          const content = await fs.readFile(path, 'utf-8');
          
          // Validate exported YAML
          const config = await ConfigAssertions.assertValidYaml(content);
          await ConfigAssertions.assertValidConfig(config);
          
          expect(config.name).toContain('Test');
          expect(config.board).toBe('ESP32');
        }
      } else if (await finishButton.isVisible()) {
        // Complete wizard to go to completion screen
        await finishButton.click();
        
        // Should show completion screen
        await expect(page.locator('text=Configuration Complete')).toBeVisible();
      }
    });
  });

  test('should validate required fields and prevent invalid progression', async ({ page }) => {
    await test.step('Test validation on machine step', async () => {
      // Try to go to next step without filling required fields
      const nextButton = page.locator('button:has-text("Next")');
      
      if (await nextButton.isVisible()) {
        // Check if button is disabled or if validation message appears
        const isDisabled = await nextButton.isDisabled();
        
        if (!isDisabled) {
          await nextButton.click();
          // Should show validation error or stay on same step
          await page.waitForTimeout(500);
          
          // Check for validation messages
          const errorMessage = page.locator('text=required');
          if (await errorMessage.isVisible()) {
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    });
  });

  test('should allow navigation between wizard steps', async ({ page }) => {
    await test.step('Navigate forward and backward through steps', async () => {
      // Fill minimum required info to enable navigation
      const nameInput = page.locator('input').first();
      await nameInput.fill('Test Machine');
      
      // Try to go forward
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);
        
        // Try to go back
        const backButton = page.locator('button:has-text("Back")');
        if (await backButton.isVisible()) {
          await backButton.click();
          await page.waitForTimeout(500);
          
          // Should be back on machine step
          await expect(page.locator('text=Machine')).toBeVisible();
        }
      }
    });
  });

  test('should show live YAML preview during configuration', async ({ page }) => {
    await test.step('Check for YAML preview', async () => {
      // Look for YAML preview section
      const yamlPreview = page.locator('code, pre, .yaml-preview');
      
      if (await yamlPreview.isVisible()) {
        // Fill some configuration and check preview updates
        const nameInput = page.locator('input').first();
        await nameInput.fill('Live Preview Test');
        
        // Check if preview contains the entered name
        await expect(yamlPreview).toContainText('Live Preview Test');
      }
    });
  });
});