import { describe, it, expect } from 'vitest';
import { toYAML, toYAMLWithComments } from '../src/index.js';

describe('Comment Export Demo', () => {
  it('should demonstrate comment-aware export with comprehensive example', () => {
    const demoConfig = {
      name: 'Demo CNC Router',
      board: 'ESP32',
      version: '3.7',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 500,
          max_travel_mm: 300,
          soft_limits: true,
          motor0: {
            step_pin: 'gpio.2',
            direction_pin: 'gpio.5',
            disable_pin: 'gpio.13'
          },
          homing: {
            cycle: 1,
            positive_direction: false,
            feed_mm_per_min: 100
          }
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 500,
          max_travel_mm: 300,
          soft_limits: true,
          motor0: {
            step_pin: 'gpio.12',
            direction_pin: 'gpio.14',
            disable_pin: 'gpio.13'
          },
          homing: {
            cycle: 1,
            positive_direction: false,
            feed_mm_per_min: 100
          }
        }
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4',
        pwm_hz: 5000,
        off_on_alarm: true
      },
      macros: {
        macro0: 'G0 X0 Y0 Z5',
        startup_line0: '$H'
      }
    };

    console.log('\n📄 STANDARD YAML EXPORT (without comments):');
    console.log('-'.repeat(50));
    const standardYaml = toYAML(demoConfig);
    console.log(standardYaml);

    console.log('\n💬 COMMENT-AWARE YAML EXPORT (with helpful guidance):');
    console.log('-'.repeat(50));
    const commentedYaml = toYAMLWithComments(demoConfig);
    console.log(commentedYaml);

    // Verify that both exports contain the same configuration data
    expect(standardYaml).toContain('name: Demo CNC Router');
    expect(standardYaml).toContain('board: ESP32');
    expect(standardYaml).toContain('steps_per_mm: 80');
    expect(standardYaml).toContain('output_pin: gpio.25');

    expect(commentedYaml).toContain('name: Demo CNC Router');
    expect(commentedYaml).toContain('board: ESP32');
    expect(commentedYaml).toContain('steps_per_mm: 80');
    expect(commentedYaml).toContain('output_pin: gpio.25');

    // Verify that only the commented version has helpful comments
    expect(standardYaml).not.toContain('#');
    expect(commentedYaml).toContain('# FluidNC Configuration');
    expect(commentedYaml).toContain('# Axis configuration');
    expect(commentedYaml).toContain('# X-axis configuration');
    expect(commentedYaml).toContain('# Spindle/laser control configuration');
    expect(commentedYaml).toContain('# Primary motor driver configuration');
    expect(commentedYaml).toContain('# Homing behavior configuration');
    expect(commentedYaml).toContain('# Custom G-code macros');

    console.log('\n✅ COMMENT-AWARE EXPORT DEMO COMPLETE');
    console.log('The export now includes helpful educational comments!');
  });
});