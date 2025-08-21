import { test, expect } from '@playwright/test';

test.describe('E2E Test Infrastructure Validation', () => {
  test('should validate Playwright setup and configuration', async () => {
    // This test validates that our E2E infrastructure is properly configured
    
    // Test 1: Verify test fixtures are accessible
    const { testConfigs } = await import('./fixtures/test-configs');
    expect(testConfigs.basicRouter).toBeDefined();
    expect(testConfigs.basicRouter.name).toBe('Test CNC Router');
    expect(testConfigs.legacyConfig).toContain('Legacy CNC Router');
    
    // Test 2: Verify helper utilities are importable
    const { AppNavigation, WizardHelpers, ExpertEditorHelpers, DeviceValidationHelpers } = 
      await import('./utils/helpers');
    
    expect(AppNavigation).toBeDefined();
    expect(WizardHelpers).toBeDefined();
    expect(ExpertEditorHelpers).toBeDefined();
    expect(DeviceValidationHelpers).toBeDefined();
    
    // Test 3: Verify configuration validation utility
    const { ConfigAssertions } = await import('./utils/helpers');
    const validConfig = testConfigs.basicRouter;
    
    // This should not throw
    await ConfigAssertions.assertValidConfig(validConfig);
    await ConfigAssertions.assertAxisConfig(validConfig, 'x');
    
    console.log('✅ E2E test infrastructure validation passed');
  });

  test('should validate mock data structure', async () => {
    const { mockDeviceResponses, wizardSteps, boardTypes } = 
      await import('./fixtures/test-configs');
    
    // Verify mock device responses
    expect(mockDeviceResponses.connectionSuccess).toContain('FluidNC');
    expect(mockDeviceResponses.validationPass).toContain('validated successfully');
    expect(mockDeviceResponses.validationError).toContain('ERR');
    
    // Verify wizard steps
    expect(wizardSteps.machine).toBe('machine');
    expect(wizardSteps.review).toBe('review');
    
    // Verify board types
    expect(boardTypes).toContain('ESP32');
    expect(boardTypes.length).toBeGreaterThan(0);
    
    console.log('✅ Mock data validation passed');
  });

  test('should validate YAML and JSON processing', async () => {
    const { testConfigs } = await import('./fixtures/test-configs');
    const { ConfigAssertions } = await import('./utils/helpers');
    
    // Test YAML conversion
    const yamlString = testConfigs.legacyConfig;
    const config = await ConfigAssertions.assertValidYaml(yamlString);
    
    expect(config).toBeDefined();
    expect(config.name).toBe('Legacy CNC Router');
    
    // Test JSON processing
    const jsonString = JSON.stringify(testConfigs.basicRouter);
    const parsedConfig = JSON.parse(jsonString);
    
    await ConfigAssertions.assertValidConfig(parsedConfig);
    
    console.log('✅ YAML/JSON processing validation passed');
  });
});