import { describe, it, expect } from 'vitest';
import {
  FluidNCConfigSchema,
  AxisConfigSchema,
  HomingConfigSchema,
  GlobalHomingConfigSchema,
  MotorConfigSchema,
  TMCConfigSchema,
  SpindleConfigSchema,
  IOConfigSchema,
  UARTConfigSchema,
  UARTChannelConfigSchema,
  MacrosConfigSchema,
  ControlConfigSchema,
  validateFluidNCConfig,
  validateAxisConfig,
  validateSpindleConfig,
  DEFAULT_CONFIG,
  toYAML,
  fromYAML,
} from './index';

describe('TMCConfigSchema', () => {
  it('should validate valid TMC configuration', () => {
    const validTMC = {
      cs_pin: 'gpio.5',
      r_sense_ohms: 0.11,
      run_amps: 1.5,
      hold_amps: 0.5,
      microsteps: 16,
      stallguard: 0,
      stallguard_debug: false,
      toff_disable: 0,
      toff_stealthchop: 5,
      toff_coolstep: 3,
      run_mode: 'StealthChop' as const,
      homing_mode: 'CoolStep' as const,
      use_enable: true,
    };

    const result = TMCConfigSchema.safeParse(validTMC);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validTMC);
    }
  });

  it('should reject invalid run_mode', () => {
    const invalidTMC = {
      run_mode: 'InvalidMode',
    };

    const result = TMCConfigSchema.safeParse(invalidTMC);
    expect(result.success).toBe(false);
  });

  it('should reject negative run_amps', () => {
    const invalidTMC = {
      run_amps: -1.0,
    };

    const result = TMCConfigSchema.safeParse(invalidTMC);
    expect(result.success).toBe(false);
  });

  it('should reject microsteps out of range', () => {
    const invalidTMC = {
      microsteps: 512, // Too high
    };

    const result = TMCConfigSchema.safeParse(invalidTMC);
    expect(result.success).toBe(false);
  });

  it('should allow empty object', () => {
    const result = TMCConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('MotorConfigSchema', () => {
  it('should validate valid motor configuration', () => {
    const validMotor = {
      limit_neg_pin: 'gpio.1',
      limit_pos_pin: 'gpio.2',
      hard_limits: true,
      pulloff_mm: 2.0,
      step_pin: 'gpio.3',
      direction_pin: 'gpio.4',
      disable_pin: 'gpio.5',
      tmc_2130: {
        cs_pin: 'gpio.6',
        run_amps: 1.0,
      },
    };

    const result = MotorConfigSchema.safeParse(validMotor);
    expect(result.success).toBe(true);
  });

  it('should reject negative pulloff_mm', () => {
    const invalidMotor = {
      pulloff_mm: -1.0,
    };

    const result = MotorConfigSchema.safeParse(invalidMotor);
    expect(result.success).toBe(false);
  });
});

describe('HomingConfigSchema', () => {
  it('should validate valid homing configuration', () => {
    const validHoming = {
      cycle: 1,
      positive_direction: false,
      mpos_mm: 0.0,
      feed_mm_per_min: 100,
      seek_mm_per_min: 1000,
      debounce_ms: 500,
      seek_scaler: 1.1,
      feed_scaler: 1.1,
    };

    const result = HomingConfigSchema.safeParse(validHoming);
    expect(result.success).toBe(true);
  });

  it('should reject negative feed rates', () => {
    const invalidHoming = {
      feed_mm_per_min: -100,
    };

    const result = HomingConfigSchema.safeParse(invalidHoming);
    expect(result.success).toBe(false);
  });

  it('should reject cycle numbers out of range', () => {
    const invalidHoming = {
      cycle: 15, // Too high
    };

    const result = HomingConfigSchema.safeParse(invalidHoming);
    expect(result.success).toBe(false);
  });
});

describe('GlobalHomingConfigSchema', () => {
  it('should validate valid global homing configuration', () => {
    const validGlobalHoming = {
      cycle: [1, 2, 3],
      allow_single_axis: true,
      must_home_first: false,
      depart_mm: 2.0,
    };

    const result = GlobalHomingConfigSchema.safeParse(validGlobalHoming);
    expect(result.success).toBe(true);
  });

  it('should reject negative depart_mm', () => {
    const invalidGlobalHoming = {
      depart_mm: -1.0,
    };

    const result = GlobalHomingConfigSchema.safeParse(invalidGlobalHoming);
    expect(result.success).toBe(false);
  });
});

describe('AxisConfigSchema', () => {
  it('should validate complete axis configuration', () => {
    const validAxis = {
      steps_per_mm: 80,
      max_rate_mm_per_min: 5000,
      acceleration_mm_per_sec2: 100,
      max_travel_mm: 300,
      soft_limits: true,
      homing: {
        cycle: 1,
        positive_direction: false,
        feed_mm_per_min: 100,
      },
      motor0: {
        step_pin: 'gpio.1',
        direction_pin: 'gpio.2',
        tmc_2130: {
          cs_pin: 'gpio.3',
          run_amps: 1.0,
        },
      },
    };

    const result = AxisConfigSchema.safeParse(validAxis);
    expect(result.success).toBe(true);
  });

  it('should reject negative steps_per_mm', () => {
    const invalidAxis = {
      steps_per_mm: -80,
    };

    const result = AxisConfigSchema.safeParse(invalidAxis);
    expect(result.success).toBe(false);
  });

  it('should reject zero max_rate_mm_per_min', () => {
    const invalidAxis = {
      max_rate_mm_per_min: 0,
    };

    const result = AxisConfigSchema.safeParse(invalidAxis);
    expect(result.success).toBe(false);
  });
});

describe('SpindleConfigSchema', () => {
  it('should validate complete spindle configuration', () => {
    const validSpindle = {
      pwm_hz: 1000,
      output_pin: 'gpio.1',
      enable_pin: 'gpio.2',
      direction_pin: 'gpio.3',
      speed_map: '0=0% 1000=100%',
      spinup_ms: 1000,
      spindown_ms: 2000,
      tool_num: 0,
      off_on_alarm: true,
    };

    const result = SpindleConfigSchema.safeParse(validSpindle);
    expect(result.success).toBe(true);
  });

  it('should reject negative pwm_hz', () => {
    const invalidSpindle = {
      pwm_hz: -1000,
    };

    const result = SpindleConfigSchema.safeParse(invalidSpindle);
    expect(result.success).toBe(false);
  });

  it('should reject negative spinup_ms', () => {
    const invalidSpindle = {
      spinup_ms: -1000,
    };

    const result = SpindleConfigSchema.safeParse(invalidSpindle);
    expect(result.success).toBe(false);
  });
});

describe('IOConfigSchema', () => {
  it('should validate complete IO configuration', () => {
    const validIO = {
      probe_pin: 'gpio.1',
      flood_pin: 'gpio.2',
      mist_pin: 'gpio.3',
      macro0_pin: 'gpio.4',
      macro1_pin: 'gpio.5',
      macro2_pin: 'gpio.6',
      macro3_pin: 'gpio.7',
    };

    const result = IOConfigSchema.safeParse(validIO);
    expect(result.success).toBe(true);
  });

  it('should allow empty IO configuration', () => {
    const result = IOConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('UARTChannelConfigSchema', () => {
  it('should validate complete UART channel configuration', () => {
    const validUARTChannel = {
      txd_pin: 'gpio.1',
      rxd_pin: 'gpio.2',
      rts_pin: 'gpio.3',
      baud: 115200,
      mode: '8N1',
    };

    const result = UARTChannelConfigSchema.safeParse(validUARTChannel);
    expect(result.success).toBe(true);
  });

  it('should reject negative baud rate', () => {
    const invalidUARTChannel = {
      baud: -115200,
    };

    const result = UARTChannelConfigSchema.safeParse(invalidUARTChannel);
    expect(result.success).toBe(false);
  });
});

describe('UARTConfigSchema', () => {
  it('should validate complete UART configuration', () => {
    const validUART = {
      uart0: {
        txd_pin: 'gpio.1',
        rxd_pin: 'gpio.2',
        baud: 115200,
      },
      uart1: {
        txd_pin: 'gpio.3',
        rxd_pin: 'gpio.4',
        baud: 9600,
      },
    };

    const result = UARTConfigSchema.safeParse(validUART);
    expect(result.success).toBe(true);
  });
});

describe('MacrosConfigSchema', () => {
  it('should validate complete macros configuration', () => {
    const validMacros = {
      macro0: 'G0 X0 Y0',
      macro1: 'G28',
      macro2: 'M3 S1000',
      macro3: 'M5',
      startup_line0: '$H',
      startup_line1: 'G92 X0 Y0 Z0',
    };

    const result = MacrosConfigSchema.safeParse(validMacros);
    expect(result.success).toBe(true);
  });

  it('should allow empty macros configuration', () => {
    const result = MacrosConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('ControlConfigSchema', () => {
  it('should validate complete control configuration', () => {
    const validControl = {
      safety_door_pin: 'gpio.1',
      reset_pin: 'gpio.2',
      feed_hold_pin: 'gpio.3',
      cycle_start_pin: 'gpio.4',
      fro_pin: 'gpio.5',
      sro_pin: 'gpio.6',
    };

    const result = ControlConfigSchema.safeParse(validControl);
    expect(result.success).toBe(true);
  });

  it('should allow empty control configuration', () => {
    const result = ControlConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('FluidNCConfigSchema', () => {
  it('should validate complete FluidNC configuration', () => {
    const validConfig = {
      name: 'Test Machine',
      board: 'ESP32',
      version: '3.7.0',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
          motor0: {
            step_pin: 'gpio.1',
            direction_pin: 'gpio.2',
          },
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
          motor0: {
            step_pin: 'gpio.3',
            direction_pin: 'gpio.4',
          },
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 1000,
          acceleration_mm_per_sec2: 50,
          max_travel_mm: 100,
          soft_limits: true,
          motor0: {
            step_pin: 'gpio.5',
            direction_pin: 'gpio.6',
          },
        },
      },
      homing: {
        cycle: [1, 2, 3],
        allow_single_axis: false,
        must_home_first: true,
        depart_mm: 2.0,
      },
      spindle: {
        pwm_hz: 1000,
        output_pin: 'gpio.7',
        enable_pin: 'gpio.8',
        spinup_ms: 1000,
        spindown_ms: 2000,
      },
      io: {
        probe_pin: 'gpio.9',
        flood_pin: 'gpio.10',
      },
      uart: {
        uart0: {
          txd_pin: 'gpio.11',
          rxd_pin: 'gpio.12',
          baud: 115200,
        },
      },
      macros: {
        macro0: 'G0 X0 Y0',
        startup_line0: '$H',
      },
      control: {
        reset_pin: 'gpio.13',
        feed_hold_pin: 'gpio.14',
      },
    };

    const result = FluidNCConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should validate minimal configuration', () => {
    const minimalConfig = {
      name: 'Minimal Machine',
    };

    const result = FluidNCConfigSchema.safeParse(minimalConfig);
    expect(result.success).toBe(true);
  });

  it('should validate empty configuration', () => {
    const result = FluidNCConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should handle additional properties', () => {
    const configWithExtra = {
      name: 'Test Machine',
      customProperty: 'custom value',
      anotherProperty: 123,
    };

    const result = FluidNCConfigSchema.safeParse(configWithExtra);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customProperty).toBe('custom value');
      expect(result.data.anotherProperty).toBe(123);
    }
  });
});

describe('Validation Functions', () => {
  describe('validateFluidNCConfig', () => {
    it('should return success for valid configuration', () => {
      const validConfig = {
        name: 'Test Machine',
        board: 'ESP32',
        axes: {
          x: {
            steps_per_mm: 80,
            max_rate_mm_per_min: 5000,
          },
        },
      };

      const result = validateFluidNCConfig(validConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Machine');
        expect(result.data.board).toBe('ESP32');
      }
    });

    it('should return error for invalid configuration', () => {
      const invalidConfig = {
        axes: {
          x: {
            steps_per_mm: -80, // Negative value should fail
          },
        },
      };

      const result = validateFluidNCConfig(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
        expect(result.errors.issues[0].path).toEqual(['axes', 'x', 'steps_per_mm']);
      }
    });
  });

  describe('validateAxisConfig', () => {
    it('should return success for valid axis configuration', () => {
      const validAxis = {
        steps_per_mm: 80,
        max_rate_mm_per_min: 5000,
        acceleration_mm_per_sec2: 100,
      };

      const result = validateAxisConfig(validAxis);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.steps_per_mm).toBe(80);
      }
    });

    it('should return error for invalid axis configuration', () => {
      const invalidAxis = {
        steps_per_mm: 0, // Zero should fail (must be positive)
      };

      const result = validateAxisConfig(invalidAxis);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateSpindleConfig', () => {
    it('should return success for valid spindle configuration', () => {
      const validSpindle = {
        pwm_hz: 1000,
        output_pin: 'gpio.1',
        spinup_ms: 1000,
      };

      const result = validateSpindleConfig(validSpindle);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pwm_hz).toBe(1000);
      }
    });

    it('should return error for invalid spindle configuration', () => {
      const invalidSpindle = {
        pwm_hz: -1000, // Negative should fail
      };

      const result = validateSpindleConfig(invalidSpindle);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('DEFAULT_CONFIG', () => {
  it('should be a valid FluidNC configuration', () => {
    const result = validateFluidNCConfig(DEFAULT_CONFIG);
    expect(result.success).toBe(true);
  });

  it('should have expected default values', () => {
    expect(DEFAULT_CONFIG.name).toBe('FluidNC Configuration');
    expect(DEFAULT_CONFIG.board).toBe('');
  });
});

describe('Edge Cases and Boundary Conditions', () => {
  it('should handle null and undefined inputs gracefully', () => {
    expect(validateFluidNCConfig(null).success).toBe(false);
    expect(validateFluidNCConfig(undefined).success).toBe(false);
    expect(validateAxisConfig(null).success).toBe(false);
    expect(validateSpindleConfig(undefined).success).toBe(false);
  });

  it('should handle non-object inputs', () => {
    expect(validateFluidNCConfig('string').success).toBe(false);
    expect(validateFluidNCConfig(123).success).toBe(false);
    expect(validateFluidNCConfig(true).success).toBe(false);
    expect(validateFluidNCConfig([]).success).toBe(false);
  });

  it('should handle extreme numeric values', () => {
    const extremeAxis = {
      steps_per_mm: Number.MAX_SAFE_INTEGER,
      max_rate_mm_per_min: Number.MAX_SAFE_INTEGER,
    };

    const result = validateAxisConfig(extremeAxis);
    expect(result.success).toBe(true);
  });

  it('should reject infinity and NaN values', () => {
    const invalidAxis = {
      steps_per_mm: Infinity,
    };

    const result = validateAxisConfig(invalidAxis);
    expect(result.success).toBe(false);

    const nanAxis = {
      max_rate_mm_per_min: NaN,
    };

    const nanResult = validateAxisConfig(nanAxis);
    expect(nanResult.success).toBe(false);
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    const config = {
      name: longString,
    };

    const result = validateFluidNCConfig(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe(longString);
    }
  });

  it('should handle deeply nested configurations', () => {
    const deepConfig = {
      name: 'Deep Test',
      axes: {
        x: {
          motor0: {
            tmc_2130: {
              cs_pin: 'gpio.1',
              run_amps: 1.0,
              run_mode: 'StealthChop' as const,
            },
          },
        },
      },
    };

    const result = validateFluidNCConfig(deepConfig);
    expect(result.success).toBe(true);
  });
});

describe('YAML Converters', () => {
  describe('toYAML', () => {
    it('should convert configuration to YAML string', () => {
      const config = {
        name: 'Test Machine',
        board: 'ESP32',
        axes: {
          x: {
            steps_per_mm: 80,
            max_rate_mm_per_min: 5000,
          },
        },
      };

      const yamlString = toYAML(config);
      expect(typeof yamlString).toBe('string');
      expect(yamlString).toContain('name: Test Machine');
      expect(yamlString).toContain('board: ESP32');
      expect(yamlString).toContain('steps_per_mm: 80');
    });

    it('should preserve unknown keys in YAML output', () => {
      const configWithUnknown = {
        name: 'Test Machine',
        customProperty: 'custom value',
        someNestedUnknown: {
          unknownField: 123,
          anotherField: true,
        },
        axes: {
          x: {
            steps_per_mm: 80,
            customAxisProperty: 'axis custom',
            motor0: {
              step_pin: 'gpio.1',
              customMotorProperty: 'motor custom',
            },
          },
        },
      };

      const yamlString = toYAML(configWithUnknown);
      expect(yamlString).toContain('customProperty: custom value');
      expect(yamlString).toContain('unknownField: 123');
      expect(yamlString).toContain('customAxisProperty: axis custom');
      expect(yamlString).toContain('customMotorProperty: motor custom');
    });
  });

  describe('fromYAML', () => {
    it('should parse valid YAML to configuration object', () => {
      const yamlString = `
name: Test Machine
board: ESP32
axes:
  x:
    steps_per_mm: 80
    max_rate_mm_per_min: 5000
      `;

      const result = fromYAML(yamlString);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Machine');
        expect(result.data.board).toBe('ESP32');
        expect(result.data.axes?.x?.steps_per_mm).toBe(80);
      }
    });

    it('should preserve unknown keys when parsing YAML', () => {
      const yamlString = `
name: Test Machine
customProperty: custom value
someNestedUnknown:
  unknownField: 123
  anotherField: true
axes:
  x:
    steps_per_mm: 80
    customAxisProperty: axis custom
    motor0:
      step_pin: gpio.1
      customMotorProperty: motor custom
      `;

      const result = fromYAML(yamlString);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Machine');
        expect(result.data.customProperty).toBe('custom value');
        expect(result.data.someNestedUnknown).toEqual({
          unknownField: 123,
          anotherField: true,
        });
        expect(result.data.axes?.x?.customAxisProperty).toBe('axis custom');
        expect(result.data.axes?.x?.motor0?.customMotorProperty).toBe('motor custom');
      }
    });

    it('should return error for invalid YAML', () => {
      const invalidYaml = `
name: Test Machine
board: ESP32
  invalid: yaml: structure:
    `;

      const result = fromYAML(invalidYaml);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
        expect(result.errors.issues[0].message).toContain('YAML parsing error');
      }
    });

    it('should return error for YAML that fails validation', () => {
      const invalidConfig = `
name: Test Machine
axes:
  x:
    steps_per_mm: -80
      `;

      const result = fromYAML(invalidConfig);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Round-trip conversion with unknown keys', () => {
    it('should maintain unknown keys through complete round-trip', () => {
      const originalConfig = {
        name: 'Round-trip Test',
        board: 'ESP32',
        customProperty: 'preserved value',
        complexUnknown: {
          nested: {
            deeply: 'nested value',
            array: [1, 2, 3],
            boolean: true,
          },
          number: 42,
        },
        axes: {
          x: {
            steps_per_mm: 80,
            max_rate_mm_per_min: 5000,
            customAxisProperty: 'axis preserved',
            motor0: {
              step_pin: 'gpio.1',
              direction_pin: 'gpio.2',
              customMotorProperty: 'motor preserved',
              tmc_2130: {
                cs_pin: 'gpio.3',
                run_amps: 1.0,
                customTMCProperty: 'tmc preserved',
              },
            },
            homing: {
              cycle: 1,
              positive_direction: false,
              customHomingProperty: 'homing preserved',
            },
          },
          y: {
            steps_per_mm: 80,
            customYAxisProperty: 'y-axis preserved',
          },
        },
        homing: {
          cycle: [1, 2],
          allow_single_axis: true,
          customGlobalHomingProperty: 'global homing preserved',
        },
        spindle: {
          pwm_hz: 1000,
          output_pin: 'gpio.10',
          customSpindleProperty: 'spindle preserved',
        },
        io: {
          probe_pin: 'gpio.11',
          customIOProperty: 'io preserved',
        },
        uart: {
          uart0: {
            txd_pin: 'gpio.12',
            rxd_pin: 'gpio.13',
            customUARTProperty: 'uart preserved',
          },
          customUARTConfigProperty: 'uart config preserved',
        },
        macros: {
          macro0: 'G28',
          customMacroProperty: 'macro preserved',
        },
        control: {
          reset_pin: 'gpio.14',
          customControlProperty: 'control preserved',
        },
      };

      // Step 1: Convert to YAML
      const yamlString = toYAML(originalConfig);
      expect(typeof yamlString).toBe('string');

      // Step 2: Convert back from YAML
      const result = fromYAML(yamlString);
      expect(result.success).toBe(true);

      if (result.success) {
        const roundTripConfig = result.data;

        // Verify all standard properties are preserved
        expect(roundTripConfig.name).toBe(originalConfig.name);
        expect(roundTripConfig.board).toBe(originalConfig.board);
        expect(roundTripConfig.axes?.x?.steps_per_mm).toBe(originalConfig.axes.x.steps_per_mm);

        // Verify unknown keys at root level are preserved
        expect(roundTripConfig.customProperty).toBe(originalConfig.customProperty);
        expect(roundTripConfig.complexUnknown).toEqual(originalConfig.complexUnknown);

        // Verify unknown keys in nested structures are preserved
        expect(roundTripConfig.axes?.x?.customAxisProperty).toBe(originalConfig.axes.x.customAxisProperty);
        expect(roundTripConfig.axes?.x?.motor0?.customMotorProperty).toBe(originalConfig.axes.x.motor0.customMotorProperty);
        expect(roundTripConfig.axes?.x?.motor0?.tmc_2130?.customTMCProperty).toBe(originalConfig.axes.x.motor0.tmc_2130.customTMCProperty);
        expect(roundTripConfig.axes?.x?.homing?.customHomingProperty).toBe(originalConfig.axes.x.homing.customHomingProperty);
        expect(roundTripConfig.axes?.y?.customYAxisProperty).toBe(originalConfig.axes.y.customYAxisProperty);

        // Verify unknown keys in other sections are preserved
        expect(roundTripConfig.homing?.customGlobalHomingProperty).toBe(originalConfig.homing.customGlobalHomingProperty);
        expect(roundTripConfig.spindle?.customSpindleProperty).toBe(originalConfig.spindle.customSpindleProperty);
        expect(roundTripConfig.io?.customIOProperty).toBe(originalConfig.io.customIOProperty);
        expect(roundTripConfig.uart?.uart0?.customUARTProperty).toBe(originalConfig.uart.uart0.customUARTProperty);
        expect(roundTripConfig.uart?.customUARTConfigProperty).toBe(originalConfig.uart.customUARTConfigProperty);
        expect(roundTripConfig.macros?.customMacroProperty).toBe(originalConfig.macros.customMacroProperty);
        expect(roundTripConfig.control?.customControlProperty).toBe(originalConfig.control.customControlProperty);
      }
    });

    it('should handle edge cases in round-trip conversion', () => {
      const edgeCaseConfig = {
        name: 'Edge Case Test',
        // Test various data types as unknown properties
        stringProp: 'string value',
        numberProp: 42.5,
        booleanProp: false,
        nullProp: null,
        arrayProp: ['item1', 'item2', { nested: 'in array' }],
        objectProp: {
          level1: {
            level2: {
              deepValue: 'very deep',
            },
          },
        },
        emptyObjectProp: {},
        emptyArrayProp: [],
        // Test with actual FluidNC properties mixed in
        axes: {
          customAxis: {
            steps_per_mm: 100,
            // Unknown properties mixed with known ones
            weirdProperty: { complex: true, value: [1, 2, 3] },
          },
        },
      };

      // Round-trip conversion
      const yamlString = toYAML(edgeCaseConfig);
      const result = fromYAML(yamlString);

      expect(result.success).toBe(true);
      if (result.success) {
        const roundTripConfig = result.data;

        // Verify all edge case properties are preserved
        expect(roundTripConfig.stringProp).toBe(edgeCaseConfig.stringProp);
        expect(roundTripConfig.numberProp).toBe(edgeCaseConfig.numberProp);
        expect(roundTripConfig.booleanProp).toBe(edgeCaseConfig.booleanProp);
        expect(roundTripConfig.nullProp).toBe(edgeCaseConfig.nullProp);
        expect(roundTripConfig.arrayProp).toEqual(edgeCaseConfig.arrayProp);
        expect(roundTripConfig.objectProp).toEqual(edgeCaseConfig.objectProp);
        expect(roundTripConfig.emptyObjectProp).toEqual(edgeCaseConfig.emptyObjectProp);
        expect(roundTripConfig.emptyArrayProp).toEqual(edgeCaseConfig.emptyArrayProp);
        expect(roundTripConfig.axes?.customAxis?.weirdProperty).toEqual(edgeCaseConfig.axes.customAxis.weirdProperty);
      }
    });
  });
});