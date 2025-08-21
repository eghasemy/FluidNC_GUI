/**
 * Tests for legacy configuration mapper and enhanced import functionality
 */
import { describe, it, expect } from 'vitest';
import { 
  transformLegacyConfig, 
  generateUserFriendlyErrors, 
  fromYAMLWithLegacySupport 
} from './index';
import { z } from 'zod';

describe('Legacy Configuration Mapper', () => {
  describe('transformLegacyConfig', () => {
    it('should transform flat axis structure to nested axes', () => {
      const legacyConfig = {
        name: 'Legacy Machine',
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000
        }
      };

      const result = transformLegacyConfig(legacyConfig);
      
      expect(result.success).toBe(true);
      expect(result.data.axes).toBeDefined();
      expect(result.data.axes.x).toEqual({
        steps_per_mm: 80,
        max_rate_mm_per_min: 5000
      });
      expect(result.data.axes.y).toEqual({
        steps_per_mm: 80,
        max_rate_mm_per_min: 5000
      });
      expect(result.data.x).toBeUndefined();
      expect(result.data.y).toBeUndefined();
      
      // Should have suggestions about the transformation
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'info',
          message: expect.stringContaining('Converted flat axis configuration')
        })
      );
    });

    it('should transform legacy stepper driver fields', () => {
      const legacyConfig = {
        name: 'Legacy Stepper',
        axes: {
          x: {
            step_pin: 'gpio.2',
            direction_pin: 'gpio.5',
            disable_pin: 'gpio.13',
            stepper_driver: 'A4988'
          }
        }
      };

      const result = transformLegacyConfig(legacyConfig);
      
      expect(result.success).toBe(true);
      expect(result.data.axes.x.motor0).toBeDefined();
      expect(result.data.axes.x.motor0.step_pin).toBe('gpio.2');
      expect(result.data.axes.x.motor0.direction_pin).toBe('gpio.5');
      expect(result.data.axes.x.motor0.disable_pin).toBe('gpio.13');
      
      // Legacy fields should be removed
      expect(result.data.axes.x.step_pin).toBeUndefined();
      expect(result.data.axes.x.direction_pin).toBeUndefined();
      expect(result.data.axes.x.disable_pin).toBeUndefined();
      
      // Should have mapping information
      expect(result.mappings.length).toBeGreaterThan(0);
      expect(result.mappings).toContainEqual(
        expect.objectContaining({
          oldPath: 'step_pin',
          newPath: 'motor0.step_pin'
        })
      );
    });

    it('should transform legacy TMC driver configuration', () => {
      const legacyConfig = {
        name: 'Legacy TMC',
        axes: {
          x: {
            tmc2209: {
              current_ma: 800,
              microsteps: 16
            }
          }
        }
      };

      const result = transformLegacyConfig(legacyConfig);
      
      expect(result.success).toBe(true);
      expect(result.data.axes.x.motor0).toBeDefined();
      expect(result.data.axes.x.motor0.tmc_2209).toEqual({
        current_ma: 800,
        microsteps: 16
      });
      expect(result.data.axes.x.tmc2209).toBeUndefined();
      
      expect(result.mappings).toContainEqual(
        expect.objectContaining({
          oldPath: 'tmc2209',
          newPath: 'motor0.tmc_2209'
        })
      );
    });

    it('should transform legacy spindle configuration', () => {
      const legacyConfig = {
        name: 'Legacy Spindle',
        pwm_pin: 'gpio.25',
        spindle_enable_pin: 'gpio.4',
        spindle_dir_pin: 'gpio.16'
      };

      const result = transformLegacyConfig(legacyConfig);
      
      expect(result.success).toBe(true);
      expect(result.data.spindle).toBeDefined();
      expect(result.data.spindle.output_pin).toBe('gpio.25');
      expect(result.data.spindle.enable_pin).toBe('gpio.4');
      expect(result.data.spindle.direction_pin).toBe('gpio.16');
      
      // Legacy fields should be removed
      expect(result.data.pwm_pin).toBeUndefined();
      expect(result.data.spindle_enable_pin).toBeUndefined();
      expect(result.data.spindle_dir_pin).toBeUndefined();
    });

    it('should provide suggestions for missing board type', () => {
      const legacyConfig = {
        name: 'No Board Config'
      };

      const result = transformLegacyConfig(legacyConfig);
      
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'warning',
          message: 'No board type specified',
          suggestion: expect.stringContaining('Add board: "ESP32"')
        })
      );
    });

    it('should detect legacy stepper drivers and suggest upgrades', () => {
      const legacyConfig = {
        name: 'Old Drivers',
        someField: 'A4988 driver configuration'
      };

      const result = transformLegacyConfig(legacyConfig);
      
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'info',
          message: 'Detected legacy stepper driver: A4988',
          suggestion: expect.stringContaining('Consider upgrading to TMC2209')
        })
      );
    });
  });

  describe('generateUserFriendlyErrors', () => {
    it('should provide helpful suggestions for common validation errors', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'number',
          received: 'string',
          path: ['axes', 'x', 'steps_per_mm'],
          message: 'Expected number, received string'
        },
        {
          code: 'too_small',
          minimum: 0,
          type: 'number',
          inclusive: false,
          path: ['axes', 'x', 'max_rate_mm_per_min'],
          message: 'Number must be greater than 0'
        }
      ]);

      const suggestions = generateUserFriendlyErrors(zodError);
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toEqual(
        expect.objectContaining({
          type: 'error',
          message: 'axes.x.steps_per_mm: Expected number, received string',
          suggestion: 'steps_per_mm should be a positive number (e.g., 80 for typical setup)'
        })
      );
      expect(suggestions[1]).toEqual(
        expect.objectContaining({
          type: 'error',
          message: 'axes.x.max_rate_mm_per_min: Number must be greater than 0',
          suggestion: 'Value must be positive for motor configuration'
        })
      );
    });
  });

  describe('fromYAMLWithLegacySupport', () => {
    it('should successfully import and transform legacy YAML configuration', () => {
      const legacyYaml = `
name: Legacy Test Machine
x:
  steps_per_mm: 80
  max_rate_mm_per_min: 5000
  step_pin: gpio.2
  direction_pin: gpio.5
y:
  steps_per_mm: 80
  max_rate_mm_per_min: 5000
  step_pin: gpio.12
  direction_pin: gpio.14
pwm_pin: gpio.25
`;

      const result = fromYAMLWithLegacySupport(legacyYaml);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Legacy Test Machine');
      expect(result.data.axes).toBeDefined();
      expect(result.data.axes.x.motor0.step_pin).toBe('gpio.2');
      expect(result.data.spindle.output_pin).toBe('gpio.25');
      
      expect(result.mappings.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle YAML parsing errors gracefully', () => {
      const invalidYaml = `
name: Test
  invalid: yaml: structure:
    badly indented
`;

      const result = fromYAMLWithLegacySupport(invalidYaml);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.suggestions).toContainEqual(
        expect.objectContaining({
          type: 'error',
          message: expect.stringContaining('Failed to parse YAML'),
          suggestion: expect.stringContaining('Check for YAML syntax errors')
        })
      );
    });

    it('should provide detailed feedback for validation failures', () => {
      const invalidConfig = `
name: Invalid Config
axes:
  x:
    steps_per_mm: -80
    max_rate_mm_per_min: "not a number"
`;

      const result = fromYAMLWithLegacySupport(invalidConfig);
      
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      
      // Should have user-friendly error messages
      const errorSuggestions = result.suggestions.filter(s => s.type === 'error');
      expect(errorSuggestions.length).toBeGreaterThan(0);
    });

    it('should preserve unknown keys during transformation', () => {
      const configWithUnknown = `
name: Test Machine
customProperty: custom value
axes:
  x:
    steps_per_mm: 80
    customAxisProperty: axis custom
`;

      const result = fromYAMLWithLegacySupport(configWithUnknown);
      
      expect(result.success).toBe(true);
      expect(result.data.customProperty).toBe('custom value');
      expect(result.data.axes.x.customAxisProperty).toBe('axis custom');
    });
  });
});