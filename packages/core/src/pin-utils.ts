import type { FluidNCConfig, BoardDescriptor } from './index';

/**
 * Represents the status of a pin assignment
 */
export interface PinStatus {
  pin: string;
  isValid: boolean;
  isUsed: boolean;
  usedBy: string[];
  boardPin?: {
    name: string;
    gpio: number;
    capabilities: any;
  };
  errors: string[];
}

/**
 * Extract GPIO number from pin string (e.g., "gpio.25" -> 25)
 */
export function extractGpioNumber(pin: string): number | null {
  const match = pin.match(/^gpio\.(\d+)$/i);
  return match && match[1] ? parseInt(match[1], 10) : null;
}

/**
 * Extract all pin assignments from a FluidNC configuration
 */
export function extractAllPinAssignments(config: FluidNCConfig): Record<string, string[]> {
  const assignments: Record<string, string[]> = {};

  // Helper to add pin assignment
  const addPin = (pin: string | undefined, source: string) => {
    if (pin && typeof pin === 'string' && pin.trim()) {
      if (!assignments[pin]) {
        assignments[pin] = [];
      }
      assignments[pin].push(source);
    }
  };

  // Extract IO pins
  if (config.io) {
    addPin(config.io.probe_pin, 'io.probe_pin');
    addPin(config.io.flood_pin, 'io.flood_pin');
    addPin(config.io.mist_pin, 'io.mist_pin');
    addPin(config.io.macro0_pin, 'io.macro0_pin');
    addPin(config.io.macro1_pin, 'io.macro1_pin');
    addPin(config.io.macro2_pin, 'io.macro2_pin');
    addPin(config.io.macro3_pin, 'io.macro3_pin');
    // User digital outputs
    addPin(config.io.user_output_0_pin, 'io.user_output_0_pin');
    addPin(config.io.user_output_1_pin, 'io.user_output_1_pin');
    addPin(config.io.user_output_2_pin, 'io.user_output_2_pin');
    addPin(config.io.user_output_3_pin, 'io.user_output_3_pin');
    // User PWM outputs
    addPin(config.io.user_pwm_0_pin, 'io.user_pwm_0_pin');
    addPin(config.io.user_pwm_1_pin, 'io.user_pwm_1_pin');
    addPin(config.io.user_pwm_2_pin, 'io.user_pwm_2_pin');
    addPin(config.io.user_pwm_3_pin, 'io.user_pwm_3_pin');
  }

  // Extract motor pins
  if (config.axes) {
    Object.entries(config.axes).forEach(([axisName, axisConfig]) => {
      if (axisConfig.motor0) {
        const motor = axisConfig.motor0;
        addPin(motor.step_pin, `axes.${axisName}.motor0.step_pin`);
        addPin(motor.direction_pin, `axes.${axisName}.motor0.direction_pin`);
        addPin(motor.disable_pin, `axes.${axisName}.motor0.disable_pin`);
        addPin(motor.limit_neg_pin, `axes.${axisName}.motor0.limit_neg_pin`);
        addPin(motor.limit_pos_pin, `axes.${axisName}.motor0.limit_pos_pin`);
        addPin(motor.limit_all_pin, `axes.${axisName}.motor0.limit_all_pin`);
        
        // TMC driver pins
        if (motor.tmc_2130) {
          addPin(motor.tmc_2130.cs_pin, `axes.${axisName}.motor0.tmc_2130.cs_pin`);
        }
        if (motor.tmc_2209) {
          // TMC2209 may have uart_pin in some configurations
          const tmc2209 = motor.tmc_2209 as any;
          if (tmc2209.uart_pin) {
            addPin(tmc2209.uart_pin, `axes.${axisName}.motor0.tmc_2209.uart_pin`);
          }
        }
      }
    });
  }

  // Extract spindle pins
  if (config.spindle) {
    addPin(config.spindle.output_pin, 'spindle.output_pin');
    addPin(config.spindle.enable_pin, 'spindle.enable_pin');
    addPin(config.spindle.direction_pin, 'spindle.direction_pin');
  }

  // Extract control pins
  if (config.control) {
    addPin(config.control.safety_door_pin, 'control.safety_door_pin');
    addPin(config.control.reset_pin, 'control.reset_pin');
    addPin(config.control.feed_hold_pin, 'control.feed_hold_pin');
    addPin(config.control.cycle_start_pin, 'control.cycle_start_pin');
    addPin(config.control.fro_pin, 'control.fro_pin');
    addPin(config.control.sro_pin, 'control.sro_pin');
  }

  // Extract UART pins
  if (config.uart) {
    Object.entries(config.uart).forEach(([channelName, channelConfig]) => {
      if (channelConfig && typeof channelConfig === 'object') {
        const uart = channelConfig as any;
        if (typeof uart.txd_pin === 'string') {
          addPin(uart.txd_pin, `uart.${channelName}.txd_pin`);
        }
        if (typeof uart.rxd_pin === 'string') {
          addPin(uart.rxd_pin, `uart.${channelName}.rxd_pin`);
        }
        if (typeof uart.rts_pin === 'string') {
          addPin(uart.rts_pin, `uart.${channelName}.rts_pin`);
        }
      }
    });
  }

  return assignments;
}

/**
 * Get pin status for a specific pin
 */
export function getPinStatus(
  pin: string,
  config: FluidNCConfig,
  boardDescriptor?: BoardDescriptor
): PinStatus {
  const status: PinStatus = {
    pin,
    isValid: false,
    isUsed: false,
    usedBy: [],
    errors: []
  };

  // Check basic format
  const gpioNumber = extractGpioNumber(pin);
  if (gpioNumber === null) {
    if (!pin.match(/^i2so\.\d+$/i) && !pin.match(/^i2si\.\d+$/i)) {
      status.errors.push('Invalid pin format. Use gpio.XX, i2so.XX, or i2si.XX');
      return status;
    }
  }

  // Check against board descriptor if available
  if (boardDescriptor && gpioNumber !== null) {
    const boardPin = boardDescriptor.pins.find(p => p.gpio === gpioNumber);
    if (!boardPin) {
      status.errors.push(`GPIO ${gpioNumber} is not available on ${boardDescriptor.name}`);
      return status;
    }
    status.boardPin = boardPin;
  }

  // Check usage across configuration
  const allAssignments = extractAllPinAssignments(config);
  const usedBy = allAssignments[pin] || [];
  
  status.isUsed = usedBy.length > 0;
  status.usedBy = usedBy;
  
  // Check for conflicts (same pin used multiple times)
  if (usedBy.length > 1) {
    status.errors.push(`Pin conflict: used by ${usedBy.join(', ')}`);
  }

  // Pin is valid if no errors
  status.isValid = status.errors.length === 0;

  return status;
}

/**
 * Get all pin conflicts in a configuration
 */
export function getPinConflicts(config: FluidNCConfig): Record<string, string[]> {
  const assignments = extractAllPinAssignments(config);
  const conflicts: Record<string, string[]> = {};

  Object.entries(assignments).forEach(([pin, usedBy]) => {
    if (usedBy.length > 1) {
      conflicts[pin] = usedBy;
    }
  });

  return conflicts;
}

/**
 * Check if a pin assignment would be valid
 */
export function isValidPinAssignment(
  pin: string,
  sourceField: string,
  config: FluidNCConfig,
  boardDescriptor?: BoardDescriptor
): { isValid: boolean; errors: string[] } {
  if (!pin || !pin.trim()) {
    return { isValid: true, errors: [] }; // Empty pins are valid (optional)
  }

  // Create a temporary config with the new assignment to test
  const tempConfig = { ...config };
  
  // We need to temporarily assign the pin to check for conflicts
  // This is a simplified approach - in practice we'd need to update the specific field
  const status = getPinStatus(pin, tempConfig, boardDescriptor);
  
  // Filter out the current source from conflicts to allow updating existing assignments
  const filteredUsedBy = status.usedBy.filter(source => source !== sourceField);
  const hasConflict = filteredUsedBy.length > 0;

  const errors = [...status.errors];
  if (hasConflict) {
    errors.push(`Pin conflict: would conflict with ${filteredUsedBy.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}