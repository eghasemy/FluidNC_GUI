/**
 * Test fixture configurations for E2E tests
 */

export const testConfigs = {
  basicRouter: {
    name: 'Test CNC Router',
    board: 'ESP32',
    axes: {
      x: {
        steps_per_mm: 80,
        max_rate_mm_per_min: 5000,
        acceleration_mm_per_sec2: 200,
        max_travel_mm: 300,
        soft_limits: true,
        motor0: {
          step_pin: 'gpio.2',
          direction_pin: 'gpio.5',
          disable_pin: 'gpio.13',
        },
        homing: {
          cycle: 1,
          positive_direction: false,
          mpos_mm: 0,
          feed_mm_per_min: 200,
          seek_mm_per_min: 2000,
        },
      },
      y: {
        steps_per_mm: 80,
        max_rate_mm_per_min: 5000,
        acceleration_mm_per_sec2: 200,
        max_travel_mm: 300,
        soft_limits: true,
        motor0: {
          step_pin: 'gpio.12',
          direction_pin: 'gpio.14',
          disable_pin: 'gpio.13',
        },
        homing: {
          cycle: 1,
          positive_direction: false,
          mpos_mm: 0,
          feed_mm_per_min: 200,
          seek_mm_per_min: 2000,
        },
      },
      z: {
        steps_per_mm: 400,
        max_rate_mm_per_min: 1000,
        acceleration_mm_per_sec2: 100,
        max_travel_mm: 100,
        soft_limits: true,
        motor0: {
          step_pin: 'gpio.27',
          direction_pin: 'gpio.26',
          disable_pin: 'gpio.13',
        },
        homing: {
          cycle: 2,
          positive_direction: true,
          mpos_mm: 100,
          feed_mm_per_min: 100,
          seek_mm_per_min: 1000,
        },
      },
    },
    spindle: {
      output_pin: 'gpio.25',
      enable_pin: 'gpio.4',
      pwm_hz: 5000,
      off_on_alarm: true,
    },
  },

  legacyConfig: `
name: Legacy CNC Router

x:
  steps_per_mm: 80
  max_rate_mm_per_min: 5000
  step_pin: gpio.2
  direction_pin: gpio.5
  disable_pin: gpio.13
  tmc2209:
    current_ma: 800
    microsteps: 16
  homing_cycle: 1
  positive_direction: false

y:
  steps_per_mm: 80
  max_rate_mm_per_min: 5000
  step_pin: gpio.12
  direction_pin: gpio.14
  disable_pin: gpio.13
  tmc2209:
    current_ma: 800
    microsteps: 16
  homing_cycle: 1
  positive_direction: false

pwm_pin: gpio.25
spindle_enable_pin: gpio.4
driver_notes: "Using A4988 stepper drivers"
`,

  invalidConfig: `
name: 
board: NonExistentBoard
axes:
  x:
    steps_per_mm: -1
    max_rate_mm_per_min: "invalid"
`,

  simpleConfig: {
    name: 'Simple Test Config',
    board: 'ESP32',
    axes: {
      x: {
        steps_per_mm: 80,
        max_rate_mm_per_min: 5000,
        motor0: {
          step_pin: 'gpio.2',
          direction_pin: 'gpio.5',
        },
      },
    },
  },
};

export const mockDeviceResponses = {
  connectionSuccess: 'FluidNC 3.7.0\n',
  configSetSuccess: '$Config/Board=ESP32 ok\n',
  resetSuccess: '$RST=$ ok\nRestarting...\nFluidNC 3.7.0\n',
  validationPass: 'MSG:INFO: Configuration validated successfully\n',
  validationWarning: 'MSG:WARN: Spindle configuration incomplete\n',
  validationError: 'MSG:ERR: Invalid pin assignment: gpio.2\n',
};

export const wizardSteps = {
  machine: 'machine',
  mechanics: 'mechanics',
  motors: 'motors',
  homing: 'homing',
  spindle: 'spindle',
  io: 'io',
  macros: 'macros',
  sd: 'sd',
  uart: 'uart',
  review: 'review',
};

export const boardTypes = [
  'ESP32',
  'ESP32-S3',
  'ESP32-C3',
  'Custom',
];

export const commonPins = {
  gpio: Array.from({ length: 40 }, (_, i) => `gpio.${i}`),
  stepPins: ['gpio.2', 'gpio.12', 'gpio.27', 'gpio.33'],
  directionPins: ['gpio.5', 'gpio.14', 'gpio.26', 'gpio.32'],
  enablePins: ['gpio.13', 'gpio.15'],
  limitPins: ['gpio.16', 'gpio.17', 'gpio.21', 'gpio.22'],
  spindlePins: ['gpio.25', 'gpio.4'],
};