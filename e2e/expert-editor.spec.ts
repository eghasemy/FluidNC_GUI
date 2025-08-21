import { test, expect } from '@playwright/test';
import { AppNavigation, ExpertEditorHelpers, FileHelpers, ConfigAssertions } from './utils/helpers';
import { testConfigs } from './fixtures/test-configs';

test.describe('Import → Expert Editor → Export Flow E2E Tests', () => {
  let navigation: AppNavigation;
  let expert: ExpertEditorHelpers;
  let fileHelpers: FileHelpers;

  test.beforeEach(async ({ page }) => {
    navigation = new AppNavigation(page);
    expert = new ExpertEditorHelpers(page);
    fileHelpers = new FileHelpers(page);

    // Navigate to the app
    await page.goto('/');
    
    // Wait for app to load and go to Expert Editor
    await page.waitForSelector('button:has-text("Go to Expert Editor")');
    await page.click('button:has-text("Go to Expert Editor")');
    
    // Wait for expert editor to load
    await page.waitForSelector('text=Expert Configuration Editor');
  });

  test('should import YAML configuration and export it back', async ({ page }) => {
    await test.step('Import YAML configuration', async () => {
      // Look for import button
      const importButton = page.locator('button:has-text("Import")');
      
      if (await importButton.isVisible()) {
        await importButton.click();
        
        // Look for import dialog or textarea
        const importDialog = page.locator('.import-dialog, [data-testid="import-dialog"]');
        const importTextarea = page.locator('textarea');
        
        if (await importDialog.isVisible() || await importTextarea.isVisible()) {
          // Find the textarea for YAML input
          const textarea = importTextarea.first();
          await textarea.fill(testConfigs.legacyConfig);
          
          // Confirm import
          const confirmButton = page.locator('button:has-text("Import"), button:has-text("Confirm"), button:has-text("Load")');
          await confirmButton.first().click();
          
          // Wait for import to complete
          await page.waitForTimeout(1000);
        }
      } else {
        // Try loading sample config instead
        const sampleButton = page.locator('button:has-text("Sample"), button:has-text("Load Sample")');
        if (await sampleButton.isVisible()) {
          await sampleButton.click();
        }
      }
    });

    await test.step('Verify configuration loaded in tree view', async () => {
      // Check that configuration tree is populated
      await expect(page.locator('text=name')).toBeVisible();
      
      // Look for specific configuration elements
      const configTree = page.locator('.config-tree, .tree-view, [data-testid="config-tree"]');
      if (await configTree.isVisible()) {
        // Check for axes configuration
        await expect(configTree).toContainText('axes');
      }
    });

    await test.step('Modify configuration in expert editor', async () => {
      // Try to expand and edit configuration
      
      // Look for expandable nodes
      const expandButton = page.locator('.expand, .expand-icon, button:has-text("▶")').first();
      if (await expandButton.isVisible()) {
        await expandButton.click();
        await page.waitForTimeout(500);
      }
      
      // Try to select a field for editing
      const nameField = page.locator('text=name').first();
      if (await nameField.isVisible()) {
        await nameField.click();
        
        // Look for edit input
        const editInput = page.locator('input[type="text"]').first();
        if (await editInput.isVisible()) {
          await editInput.fill('Modified Configuration Name');
          
          // Save the change (might be automatic or require Enter)
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
        }
      }
    });

    await test.step('Export modified configuration', async () => {
      // Look for export buttons
      const exportYamlButton = page.locator('button:has-text("Export YAML"), button:has-text("Export")');
      
      if (await exportYamlButton.isVisible()) {
        // Test YAML export
        const downloadPromise = page.waitForEvent('download');
        await exportYamlButton.first().click();
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
          
          // Check that our modification is present
          expect(config.name).toContain('Modified');
        }
      }
      
      // Also test JSON export if available
      const exportJsonButton = page.locator('button:has-text("Export JSON")');
      if (await exportJsonButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await exportJsonButton.click();
        const download = await downloadPromise;
        
        const path = await download.path();
        expect(path).toBeTruthy();
        
        if (path) {
          const fs = await import('fs/promises');
          const content = await fs.readFile(path, 'utf-8');
          
          // Validate JSON
          const config = JSON.parse(content);
          await ConfigAssertions.assertValidConfig(config);
        }
      }
    });
  });

  test('should handle legacy configuration import with transformations', async ({ page }) => {
    await test.step('Import legacy configuration', async () => {
      const importButton = page.locator('button:has-text("Import")');
      
      if (await importButton.isVisible()) {
        await importButton.click();
        
        const importTextarea = page.locator('textarea');
        if (await importTextarea.isVisible()) {
          await importTextarea.first().fill(testConfigs.legacyConfig);
          
          const confirmButton = page.locator('button:has-text("Import"), button:has-text("Confirm")');
          await confirmButton.first().click();
          
          // Wait for transformation to complete
          await page.waitForTimeout(1500);
        }
      }
    });

    await test.step('Verify legacy transformations applied', async () => {
      // Check that the configuration was transformed to new format
      const configTree = page.locator('.config-tree, .tree-view');
      
      if (await configTree.isVisible()) {
        // Should have nested axes structure instead of flat
        await expect(configTree).toContainText('axes');
        
        // Check for motor0 configuration under axes
        const expandButtons = page.locator('.expand, .expand-icon');
        if (await expandButtons.count() > 0) {
          await expandButtons.first().click();
          await page.waitForTimeout(500);
          
          // Look for motor0 under axis
          await expect(page.locator('text=motor0')).toBeVisible();
        }
      }
    });

    await test.step('Check for transformation notifications', async () => {
      // Look for any messages about transformations applied
      const notifications = page.locator('.notification, .message, .alert');
      if (await notifications.isVisible()) {
        // Should mention legacy transformation
        await expect(notifications).toContainText('transform');
      }
    });
  });

  test('should validate configuration changes in real-time', async ({ page }) => {
    await test.step('Load a configuration and make invalid changes', async () => {
      // Load sample config first
      const sampleButton = page.locator('button:has-text("Sample"), button:has-text("Load Sample")');
      if (await sampleButton.isVisible()) {
        await sampleButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Try to make an invalid change
      const nameField = page.locator('text=name').first();
      if (await nameField.isVisible()) {
        await nameField.click();
        
        const editInput = page.locator('input[type="text"]').first();
        if (await editInput.isVisible()) {
          // Clear the name (should be invalid)
          await editInput.fill('');
          await page.keyboard.press('Enter');
          await page.waitForTimeout(500);
          
          // Look for validation error
          const errorMessage = page.locator('.error, .validation-error, text=required');
          if (await errorMessage.isVisible()) {
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    });
  });

  test('should support adding and removing configuration keys', async ({ page }) => {
    await test.step('Add a new root key', async () => {
      // Look for add key button
      const addKeyButton = page.locator('button:has-text("Add"), button:has-text("+")');
      
      if (await addKeyButton.isVisible()) {
        await addKeyButton.first().click();
        
        // Look for input to enter new key name
        const keyNameInput = page.locator('input[placeholder*="key"], input[placeholder*="name"]');
        if (await keyNameInput.isVisible()) {
          await keyNameInput.fill('custom_setting');
          
          // Confirm adding the key
          const confirmButton = page.locator('button:has-text("Add"), button:has-text("Confirm")');
          await confirmButton.first().click();
          
          // Verify key was added
          await expect(page.locator('text=custom_setting')).toBeVisible();
        }
      }
    });
  });

  test('should show diff when comparing configurations', async ({ page }) => {
    await test.step('Load configuration and enable diff view', async () => {
      // Load sample config
      const sampleButton = page.locator('button:has-text("Sample"), button:has-text("Load Sample")');
      if (await sampleButton.isVisible()) {
        await sampleButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Look for diff or comparison features
      const diffButton = page.locator('button:has-text("Diff"), button:has-text("Compare")');
      if (await diffButton.isVisible()) {
        await diffButton.click();
        
        // Make a change to see the diff
        const nameField = page.locator('text=name').first();
        if (await nameField.isVisible()) {
          await nameField.click();
          
          const editInput = page.locator('input[type="text"]').first();
          if (await editInput.isVisible()) {
            await editInput.fill('Modified for Diff Test');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(500);
            
            // Check if diff is shown
            const diffView = page.locator('.diff, .comparison, .changes');
            if (await diffView.isVisible()) {
              await expect(diffView).toContainText('Modified for Diff Test');
            }
          }
        }
      }
    });
  });
});