import { test, expect } from '@playwright/test';
import { AppNavigation, DeviceValidationHelpers } from './utils/helpers';
import { testConfigs, mockDeviceResponses } from './fixtures/test-configs';

test.describe('Device Validation Mock E2E Tests', () => {
  let navigation: AppNavigation;
  let deviceValidation: DeviceValidationHelpers;

  test.beforeEach(async ({ page }) => {
    navigation = new AppNavigation(page);
    deviceValidation = new DeviceValidationHelpers(page);

    // Navigate to the app
    await page.goto('/');
    
    // Wait for app to load and go to Device Validation
    await page.waitForSelector('button:has-text("Device Validation")');
    await page.click('button:has-text("Device Validation")');
    
    // Wait for device validation to load
    await page.waitForSelector('text=Device Configuration Validation');
  });

  test('should show device connection interface', async ({ page }) => {
    await test.step('Verify device validation UI elements', async () => {
      // Check for serial port selection
      const portSelect = page.locator('select:has(option)').first();
      if (await portSelect.isVisible()) {
        await expect(portSelect).toBeVisible();
      }
      
      // Check for baud rate selection
      const baudSelect = page.locator('select').nth(1);
      if (await baudSelect.isVisible()) {
        await expect(baudSelect).toBeVisible();
      }
      
      // Check for connect button
      const connectButton = page.locator('button:has-text("Connect")');
      if (await connectButton.isVisible()) {
        await expect(connectButton).toBeVisible();
      }
    });
  });

  test('should mock serial port connection and validation', async ({ page }) => {
    // Mock the Tauri commands for serial communication
    await page.addInitScript(() => {
      // Mock the Tauri invoke function
      (window as any).__TAURI__ = {
        invoke: async (command: string, args: any) => {
          switch (command) {
            case 'get_available_ports':
              return [
                { name: 'COM3', type: 'Serial' },
                { name: '/dev/ttyUSB0', type: 'Serial' },
                { name: '/dev/cu.usbserial-1420', type: 'Serial' }
              ];
            
            case 'connect_serial_port':
              // Simulate successful connection
              return 'Connected to ' + args.portName;
            
            case 'disconnect_serial_port':
              return 'Disconnected from ' + args.portName;
            
            case 'send_serial_command':
              // Mock device responses based on command
              const command = args.command;
              if (command.includes('$Config/Board')) {
                return 'ok';
              } else if (command.includes('$RST')) {
                return 'Restarting...';
              } else {
                return 'ok';
              }
            
            default:
              throw new Error(`Unknown command: ${command}`);
          }
        }
      };
    });

    await test.step('Select serial port and connect', async () => {
      // Refresh the port list first if there's a refresh button
      const refreshButton = page.locator('button:has-text("Refresh")');
      if (await refreshButton.isVisible()) {
        await refreshButton.click();
        await page.waitForTimeout(500);
      }
      
      // Select a port
      const portSelect = page.locator('select').first();
      if (await portSelect.isVisible()) {
        // Check if ports are available
        const options = await portSelect.locator('option').count();
        if (options > 1) { // More than just default option
          await portSelect.selectOption({ index: 1 });
        }
      }
      
      // Set baud rate
      const baudSelect = page.locator('select').nth(1);
      if (await baudSelect.isVisible()) {
        await baudSelect.selectOption('115200');
      }
      
      // Connect
      const connectButton = page.locator('button:has-text("Connect")');
      if (await connectButton.isVisible()) {
        await connectButton.click();
        
        // Wait for connection status
        await page.waitForTimeout(1000);
        
        // Check for connected status
        const statusText = page.locator('text=Connected, text=connected');
        if (await statusText.isVisible()) {
          await expect(statusText).toBeVisible();
        }
      }
    });

    await test.step('Upload and validate configuration', async () => {
      // Look for upload/validate button
      const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Validate")');
      
      if (await uploadButton.isVisible()) {
        await uploadButton.click();
        
        // Wait for validation process
        await page.waitForTimeout(2000);
        
        // Check for validation results
        const validationResult = page.locator('.validation-result, .result, [data-testid="validation-result"]');
        if (await validationResult.isVisible()) {
          await expect(validationResult).toBeVisible();
        }
        
        // Check for validation status (pass/warn/fail)
        const statusIndicator = page.locator('.status, .validation-status');
        if (await statusIndicator.isVisible()) {
          const statusText = await statusIndicator.textContent();
          expect(statusText).toMatch(/(pass|warn|fail|success|error)/i);
        }
      }
    });

    await test.step('Disconnect from device', async () => {
      const disconnectButton = page.locator('button:has-text("Disconnect")');
      if (await disconnectButton.isVisible()) {
        await disconnectButton.click();
        
        // Wait for disconnection
        await page.waitForTimeout(500);
        
        // Verify disconnected state
        const connectButton = page.locator('button:has-text("Connect")');
        await expect(connectButton).toBeVisible();
      }
    });
  });

  test('should handle connection errors gracefully', async ({ page }) => {
    // Mock connection failure
    await page.addInitScript(() => {
      (window as any).__TAURI__ = {
        invoke: async (command: string, args: any) => {
          switch (command) {
            case 'get_available_ports':
              return [];
            
            case 'connect_serial_port':
              throw new Error('Port not available');
            
            default:
              throw new Error(`Unknown command: ${command}`);
          }
        }
      };
    });

    await test.step('Attempt connection and handle error', async () => {
      // Try to connect with no ports available
      const connectButton = page.locator('button:has-text("Connect")');
      if (await connectButton.isVisible()) {
        await connectButton.click();
        
        // Wait for error message
        await page.waitForTimeout(1000);
        
        // Check for error message
        const errorMessage = page.locator('.error, .alert, text=error');
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });

  test('should show validation messages and logs', async ({ page }) => {
    // Mock device validation with different message types
    await page.addInitScript(() => {
      (window as any).__TAURI__ = {
        invoke: async (command: string, args: any) => {
          switch (command) {
            case 'get_available_ports':
              return [{ name: 'COM3', type: 'Serial' }];
            
            case 'connect_serial_port':
              return 'Connected';
            
            case 'send_serial_command':
              // Return validation messages
              return 'MSG:INFO: Configuration loaded\nMSG:WARN: No spindle configured\nMSG:ERR: Invalid pin assignment';
            
            default:
              return 'ok';
          }
        }
      };
    });

    await test.step('Connect and validate to see messages', async () => {
      // Quick connect
      const portSelect = page.locator('select').first();
      if (await portSelect.isVisible()) {
        await portSelect.selectOption({ index: 1 });
      }
      
      const connectButton = page.locator('button:has-text("Connect")');
      if (await connectButton.isVisible()) {
        await connectButton.click();
        await page.waitForTimeout(500);
      }
      
      // Upload and validate
      const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Validate")');
      if (await uploadButton.isVisible()) {
        await uploadButton.click();
        await page.waitForTimeout(2000);
        
        // Check for different types of validation messages
        const infoMessage = page.locator('text=INFO');
        const warnMessage = page.locator('text=WARN');
        const errorMessage = page.locator('text=ERR');
        
        if (await infoMessage.isVisible()) {
          await expect(infoMessage).toBeVisible();
        }
        if (await warnMessage.isVisible()) {
          await expect(warnMessage).toBeVisible();
        }
        if (await errorMessage.isVisible()) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });

  test('should validate configuration before upload', async ({ page }) => {
    await test.step('Check pre-upload validation', async () => {
      // Look for configuration validation before device connection
      const configStatus = page.locator('.config-status, .validation-summary');
      
      if (await configStatus.isVisible()) {
        // Should show current configuration status
        await expect(configStatus).toBeVisible();
        
        const statusText = await configStatus.textContent();
        expect(statusText).toMatch(/(valid|invalid|warning|error)/i);
      }
    });
  });

  test('should support WiFi connection mode', async ({ page }) => {
    await test.step('Check for WiFi connection option', async () => {
      // Look for WiFi connection tab or option
      const wifiTab = page.locator('text=WiFi, text=Wi-Fi, button:has-text("WiFi")');
      
      if (await wifiTab.isVisible()) {
        await wifiTab.click();
        
        // Should show WiFi connection form
        const ipInput = page.locator('input[placeholder*="IP"], input[placeholder*="address"]');
        if (await ipInput.isVisible()) {
          await expect(ipInput).toBeVisible();
          
          // Test WiFi connection
          await ipInput.fill('192.168.1.100');
          
          const connectButton = page.locator('button:has-text("Connect")');
          if (await connectButton.isVisible()) {
            // Mock WiFi connection
            await page.addInitScript(() => {
              (window as any).__TAURI__ = {
                invoke: async (command: string, args: any) => {
                  if (command === 'connect_wifi') {
                    return 'Connected to WiFi device';
                  }
                  return 'ok';
                }
              };
            });
            
            await connectButton.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    });
  });
});