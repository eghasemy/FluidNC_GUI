/**
 * Test utilities for FluidNC GUI E2E tests
 */
import { Page, expect } from '@playwright/test';

/**
 * Common navigation utilities
 */
export class AppNavigation {
  constructor(private page: Page) {}

  async waitForAppToLoad() {
    // Wait for the main app container to be visible
    await this.page.waitForSelector('[data-testid="app-container"]', { timeout: 10000 });
  }

  async goToWizard() {
    await this.page.click('button:has-text("Switch to Wizard")');
    await this.page.waitForSelector('[data-testid="wizard-container"]');
  }

  async goToExpertEditor() {
    await this.page.click('button:has-text("Go to Expert Editor")');
    await this.page.waitForSelector('[data-testid="expert-editor-container"]');
  }

  async goToDeviceValidation() {
    await this.page.click('button:has-text("Device Validation")');
    await this.page.waitForSelector('[data-testid="device-validation-container"]');
  }

  async goToConsole() {
    await this.page.click('button:has-text("Go to Console")');
    await this.page.waitForSelector('[data-testid="console-container"]');
  }
}

/**
 * Wizard flow utilities
 */
export class WizardHelpers {
  constructor(private page: Page) {}

  async navigateToStep(stepName: string) {
    // Click on step in navigation or use next/back buttons
    await this.page.click(`[data-testid="wizard-step-${stepName}"]`);
  }

  async fillMachineInfo(name: string, board: string) {
    await this.page.fill('[data-testid="machine-name-input"]', name);
    await this.page.selectOption('[data-testid="board-select"]', board);
  }

  async configureAxis(axis: string, stepsPerMm: number, maxRate: number) {
    await this.page.fill(`[data-testid="${axis}-steps-per-mm"]`, stepsPerMm.toString());
    await this.page.fill(`[data-testid="${axis}-max-rate"]`, maxRate.toString());
  }

  async configureMotor(axis: string, stepPin: string, dirPin: string) {
    await this.page.fill(`[data-testid="${axis}-step-pin"]`, stepPin);
    await this.page.fill(`[data-testid="${axis}-direction-pin"]`, dirPin);
  }

  async configureSpindle(outputPin: string, enablePin: string) {
    await this.page.fill('[data-testid="spindle-output-pin"]', outputPin);
    await this.page.fill('[data-testid="spindle-enable-pin"]', enablePin);
  }

  async proceedToNextStep() {
    await this.page.click('[data-testid="wizard-next-button"]');
  }

  async goToPreviousStep() {
    await this.page.click('[data-testid="wizard-back-button"]');
  }

  async finishWizard() {
    await this.page.click('[data-testid="wizard-finish-button"]');
  }
}

/**
 * Expert Editor utilities
 */
export class ExpertEditorHelpers {
  constructor(private page: Page) {}

  async expandTreeNode(nodePath: string) {
    await this.page.click(`[data-testid="tree-node-${nodePath}"] .expand-icon`);
  }

  async selectTreeNode(nodePath: string) {
    await this.page.click(`[data-testid="tree-node-${nodePath}"]`);
  }

  async editFieldValue(fieldName: string, value: string) {
    await this.page.fill(`[data-testid="field-${fieldName}"]`, value);
  }

  async addRootKey(keyName: string) {
    await this.page.click('[data-testid="add-root-key-button"]');
    await this.page.fill('[data-testid="new-key-input"]', keyName);
    await this.page.click('[data-testid="confirm-add-key"]');
  }

  async loadSampleConfig() {
    await this.page.click('[data-testid="load-sample-config"]');
  }

  async exportYaml() {
    await this.page.click('[data-testid="export-yaml-button"]');
  }

  async exportJson() {
    await this.page.click('[data-testid="export-json-button"]');
  }

  async importYaml(yamlContent: string) {
    await this.page.click('[data-testid="import-yaml-button"]');
    await this.page.fill('[data-testid="import-textarea"]', yamlContent);
    await this.page.click('[data-testid="import-confirm-button"]');
  }
}

/**
 * Device Validation utilities  
 */
export class DeviceValidationHelpers {
  constructor(private page: Page) {}

  async selectSerialPort(portName: string) {
    await this.page.selectOption('[data-testid="serial-port-select"]', portName);
  }

  async setBaudRate(baudRate: number) {
    await this.page.selectOption('[data-testid="baud-rate-select"]', baudRate.toString());
  }

  async connect() {
    await this.page.click('[data-testid="connect-button"]');
  }

  async disconnect() {
    await this.page.click('[data-testid="disconnect-button"]');
  }

  async uploadAndValidate() {
    await this.page.click('[data-testid="upload-validate-button"]');
  }

  async waitForValidationResult() {
    await this.page.waitForSelector('[data-testid="validation-result"]', { timeout: 10000 });
  }

  async getValidationStatus() {
    const result = await this.page.textContent('[data-testid="validation-status"]');
    return result?.trim();
  }
}

/**
 * File download utilities
 */
export class FileHelpers {
  constructor(private page: Page) {}

  async waitForDownload(buttonSelector: string): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click(buttonSelector),
    ]);
    
    const path = await download.path();
    return path || '';
  }

  async getDownloadedContent(path: string): Promise<string> {
    const fs = await import('fs/promises');
    return fs.readFile(path, 'utf-8');
  }
}

/**
 * Common assertions for FluidNC configurations
 */
export class ConfigAssertions {
  static async assertValidYaml(content: string) {
    try {
      const yaml = await import('js-yaml');
      const parsed = yaml.load(content);
      expect(parsed).toBeDefined();
      return parsed;
    } catch (error) {
      throw new Error(`Invalid YAML: ${error}`);
    }
  }

  static async assertValidConfig(config: any) {
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('board');
    expect(config).toHaveProperty('axes');
  }

  static async assertAxisConfig(config: any, axisName: string) {
    expect(config.axes).toHaveProperty(axisName);
    const axis = config.axes[axisName];
    expect(axis).toHaveProperty('steps_per_mm');
    expect(axis).toHaveProperty('max_rate_mm_per_min');
  }
}