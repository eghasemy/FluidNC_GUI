import { describe, it, expect } from 'vitest';
import { toYAML, toYAMLWithComments } from '../src/index.js';

describe('Comment-aware YAML Export', () => {
  it('should export YAML without comments using toYAML', () => {
    const config = {
      name: 'Test Config',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
        }
      }
    };

    const yaml = toYAML(config);
    
    expect(yaml).toContain('name: Test Config');
    expect(yaml).toContain('board: ESP32');
    expect(yaml).not.toContain('#'); // No comments
  });

  it('should export YAML with helpful comments using toYAMLWithComments', () => {
    const config = {
      name: 'Test Config',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
        }
      }
    };

    const yamlWithComments = toYAMLWithComments(config);
    
    console.log('Generated YAML with comments:');
    console.log(yamlWithComments);
    
    // Should contain the original configuration
    expect(yamlWithComments).toContain('name: Test Config');
    expect(yamlWithComments).toContain('board: ESP32');
    
    // Should contain helpful comments
    expect(yamlWithComments).toContain('# FluidNC Configuration');
    expect(yamlWithComments).toContain('# Axis configuration');
    expect(yamlWithComments).toContain('# X-axis configuration');
  });

  it('should preserve all configuration data when adding comments', () => {
    const config = {
      name: 'Complex Config',
      board: 'ESP32-S3',
      version: '3.7',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 500,
          motor0: {
            step_pin: 'gpio.2',
            direction_pin: 'gpio.5'
          },
          homing: {
            cycle: 1,
            positive_direction: false
          }
        }
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4'
      }
    };

    const regularYaml = toYAML(config);
    const commentedYaml = toYAMLWithComments(config);
    
    // The commented version should contain all the same configuration values
    expect(commentedYaml).toContain('name: Complex Config');
    expect(commentedYaml).toContain('board: ESP32-S3');
    expect(commentedYaml).toContain('version: \'3.7\'');
    expect(commentedYaml).toContain('steps_per_mm: 80');
    expect(commentedYaml).toContain('step_pin: gpio.2');
    expect(commentedYaml).toContain('output_pin: gpio.25');
    
    // Should have helpful section comments
    expect(commentedYaml).toContain('# Spindle/laser control configuration');
    expect(commentedYaml).toContain('# Primary motor driver configuration');
    expect(commentedYaml).toContain('# Homing behavior configuration');
  });

  it('should handle empty or minimal configurations gracefully', () => {
    const minimalConfig = {
      name: 'Minimal Config'
    };

    const commentedYaml = toYAMLWithComments(minimalConfig);
    
    expect(commentedYaml).toContain('name: Minimal Config');
    expect(commentedYaml).toContain('# FluidNC Configuration');
  });
});