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
  BoardDescriptorSchema,
  BoardPinSchema,
  BoardCapabilitiesSchema,
  PinCapabilitySchema,
  validateFluidNCConfig,
  validateAxisConfig,
  validateSpindleConfig,
  validateAxisConfigWithContext,
  validateBoardDescriptor,
  loadBoardDescriptor,
  loadBoardDescriptorFromObject,
  getBoardDescriptor,
  getAllBoardDescriptors,
  getBoardIds,
  findBoardByName,
  BOARD_DESCRIPTORS,
  ESP32_BOARD,
  DEFAULT_CONFIG,
  toYAML,
  fromYAML,
  // Steps/MM Calculator functions
  calculateStepsPerMM,
  calculateStepsPerMM_Belt,
  calculateStepsPerMM_Leadscrew,
  calculateStepsPerMM_RackPinion,
  // Validation functions
  validateStepsPerMMConsistency,
  validateFeedRateCapability,
  validateAccelerationLimits,
  validateHomingRates,
  validateAxisConfiguration,
  AxisValidationContext,
  // Diff functions
  diffConfigurations,
  formatValue,
  formatPath,
  // Pin utilities
  extractGpioNumber,
  extractAllPinAssignments,
  getPinStatus,
  getPinConflicts,
  isValidPinAssignment,
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

// =============================================================================
// Steps/MM Calculator Tests
// =============================================================================

describe('Steps/MM Calculator', () => {
  describe('calculateStepsPerMM_Belt', () => {
    it('should calculate steps/mm for GT2 belt drive with default parameters', () => {
      const result = calculateStepsPerMM_Belt({
        motor_steps_per_rev: 200,
        microsteps: 16,
        drive_pulley_teeth: 20,
        belt_pitch_mm: 2,
      });
      
      // Expected: (200 * 16) / (20 * 2) = 3200 / 40 = 80 steps/mm
      expect(result).toBe(80);
    });

    it('should calculate steps/mm for GT3 belt drive', () => {
      const result = calculateStepsPerMM_Belt({
        motor_steps_per_rev: 200,
        microsteps: 32,
        drive_pulley_teeth: 20,
        belt_pitch_mm: 3,
      });
      
      // Expected: (200 * 32) / (20 * 3) = 6400 / 60 = 106.67 steps/mm
      expect(result).toBeCloseTo(106.67, 2);
    });

    it('should handle gear reduction', () => {
      const result = calculateStepsPerMM_Belt({
        motor_steps_per_rev: 200,
        microsteps: 16,
        drive_pulley_teeth: 20,
        belt_pitch_mm: 2,
        gear_ratio: 2,
      });
      
      // Expected: (200 * 16 * 2) / (20 * 2) = 6400 / 40 = 160 steps/mm
      expect(result).toBe(160);
    });

    it('should handle pulley ratio', () => {
      const result = calculateStepsPerMM_Belt({
        motor_steps_per_rev: 200,
        microsteps: 16,
        drive_pulley_teeth: 20,
        driven_pulley_teeth: 40,
        belt_pitch_mm: 2,
      });
      
      // Expected: (200 * 16) * (20/40) / (20 * 2) = 3200 * 0.5 / 40 = 40 steps/mm
      // Larger driven pulley means less steps per mm
      expect(result).toBe(40);
    });
  });

  describe('calculateStepsPerMM_Leadscrew', () => {
    it('should calculate steps/mm for 8mm leadscrew', () => {
      const result = calculateStepsPerMM_Leadscrew({
        motor_steps_per_rev: 200,
        microsteps: 16,
        leadscrew_pitch_mm: 8,
      });
      
      // Expected: (200 * 16) / 8 = 3200 / 8 = 400 steps/mm
      expect(result).toBe(400);
    });

    it('should calculate steps/mm for 2mm leadscrew', () => {
      const result = calculateStepsPerMM_Leadscrew({
        motor_steps_per_rev: 200,
        microsteps: 32,
        leadscrew_pitch_mm: 2,
      });
      
      // Expected: (200 * 32) / 2 = 6400 / 2 = 3200 steps/mm
      expect(result).toBe(3200);
    });

    it('should handle gear reduction with leadscrew', () => {
      const result = calculateStepsPerMM_Leadscrew({
        motor_steps_per_rev: 200,
        microsteps: 16,
        leadscrew_pitch_mm: 8,
        gear_ratio: 3,
      });
      
      // Expected: (200 * 16 * 3) / 8 = 9600 / 8 = 1200 steps/mm
      expect(result).toBe(1200);
    });
  });

  describe('calculateStepsPerMM_RackPinion', () => {
    it('should calculate steps/mm for rack and pinion', () => {
      const result = calculateStepsPerMM_RackPinion({
        motor_steps_per_rev: 200,
        microsteps: 16,
        pinion_teeth: 20,
        rack_pitch_mm: 2,
      });
      
      // Expected: (200 * 16) / (20 * 2) = 3200 / 40 = 80 steps/mm
      expect(result).toBe(80);
    });

    it('should handle different pinion sizes', () => {
      const result = calculateStepsPerMM_RackPinion({
        motor_steps_per_rev: 200,
        microsteps: 16,
        pinion_teeth: 16,
        rack_pitch_mm: 2,
      });
      
      // Expected: (200 * 16) / (16 * 2) = 3200 / 32 = 100 steps/mm
      expect(result).toBe(100);
    });
  });

  describe('calculateStepsPerMM (auto-detect)', () => {
    it('should detect leadscrew drive', () => {
      const result = calculateStepsPerMM({
        leadscrew_pitch_mm: 8,
        microsteps: 16,
      });
      
      expect(result).toBe(400); // Same as leadscrew calculation
    });

    it('should detect rack and pinion drive', () => {
      const result = calculateStepsPerMM({
        pinion_teeth: 20,
        rack_pitch_mm: 2,
        microsteps: 16,
      });
      
      expect(result).toBe(80); // Same as rack/pinion calculation
    });

    it('should detect belt drive', () => {
      const result = calculateStepsPerMM({
        drive_pulley_teeth: 20,
        belt_pitch_mm: 2,
        microsteps: 16,
      });
      
      expect(result).toBe(80); // Same as belt calculation
    });

    it('should default to belt drive when unclear', () => {
      const result = calculateStepsPerMM({
        microsteps: 16,
      });
      
      // Should use default belt parameters
      expect(result).toBe(80);
    });
  });
});

// =============================================================================
// Cross-field Validation Tests
// =============================================================================

describe('Cross-field Validation', () => {
  describe('validateStepsPerMMConsistency', () => {
    it('should pass validation for reasonable steps/mm', () => {
      const context: AxisValidationContext = {
        axis: { steps_per_mm: 80 },
        tmcConfig: { microsteps: 16 },
      };
      
      const result = validateStepsPerMMConsistency(context);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for unreasonably high steps/mm', () => {
      const context: AxisValidationContext = {
        axis: { steps_per_mm: 100000 },
        tmcConfig: { microsteps: 16 },
      };
      
      const result = validateStepsPerMMConsistency(context);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('appears inconsistent');
    });

    it('should fail validation for unreasonably low steps/mm', () => {
      const context: AxisValidationContext = {
        axis: { steps_per_mm: 0.1 },
        tmcConfig: { microsteps: 16 },
      };
      
      const result = validateStepsPerMMConsistency(context);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('appears inconsistent');
    });

    it('should pass validation when data is missing', () => {
      const context: AxisValidationContext = {
        axis: {},
      };
      
      const result = validateStepsPerMMConsistency(context);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateFeedRateCapability', () => {
    it('should pass validation for achievable feed rates', () => {
      const context: AxisValidationContext = {
        axis: { 
          steps_per_mm: 80,
          max_rate_mm_per_min: 6000, // 8000 steps/sec
        },
        tmcConfig: { microsteps: 16 },
      };
      
      const result = validateFeedRateCapability(context);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for excessively high feed rates', () => {
      const context: AxisValidationContext = {
        axis: { 
          steps_per_mm: 400,
          max_rate_mm_per_min: 30000, // 200,000 steps/sec - way too high
        },
        tmcConfig: { microsteps: 16 },
      };
      
      const result = validateFeedRateCapability(context);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exceeds typical stepper limit');
    });

    it('should pass validation when data is missing', () => {
      const context: AxisValidationContext = {
        axis: { steps_per_mm: 80 },
      };
      
      const result = validateFeedRateCapability(context);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAccelerationLimits', () => {
    it('should pass validation for reasonable acceleration', () => {
      const context: AxisValidationContext = {
        axis: { 
          steps_per_mm: 80,
          acceleration_mm_per_sec2: 100, // 8000 steps/sec²
        },
      };
      
      const result = validateAccelerationLimits(context);
      expect(result.valid).toBe(true);
    });

    it('should fail validation for excessive acceleration', () => {
      const context: AxisValidationContext = {
        axis: { 
          steps_per_mm: 400,
          acceleration_mm_per_sec2: 1000, // 400,000 steps/sec² - too high
        },
      };
      
      const result = validateAccelerationLimits(context);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('may be too high');
    });
  });

  describe('validateHomingRates', () => {
    it('should pass validation for reasonable homing rates', () => {
      const context: AxisValidationContext = {
        axis: { 
          max_rate_mm_per_min: 6000,
          homing: {
            feed_mm_per_min: 1000,
            seek_mm_per_min: 3000,
          },
        },
      };
      
      const result = validateHomingRates(context);
      expect(result.valid).toBe(true);
    });

    it('should fail validation when homing feed exceeds max rate', () => {
      const context: AxisValidationContext = {
        axis: { 
          max_rate_mm_per_min: 6000,
          homing: {
            feed_mm_per_min: 8000, // Exceeds max rate
          },
        },
      };
      
      const result = validateHomingRates(context);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exceeds axis max_rate_mm_per_min');
    });

    it('should fail validation when homing seek exceeds max rate', () => {
      const context: AxisValidationContext = {
        axis: { 
          max_rate_mm_per_min: 6000,
          homing: {
            seek_mm_per_min: 8000, // Exceeds max rate
          },
        },
      };
      
      const result = validateHomingRates(context);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exceeds axis max_rate_mm_per_min');
    });
  });

  describe('validateAxisConfiguration', () => {
    it('should pass comprehensive validation for good config', () => {
      const context: AxisValidationContext = {
        axis: { 
          steps_per_mm: 80,
          max_rate_mm_per_min: 6000,
          acceleration_mm_per_sec2: 100,
          homing: {
            feed_mm_per_min: 1000,
            seek_mm_per_min: 3000,
          },
        },
        tmcConfig: { microsteps: 16 },
      };
      
      const result = validateAxisConfiguration(context);
      expect(result.valid).toBe(true);
      expect(result.messages).toHaveLength(0);
    });

    it('should fail comprehensive validation with multiple issues', () => {
      const context: AxisValidationContext = {
        axis: { 
          steps_per_mm: 100000, // Too high
          max_rate_mm_per_min: 6000,
          acceleration_mm_per_sec2: 10000, // Too high
          homing: {
            feed_mm_per_min: 8000, // Exceeds max rate
          },
        },
        tmcConfig: { microsteps: 16 },
      };
      
      const result = validateAxisConfiguration(context);
      expect(result.valid).toBe(false);
      expect(result.messages.length).toBeGreaterThan(0);
    });
  });

  describe('validateAxisConfigWithContext', () => {
    it('should pass validation for complete valid configuration', () => {
      const axisConfig = {
        steps_per_mm: 80,
        max_rate_mm_per_min: 6000,
        acceleration_mm_per_sec2: 100,
        homing: {
          feed_mm_per_min: 1000,
          seek_mm_per_min: 3000,
          cycle: 1,
        },
      };
      
      const motorConfig = {
        step_pin: 'gpio.1',
        direction_pin: 'gpio.2',
        tmc_2130: {
          microsteps: 16,
          run_amps: 1.0,
        },
      };
      
      const result = validateAxisConfigWithContext(axisConfig, motorConfig);
      expect(result.success).toBe(true);
      expect(result.validationMessages).toHaveLength(0);
    });

    it('should detect cross-field validation issues', () => {
      const axisConfig = {
        steps_per_mm: 100000, // Unreasonable value
        max_rate_mm_per_min: 6000,
        homing: {
          feed_mm_per_min: 8000, // Exceeds max rate
        },
      };
      
      const tmcConfig = {
        microsteps: 16,
      };
      
      const result = validateAxisConfigWithContext(axisConfig, undefined, tmcConfig);
      expect(result.success).toBe(false);
      expect(result.validationMessages?.length).toBeGreaterThan(0);
    });

    it('should handle schema validation failures', () => {
      const invalidAxisConfig = {
        steps_per_mm: -80, // Negative value should fail schema validation
      };
      
      const result = validateAxisConfigWithContext(invalidAxisConfig);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});

// =============================================================================
// Configuration Diff Tests
// =============================================================================

describe('Configuration Diff', () => {
  describe('diffConfigurations', () => {
    it('should detect no differences for identical configurations', () => {
      const config1 = {
        name: 'Test Machine',
        board: 'ESP32',
        axes: {
          x: {
            steps_per_mm: 80,
          },
        },
      };
      
      const config2 = { ...config1 };
      const diffs = diffConfigurations(config1, config2);
      
      expect(diffs).toHaveLength(0);
    });

    it('should detect value changes', () => {
      const oldConfig = {
        name: 'Test Machine',
        board: 'ESP32',
        axes: {
          x: {
            steps_per_mm: 80,
          },
        },
      };
      
      const newConfig = {
        ...oldConfig,
        name: 'Updated Machine',
      };
      
      const diffs = diffConfigurations(oldConfig, newConfig);
      
      expect(diffs).toHaveLength(1);
      expect(diffs[0]).toEqual({
        path: ['name'],
        type: 'changed',
        oldValue: 'Test Machine',
        newValue: 'Updated Machine',
      });
    });

    it('should detect added properties', () => {
      const oldConfig = {
        name: 'Test Machine',
      };
      
      const newConfig = {
        name: 'Test Machine',
        board: 'ESP32',
        axes: {
          x: {
            steps_per_mm: 80,
          },
        },
      };
      
      const diffs = diffConfigurations(oldConfig, newConfig);
      
      expect(diffs).toHaveLength(2);
      expect(diffs).toContainEqual({
        path: ['board'],
        type: 'added',
        newValue: 'ESP32',
      });
      expect(diffs).toContainEqual({
        path: ['axes'],
        type: 'added',
        newValue: {
          x: {
            steps_per_mm: 80,
          },
        },
      });
    });

    it('should detect removed properties', () => {
      const oldConfig = {
        name: 'Test Machine',
        board: 'ESP32',
        version: '3.7',
      };
      
      const newConfig = {
        name: 'Test Machine',
      };
      
      const diffs = diffConfigurations(oldConfig, newConfig);
      
      expect(diffs).toHaveLength(2);
      expect(diffs).toContainEqual({
        path: ['board'],
        type: 'removed',
        oldValue: 'ESP32',
      });
      expect(diffs).toContainEqual({
        path: ['version'],
        type: 'removed',
        oldValue: '3.7',
      });
    });

    it('should detect nested changes', () => {
      const oldConfig = {
        name: 'Test Machine',
        axes: {
          x: {
            steps_per_mm: 80,
            max_rate_mm_per_min: 5000,
          },
          y: {
            steps_per_mm: 80,
          },
        },
      };
      
      const newConfig = {
        name: 'Test Machine',
        axes: {
          x: {
            steps_per_mm: 100, // Changed
            max_rate_mm_per_min: 5000,
            acceleration_mm_per_sec2: 200, // Added
          },
          y: {
            steps_per_mm: 80,
          },
        },
      };
      
      const diffs = diffConfigurations(oldConfig, newConfig);
      
      expect(diffs).toHaveLength(2);
      expect(diffs).toContainEqual({
        path: ['axes', 'x', 'steps_per_mm'],
        type: 'changed',
        oldValue: 80,
        newValue: 100,
      });
      expect(diffs).toContainEqual({
        path: ['axes', 'x', 'acceleration_mm_per_sec2'],
        type: 'added',
        newValue: 200,
      });
    });

    it('should handle array differences', () => {
      const oldConfig = {
        homing: {
          cycle: [1, 2],
        },
      };
      
      const newConfig = {
        homing: {
          cycle: [1, 2, 3],
        },
      };
      
      const diffs = diffConfigurations(oldConfig, newConfig);
      
      expect(diffs).toHaveLength(1);
      expect(diffs[0]).toEqual({
        path: ['homing', 'cycle', '2'],
        type: 'added',
        newValue: 3,
      });
    });

    it('should handle null and undefined values', () => {
      const oldConfig = {
        name: 'Test',
        board: 'ESP32',
        version: '3.7',
      };
      
      const newConfig = {
        name: 'Test',
        // board property is removed
        // version property is removed
      };
      
      const diffs = diffConfigurations(oldConfig, newConfig);
      
      expect(diffs).toHaveLength(2);
      expect(diffs).toContainEqual({
        path: ['board'],
        type: 'removed',
        oldValue: 'ESP32',
      });
      expect(diffs).toContainEqual({
        path: ['version'],
        type: 'removed',
        oldValue: '3.7',
      });
    });

    it('should be stable across minor rearrangements', () => {
      // This test ensures AST-aware diffing by checking that
      // equivalent configurations with different object key orders
      // produce no differences
      
      const config1 = {
        name: 'Test Machine',
        axes: {
          x: { steps_per_mm: 80, max_rate_mm_per_min: 5000 },
          y: { steps_per_mm: 80, max_rate_mm_per_min: 5000 },
        },
        board: 'ESP32',
      };
      
      const config2 = {
        board: 'ESP32',
        name: 'Test Machine',
        axes: {
          y: { max_rate_mm_per_min: 5000, steps_per_mm: 80 },
          x: { max_rate_mm_per_min: 5000, steps_per_mm: 80 },
        },
      };
      
      const diffs = diffConfigurations(config1, config2);
      expect(diffs).toHaveLength(0);
    });
  });

  describe('formatValue', () => {
    it('should format primitive values correctly', () => {
      expect(formatValue('string')).toBe('"string"');
      expect(formatValue(42)).toBe('42');
      expect(formatValue(true)).toBe('true');
      expect(formatValue(null)).toBe('null');
      expect(formatValue(undefined)).toBe('undefined');
    });

    it('should format arrays correctly', () => {
      expect(formatValue([1, 2, 3])).toBe('[1, 2, 3]');
      expect(formatValue(['a', 'b'])).toBe('["a", "b"]');
    });

    it('should format objects correctly', () => {
      const obj = { name: 'test', value: 42 };
      const formatted = formatValue(obj);
      expect(formatted).toContain('"name": "test"');
      expect(formatted).toContain('"value": 42');
    });
  });

  describe('formatPath', () => {
    it('should format empty path as root', () => {
      expect(formatPath([])).toBe('(root)');
    });

    it('should format path as dot-separated string', () => {
      expect(formatPath(['axes', 'x', 'steps_per_mm'])).toBe('axes.x.steps_per_mm');
    });

    it('should handle array indices', () => {
      expect(formatPath(['homing', 'cycle', '0'])).toBe('homing.cycle.0');
    });
  });
});

describe('Board Descriptor Tests', () => {
  describe('PinCapabilitySchema', () => {
    it('should validate valid pin capability', () => {
      const validCapability = {
        digital: true,
        input: true,
        output: true,
        pwm: true,
        analog: false,
        notes: 'General purpose pin',
      };

      const result = PinCapabilitySchema.safeParse(validCapability);
      expect(result.success).toBe(true);
    });

    it('should allow empty capability object', () => {
      const result = PinCapabilitySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('BoardPinSchema', () => {
    it('should validate valid board pin', () => {
      const validPin = {
        name: 'GPIO2',
        gpio: 2,
        capabilities: {
          digital: true,
          input: true,
          output: true,
          pwm: true,
        },
      };

      const result = BoardPinSchema.safeParse(validPin);
      expect(result.success).toBe(true);
    });

    it('should require name and gpio', () => {
      const invalidPin = {
        capabilities: {
          digital: true,
        },
      };

      const result = BoardPinSchema.safeParse(invalidPin);
      expect(result.success).toBe(false);
    });

    it('should reject negative gpio numbers', () => {
      const invalidPin = {
        name: 'GPIO-1',
        gpio: -1,
        capabilities: {},
      };

      const result = BoardPinSchema.safeParse(invalidPin);
      expect(result.success).toBe(false);
    });
  });

  describe('BoardCapabilitiesSchema', () => {
    it('should validate complete board capabilities', () => {
      const validCapabilities = {
        uart_channels: 3,
        spi_channels: 4,
        i2c_channels: 2,
        adc_channels: 18,
        pwm_channels: 16,
        flash_size: '4MB',
        ram_size: '520KB',
        cpu_frequency: '240MHz',
        wifi: true,
        bluetooth: true,
        ethernet: false,
        notes: 'ESP32 capabilities',
      };

      const result = BoardCapabilitiesSchema.safeParse(validCapabilities);
      expect(result.success).toBe(true);
    });

    it('should allow empty capabilities', () => {
      const result = BoardCapabilitiesSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject negative channel counts', () => {
      const invalidCapabilities = {
        uart_channels: -1,
      };

      const result = BoardCapabilitiesSchema.safeParse(invalidCapabilities);
      expect(result.success).toBe(false);
    });
  });

  describe('BoardDescriptorSchema', () => {
    it('should validate complete board descriptor', () => {
      const validDescriptor = {
        id: 'esp32',
        name: 'ESP32',
        description: 'ESP32 development board',
        pins: [
          {
            name: 'GPIO2',
            gpio: 2,
            capabilities: {
              digital: true,
              input: true,
              output: true,
              pwm: true,
            },
          },
        ],
        capabilities: {
          uart_channels: 3,
          wifi: true,
        },
        notes: 'A versatile development board',
        version: '1.0',
        manufacturer: 'Espressif',
      };

      const result = BoardDescriptorSchema.safeParse(validDescriptor);
      expect(result.success).toBe(true);
    });

    it('should require id, name, pins, and capabilities', () => {
      const invalidDescriptor = {
        name: 'ESP32',
      };

      const result = BoardDescriptorSchema.safeParse(invalidDescriptor);
      expect(result.success).toBe(false);
    });
  });

  describe('validateBoardDescriptor', () => {
    it('should return success for valid descriptor', () => {
      const validDescriptor = {
        id: 'test-board',
        name: 'Test Board',
        pins: [],
        capabilities: {},
      };

      const result = validateBoardDescriptor(validDescriptor);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test-board');
        expect(result.data.name).toBe('Test Board');
      }
    });

    it('should return error for invalid descriptor', () => {
      const invalidDescriptor = {
        id: 'test-board',
        // Missing required fields
      };

      const result = validateBoardDescriptor(invalidDescriptor);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('loadBoardDescriptor', () => {
    it('should load valid JSON board descriptor', () => {
      const jsonString = JSON.stringify({
        id: 'esp32',
        name: 'ESP32',
        pins: [
          {
            name: 'GPIO2',
            gpio: 2,
            capabilities: {
              digital: true,
            },
          },
        ],
        capabilities: {
          uart_channels: 3,
        },
      });

      const result = loadBoardDescriptor(jsonString);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('esp32');
        expect(result.data.name).toBe('ESP32');
        expect(result.data.pins.length).toBe(1);
      }
    });

    it('should handle JSON parsing errors', () => {
      const invalidJson = '{ invalid json }';

      const result = loadBoardDescriptor(invalidJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.issues[0].message).toContain('JSON parsing error');
      }
    });

    it('should handle validation errors', () => {
      const jsonString = JSON.stringify({
        id: 'test',
        // Missing required fields
      });

      const result = loadBoardDescriptor(jsonString);
      expect(result.success).toBe(false);
    });
  });

  describe('loadBoardDescriptorFromObject', () => {
    it('should load valid object descriptor', () => {
      const descriptor = {
        id: 'esp32',
        name: 'ESP32',
        pins: [],
        capabilities: {},
      };

      const result = loadBoardDescriptorFromObject(descriptor);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('esp32');
      }
    });
  });

  describe('Sample Board Descriptors', () => {
    it('should validate a sample ESP32-like board descriptor', () => {
      // Test with a sample ESP32-like descriptor
      const sampleDescriptor = {
        id: 'esp32-sample',
        name: 'ESP32 Sample',
        description: 'Sample ESP32 board for testing',
        pins: [
          {
            name: 'GPIO2',
            gpio: 2,
            capabilities: {
              digital: true,
              input: true,
              output: true,
              pwm: true,
              pullup: true,
              pulldown: true,
              notes: 'General purpose pin',
            },
          },
          {
            name: 'GPIO4',
            gpio: 4,
            capabilities: {
              digital: true,
              input: true,
              output: true,
              pwm: true,
              analog: true,
              notes: 'ADC capable pin',
            },
          },
        ],
        capabilities: {
          uart_channels: 3,
          spi_channels: 4,
          i2c_channels: 2,
          adc_channels: 18,
          pwm_channels: 16,
          flash_size: '4MB',
          ram_size: '520KB',
          wifi: true,
          bluetooth: true,
        },
        notes: 'Sample ESP32 board descriptor for testing',
        version: '1.0',
        manufacturer: 'Test Manufacturer',
      };
      
      const result = validateBoardDescriptor(sampleDescriptor);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('esp32-sample');
        expect(result.data.name).toBe('ESP32 Sample');
        expect(result.data.pins.length).toBe(2);
        expect(result.data.capabilities.wifi).toBe(true);
        expect(result.data.capabilities.uart_channels).toBe(3);
      }
    });
  });

  describe('Board Utility Functions', () => {
    it('should get board descriptor by id', () => {
      const esp32 = getBoardDescriptor('esp32');
      expect(esp32).toBeDefined();
      expect(esp32?.id).toBe('esp32');
      expect(esp32?.name).toBe('ESP32');
    });

    it('should return undefined for non-existent board', () => {
      const nonExistent = getBoardDescriptor('non-existent');
      expect(nonExistent).toBeUndefined();
    });

    it('should get all board descriptors', () => {
      const allBoards = getAllBoardDescriptors();
      expect(allBoards.length).toBeGreaterThan(0);
      expect(allBoards.some(board => board.id === 'esp32')).toBe(true);
    });

    it('should get all board IDs', () => {
      const boardIds = getBoardIds();
      expect(boardIds).toContain('esp32');
      expect(boardIds).toContain('esp32-s2');
      expect(boardIds).toContain('esp32-s3');
      expect(boardIds).toContain('esp32-c3');
    });

    it('should find board by name', () => {
      const esp32 = findBoardByName('ESP32');
      expect(esp32).toBeDefined();
      expect(esp32?.id).toBe('esp32');

      // Case insensitive search
      const esp32Lower = findBoardByName('esp32');
      expect(esp32Lower).toBeDefined();
      expect(esp32Lower?.id).toBe('esp32');
    });

    it('should return undefined for non-existent board name', () => {
      const nonExistent = findBoardByName('Non-existent Board');
      expect(nonExistent).toBeUndefined();
    });

    it('should validate ESP32 board descriptor from constants', () => {
      expect(ESP32_BOARD.id).toBe('esp32');
      expect(ESP32_BOARD.name).toBe('ESP32');
      expect(ESP32_BOARD.capabilities.wifi).toBe(true);
      expect(ESP32_BOARD.pins.length).toBeGreaterThan(0);
    });

    it('should have all expected boards in BOARD_DESCRIPTORS', () => {
      expect(BOARD_DESCRIPTORS['esp32']).toBeDefined();
      expect(BOARD_DESCRIPTORS['esp32-s2']).toBeDefined();
      expect(BOARD_DESCRIPTORS['esp32-s3']).toBeDefined();
      expect(BOARD_DESCRIPTORS['esp32-c3']).toBeDefined();
      expect(BOARD_DESCRIPTORS['bdring-6x']).toBeDefined();
      expect(BOARD_DESCRIPTORS['v1-jackpot']).toBeDefined();
      expect(BOARD_DESCRIPTORS['pibot-49b-plus']).toBeDefined();
    });

    it('should have correct number of boards available', () => {
      const boardIds = getBoardIds();
      expect(boardIds).toHaveLength(7); // 4 ESP32 variants + 3 CNC controller boards
      
      const allBoards = getAllBoardDescriptors();
      expect(allBoards).toHaveLength(7);
    });

    it('should find new CNC boards by name', () => {
      expect(findBoardByName('BDRing 6-Pack TMC2209')).toBeDefined();
      expect(findBoardByName('V1 Engineering Jackpot')).toBeDefined();
      expect(findBoardByName('PiBot 4.9b Plus')).toBeDefined();
    });
  });
});

// =============================================================================
// Pin Utilities Tests
// =============================================================================

describe('Pin Utilities', () => {
  describe('extractGpioNumber', () => {
    it('should extract GPIO number from valid gpio pin strings', () => {
      expect(extractGpioNumber('gpio.25')).toBe(25);
      expect(extractGpioNumber('GPIO.2')).toBe(2);
      expect(extractGpioNumber('gpio.0')).toBe(0);
    });

    it('should return null for invalid pin strings', () => {
      expect(extractGpioNumber('i2so.25')).toBeNull();
      expect(extractGpioNumber('invalid')).toBeNull();
      expect(extractGpioNumber('gpio.abc')).toBeNull();
      expect(extractGpioNumber('')).toBeNull();
    });
  });

  describe('extractAllPinAssignments', () => {
    it('should extract pin assignments from IO configuration', () => {
      const config: any = {
        name: 'Test',
        board: 'ESP32',
        io: {
          probe_pin: 'gpio.25',
          flood_pin: 'gpio.26',
          macro0_pin: 'gpio.27'
        }
      };

      const assignments = extractAllPinAssignments(config);
      
      expect(assignments['gpio.25']).toEqual(['io.probe_pin']);
      expect(assignments['gpio.26']).toEqual(['io.flood_pin']);
      expect(assignments['gpio.27']).toEqual(['io.macro0_pin']);
    });

    it('should extract pin assignments from motor configuration', () => {
      const config: any = {
        name: 'Test',
        board: 'ESP32',
        axes: {
          x: {
            steps_per_mm: 80,
            motor0: {
              step_pin: 'gpio.1',
              direction_pin: 'gpio.2',
              disable_pin: 'gpio.3'
            }
          }
        }
      };

      const assignments = extractAllPinAssignments(config);
      
      expect(assignments['gpio.1']).toEqual(['axes.x.motor0.step_pin']);
      expect(assignments['gpio.2']).toEqual(['axes.x.motor0.direction_pin']);
      expect(assignments['gpio.3']).toEqual(['axes.x.motor0.disable_pin']);
    });

    it('should detect pin conflicts', () => {
      const config: any = {
        name: 'Test',
        board: 'ESP32',
        io: {
          probe_pin: 'gpio.25'
        },
        axes: {
          x: {
            steps_per_mm: 80,
            motor0: {
              step_pin: 'gpio.25', // Conflict with probe_pin
              direction_pin: 'gpio.2'
            }
          }
        }
      };

      const assignments = extractAllPinAssignments(config);
      
      expect(assignments['gpio.25']).toEqual(['io.probe_pin', 'axes.x.motor0.step_pin']);
    });
  });

  describe('getPinStatus', () => {
    it('should validate pin format', () => {
      const config: any = { name: 'Test', board: 'ESP32' };
      
      const validStatus = getPinStatus('gpio.25', config);
      expect(validStatus.isValid).toBe(true);
      expect(validStatus.errors).toEqual([]);

      const invalidStatus = getPinStatus('invalid.pin', config);
      expect(invalidStatus.isValid).toBe(false);
      expect(invalidStatus.errors[0]).toMatch(/Invalid pin format/);
    });

    it('should detect pin usage', () => {
      const config: any = {
        name: 'Test',
        board: 'ESP32',
        io: {
          probe_pin: 'gpio.25'
        }
      };

      const status = getPinStatus('gpio.25', config);
      expect(status.isUsed).toBe(true);
      expect(status.usedBy).toEqual(['io.probe_pin']);
    });

    it('should detect pin conflicts', () => {
      const config: any = {
        name: 'Test',
        board: 'ESP32',
        io: {
          probe_pin: 'gpio.25'
        },
        axes: {
          x: {
            steps_per_mm: 80,
            motor0: {
              step_pin: 'gpio.25',
              direction_pin: 'gpio.2'
            }
          }
        }
      };

      const status = getPinStatus('gpio.25', config);
      expect(status.isValid).toBe(false);
      expect(status.usedBy).toEqual(['io.probe_pin', 'axes.x.motor0.step_pin']);
      expect(status.errors[0]).toMatch(/Pin conflict/);
    });
  });

  describe('getPinConflicts', () => {
    it('should return empty object when no conflicts', () => {
      const config: any = {
        name: 'Test',
        board: 'ESP32',
        io: {
          probe_pin: 'gpio.25',
          flood_pin: 'gpio.26'
        }
      };

      const conflicts = getPinConflicts(config);
      expect(Object.keys(conflicts)).toHaveLength(0);
    });

    it('should detect all pin conflicts', () => {
      const config: any = {
        name: 'Test',
        board: 'ESP32',
        io: {
          probe_pin: 'gpio.25',
          flood_pin: 'gpio.26'
        },
        axes: {
          x: {
            steps_per_mm: 80,
            motor0: {
              step_pin: 'gpio.25', // Conflict with probe_pin
              direction_pin: 'gpio.26' // Conflict with flood_pin
            }
          }
        }
      };

      const conflicts = getPinConflicts(config);
      expect(conflicts['gpio.25']).toEqual(['io.probe_pin', 'axes.x.motor0.step_pin']);
      expect(conflicts['gpio.26']).toEqual(['io.flood_pin', 'axes.x.motor0.direction_pin']);
    });
  });
});