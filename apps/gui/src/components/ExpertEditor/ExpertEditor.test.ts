import { describe, it, expect } from 'vitest';
import { FluidNCConfig } from '@fluidnc-gui/core';

// Basic test to verify Expert Editor types and interfaces work correctly
describe('Expert Editor', () => {
  it('should handle basic configuration structure', () => {
    const testConfig: FluidNCConfig = {
      name: 'Test Configuration',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 500,
          motor0: {
            step_pin: 'gpio.2',
            direction_pin: 'gpio.5',
          },
        },
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.26',
        direction_pin: 'gpio.27',
      },
    };

    expect(testConfig.name).toBe('Test Configuration');
    expect(testConfig.axes?.x?.steps_per_mm).toBe(80);
    expect(testConfig.spindle?.output_pin).toBe('gpio.25');
  });

  it('should support unknown properties', () => {
    const testConfig: FluidNCConfig = {
      name: 'Test Configuration',
      board: 'ESP32',
      custom_property: 'custom_value',
      nested_custom: {
        some_key: 'some_value',
        another_key: 123,
      },
    };

    expect(testConfig.custom_property).toBe('custom_value');
    expect((testConfig as any).nested_custom.some_key).toBe('some_value');
  });

  it('should handle path navigation', () => {
    const testPath = ['axes', 'x', 'motor0', 'step_pin'];
    const testConfig = {
      axes: {
        x: {
          motor0: {
            step_pin: 'gpio.2',
          },
        },
      },
    };

    // Simulate getting value at path
    let current: any = testConfig;
    for (const key of testPath) {
      current = current[key];
    }

    expect(current).toBe('gpio.2');
  });
});