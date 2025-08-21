/**
 * Comment templates for FluidNC configuration export
 * Provides helpful context and guidance for various configuration sections
 */

export interface CommentMapping {
  path: string;
  comment: string;
  position: 'above' | 'inline' | 'below';
}

/**
 * Comprehensive comment mappings for FluidNC configuration sections
 */
export const CONFIGURATION_COMMENTS: CommentMapping[] = [
  // Root level configuration
  {
    path: 'name',
    comment: 'Configuration name - helps identify this setup',
    position: 'above'
  },
  {
    path: 'board',
    comment: 'Target board type (ESP32, ESP32-S2, ESP32-S3, etc.)',
    position: 'above'
  },
  {
    path: 'version',
    comment: 'FluidNC firmware version this config is designed for',
    position: 'above'
  },

  // Axes configuration
  {
    path: 'axes',
    comment: 'Axis configuration - defines motion system behavior',
    position: 'above'
  },
  {
    path: 'axes.x',
    comment: 'X-axis configuration (typically horizontal left-right movement)',
    position: 'above'
  },
  {
    path: 'axes.y',
    comment: 'Y-axis configuration (typically horizontal front-back movement)',
    position: 'above'
  },
  {
    path: 'axes.z',
    comment: 'Z-axis configuration (typically vertical up-down movement)',
    position: 'above'
  },
  {
    path: 'axes.a',
    comment: 'A-axis configuration (rotational axis around X)',
    position: 'above'
  },
  {
    path: 'axes.b',
    comment: 'B-axis configuration (rotational axis around Y)',
    position: 'above'
  },
  {
    path: 'axes.c',
    comment: 'C-axis configuration (rotational axis around Z)',
    position: 'above'
  },

  // Motor configuration
  {
    path: 'motor0',
    comment: 'Primary motor driver configuration',
    position: 'above'
  },
  {
    path: 'motor1',
    comment: 'Secondary motor driver configuration (dual motor setup)',
    position: 'above'
  },

  // Motor settings
  {
    path: 'steps_per_mm',
    comment: 'Steps per millimeter - depends on motor, driver microsteps, and mechanical setup',
    position: 'inline'
  },
  {
    path: 'max_rate_mm_per_min',
    comment: 'Maximum speed in mm/min',
    position: 'inline'
  },
  {
    path: 'acceleration_mm_per_sec2',
    comment: 'Acceleration in mm/sec² - start conservative and increase gradually',
    position: 'inline'
  },
  {
    path: 'max_travel_mm',
    comment: 'Maximum travel distance in mm',
    position: 'inline'
  },
  {
    path: 'soft_limits',
    comment: 'Enable software limits (requires homing)',
    position: 'inline'
  },

  // Pin assignments
  {
    path: 'step_pin',
    comment: 'Step pulse pin (e.g., gpio.2)',
    position: 'inline'
  },
  {
    path: 'direction_pin',
    comment: 'Direction control pin (e.g., gpio.5)',
    position: 'inline'
  },
  {
    path: 'disable_pin',
    comment: 'Motor enable/disable pin (e.g., gpio.13)',
    position: 'inline'
  },

  // Homing configuration
  {
    path: 'homing',
    comment: 'Homing behavior configuration',
    position: 'above'
  },
  {
    path: 'homing.cycle',
    comment: 'Homing cycle order (1=first, 2=second, etc.)',
    position: 'inline'
  },
  {
    path: 'homing.positive_direction',
    comment: 'True if homing moves in positive direction',
    position: 'inline'
  },
  {
    path: 'homing.mpos_mm',
    comment: 'Machine position after homing (mm)',
    position: 'inline'
  },
  {
    path: 'homing.feed_mm_per_min',
    comment: 'Homing feed rate (mm/min)',
    position: 'inline'
  },
  {
    path: 'homing.seek_mm_per_min',
    comment: 'Homing seek rate (mm/min) - faster initial approach',
    position: 'inline'
  },

  // TMC driver configuration
  {
    path: 'tmc_2208',
    comment: 'TMC2208 stepper driver configuration',
    position: 'above'
  },
  {
    path: 'tmc_2209',
    comment: 'TMC2209 stepper driver configuration',
    position: 'above'
  },
  {
    path: 'tmc_5160',
    comment: 'TMC5160 stepper driver configuration',
    position: 'above'
  },
  {
    path: 'current_ma',
    comment: 'Motor current in milliamps',
    position: 'inline'
  },
  {
    path: 'microsteps',
    comment: 'Microstepping setting (1, 2, 4, 8, 16, 32, 64, 128, 256)',
    position: 'inline'
  },
  {
    path: 'stealthchop',
    comment: 'Enable StealthChop mode for quieter operation',
    position: 'inline'
  },
  {
    path: 'stallguard',
    comment: 'StallGuard threshold for sensorless homing (0-255)',
    position: 'inline'
  },

  // Spindle configuration
  {
    path: 'spindle',
    comment: 'Spindle/laser control configuration',
    position: 'above'
  },
  {
    path: 'spindle.output_pin',
    comment: 'PWM output pin for spindle speed control',
    position: 'inline'
  },
  {
    path: 'spindle.enable_pin',
    comment: 'Spindle enable/disable pin',
    position: 'inline'
  },
  {
    path: 'spindle.direction_pin',
    comment: 'Spindle direction control pin',
    position: 'inline'
  },
  {
    path: 'spindle.pwm_hz',
    comment: 'PWM frequency in Hz',
    position: 'inline'
  },
  {
    path: 'spindle.off_on_alarm',
    comment: 'Turn off spindle when alarm is triggered',
    position: 'inline'
  },
  {
    path: 'spindle.tool_num',
    comment: 'Tool number for this spindle',
    position: 'inline'
  },
  {
    path: 'spindle.speed_map',
    comment: 'Speed mapping: "rpm1=pwm1% rpm2=pwm2%" format',
    position: 'inline'
  },

  // Probe configuration
  {
    path: 'probe',
    comment: 'Touch probe configuration',
    position: 'above'
  },
  {
    path: 'probe.pin',
    comment: 'Probe input pin',
    position: 'inline'
  },
  {
    path: 'probe.check_mode_start',
    comment: 'Check probe state on startup',
    position: 'inline'
  },

  // Control pins
  {
    path: 'control',
    comment: 'Control input pins (feed hold, cycle start, etc.)',
    position: 'above'
  },
  {
    path: 'control.safety_door_pin',
    comment: 'Safety door input pin',
    position: 'inline'
  },
  {
    path: 'control.reset_pin',
    comment: 'Reset button input pin',
    position: 'inline'
  },
  {
    path: 'control.feed_hold_pin',
    comment: 'Feed hold button input pin',
    position: 'inline'
  },
  {
    path: 'control.cycle_start_pin',
    comment: 'Cycle start button input pin',
    position: 'inline'
  },

  // User outputs
  {
    path: 'user_outputs',
    comment: 'Custom output pins for accessories',
    position: 'above'
  },

  // UART configuration
  {
    path: 'uart',
    comment: 'UART communication configuration',
    position: 'above'
  },
  {
    path: 'uart.uart0',
    comment: 'UART channel 0 configuration',
    position: 'above'
  },
  {
    path: 'uart.uart1',
    comment: 'UART channel 1 configuration',
    position: 'above'
  },
  {
    path: 'uart.uart2',
    comment: 'UART channel 2 configuration',
    position: 'above'
  },
  {
    path: 'baud',
    comment: 'Baud rate (9600, 19200, 38400, 57600, 115200, etc.)',
    position: 'inline'
  },
  {
    path: 'tx_pin',
    comment: 'UART transmit pin',
    position: 'inline'
  },
  {
    path: 'rx_pin',
    comment: 'UART receive pin',
    position: 'inline'
  },
  {
    path: 'rts_pin',
    comment: 'RTS (Request to Send) pin for hardware flow control',
    position: 'inline'
  },
  {
    path: 'cts_pin',
    comment: 'CTS (Clear to Send) pin for hardware flow control',
    position: 'inline'
  },

  // SD card configuration
  {
    path: 'sd',
    comment: 'SD card interface configuration',
    position: 'above'
  },
  {
    path: 'sd.card_detect_pin',
    comment: 'SD card detection pin (optional)',
    position: 'inline'
  },
  {
    path: 'sd.miso_pin',
    comment: 'SPI MISO pin for SD card',
    position: 'inline'
  },
  {
    path: 'sd.mosi_pin',
    comment: 'SPI MOSI pin for SD card',
    position: 'inline'
  },
  {
    path: 'sd.sck_pin',
    comment: 'SPI clock pin for SD card',
    position: 'inline'
  },
  {
    path: 'sd.cs_pin',
    comment: 'SPI chip select pin for SD card',
    position: 'inline'
  },

  // Macros
  {
    path: 'macros',
    comment: 'Custom G-code macros',
    position: 'above'
  },
  {
    path: 'macros.macro0',
    comment: 'Macro 0 - triggered by M0 command',
    position: 'inline'
  },
  {
    path: 'macros.macro1',
    comment: 'Macro 1 - triggered by M1 command',
    position: 'inline'
  },
  {
    path: 'macros.macro2',
    comment: 'Macro 2 - triggered by M2 command',
    position: 'inline'
  },
  {
    path: 'macros.macro3',
    comment: 'Macro 3 - triggered by M3 command',
    position: 'inline'
  },
  {
    path: 'macros.startup_line0',
    comment: 'Startup line 0 - executed on boot',
    position: 'inline'
  },
  {
    path: 'macros.startup_line1',
    comment: 'Startup line 1 - executed on boot',
    position: 'inline'
  },

  // I2SO configuration
  {
    path: 'i2so',
    comment: 'I2S shift register output configuration',
    position: 'above'
  },
  {
    path: 'i2so.bck_pin',
    comment: 'I2S bit clock pin',
    position: 'inline'
  },
  {
    path: 'i2so.data_pin',
    comment: 'I2S data pin',
    position: 'inline'
  },
  {
    path: 'i2so.ws_pin',
    comment: 'I2S word select pin',
    position: 'inline'
  }
];

/**
 * Gets comment for a specific configuration path
 */
export function getCommentForPath(path: string): CommentMapping | undefined {
  // Try exact match first
  const exactMatch = CONFIGURATION_COMMENTS.find(c => c.path === path);
  if (exactMatch) {
    return exactMatch;
  }

  // Try partial matches for nested paths (e.g., 'axes.x.steps_per_mm' matches 'steps_per_mm')
  const pathParts = path.split('.');
  const lastPart = pathParts[pathParts.length - 1];
  return CONFIGURATION_COMMENTS.find(c => c.path === lastPart);
}

/**
 * Gets contextual comment for axis configuration
 */
export function getAxisComment(axisName: string): string {
  switch (axisName.toLowerCase()) {
    case 'x':
      return 'X-axis configuration (typically horizontal left-right movement)';
    case 'y':
      return 'Y-axis configuration (typically horizontal front-back movement)';
    case 'z':
      return 'Z-axis configuration (typically vertical up-down movement)';
    case 'a':
      return 'A-axis configuration (rotational axis around X)';
    case 'b':
      return 'B-axis configuration (rotational axis around Y)';
    case 'c':
      return 'C-axis configuration (rotational axis around Z)';
    default:
      return `${axisName.toUpperCase()}-axis configuration`;
  }
}