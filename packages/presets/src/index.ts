// Machine and board presets for FluidNC configuration

import type { FluidNCConfig } from '@fluidnc-gui/core';

export interface PresetMetadata {
  id: string;
  name: string;
  description: string;
  category: 'router' | 'laser' | 'plasma' | 'rotary' | 'mill' | 'other';
  author?: string;
  version?: string;
  tags?: string[];
}

export interface MachinePreset extends PresetMetadata {
  config: FluidNCConfig;
}

export const DEFAULT_PRESETS: MachinePreset[] = [
  {
    id: 'basic-3axis-router',
    name: 'Basic 3-Axis Router',
    description: 'A simple 3-axis router configuration',
    category: 'router',
    author: 'FluidNC GUI',
    version: '1.0.0',
    tags: ['basic', '3-axis', 'router'],
    config: {
      name: 'Basic 3-Axis Router',
      board: '',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 1000,
          acceleration_mm_per_sec2: 50,
          max_travel_mm: 100,
          soft_limits: true,
        },
      },
    },
  },
  {
    id: 'cnc-with-outputs',
    name: 'CNC with User Outputs',
    description: 'CNC configuration with coolant and user-controllable outputs',
    category: 'mill',
    author: 'FluidNC GUI',
    version: '1.0.0',
    tags: ['cnc', 'outputs', 'coolant'],
    config: {
      name: 'CNC with User Outputs',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 1000,
          acceleration_mm_per_sec2: 50,
          max_travel_mm: 100,
          soft_limits: true,
        },
      },
      io: {
        probe_pin: 'gpio.25',
        flood_pin: 'gpio.26',
        mist_pin: 'gpio.27',
        user_output_0_pin: 'gpio.32',
        user_output_1_pin: 'gpio.33',
        user_pwm_0_pin: 'gpio.36',
      },
      control: {
        feed_hold_pin: 'gpio.17',
        cycle_start_pin: 'gpio.16',
        reset_pin: 'gpio.18',
      },
    },
  },
  {
    id: 'laser-engraver-2axis',
    name: '2-Axis Laser Engraver',
    description: 'CO2 laser engraver with 2-axis motion and laser control',
    category: 'laser',
    author: 'FluidNC Community',
    version: '1.0.0',
    tags: ['laser', '2-axis', 'engraver', 'co2'],
    config: {
      name: '2-Axis Laser Engraver',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 8000,
          acceleration_mm_per_sec2: 200,
          max_travel_mm: 400,
          soft_limits: true,
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
          max_rate_mm_per_min: 8000,
          acceleration_mm_per_sec2: 200,
          max_travel_mm: 300,
          soft_limits: true,
          homing: {
            cycle: 1,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 200,
            seek_mm_per_min: 2000,
          },
        },
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4',
        pwm_hz: 5000,
        off_on_alarm: true,
        min_pulse_us: 1,
        max_pulse_us: 1000,
      },
      control: {
        safety_door_pin: 'gpio.17',
        reset_pin: 'gpio.18',
      },
    },
  },
  {
    id: 'plasma-cutter-2axis',
    name: '2-Axis Plasma Cutter',
    description: 'Plasma cutting table with 2-axis motion and torch height control',
    category: 'plasma',
    author: 'FluidNC Community',
    version: '1.0.0',
    tags: ['plasma', '2-axis', 'cutter', 'thc'],
    config: {
      name: '2-Axis Plasma Cutter',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 40,
          max_rate_mm_per_min: 6000,
          acceleration_mm_per_sec2: 150,
          max_travel_mm: 1200,
          soft_limits: true,
          homing: {
            cycle: 1,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 500,
            seek_mm_per_min: 3000,
          },
        },
        y: {
          steps_per_mm: 40,
          max_rate_mm_per_min: 6000,
          acceleration_mm_per_sec2: 150,
          max_travel_mm: 600,
          soft_limits: true,
          homing: {
            cycle: 1,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 500,
            seek_mm_per_min: 3000,
          },
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 2000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 100,
          soft_limits: true,
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
        off_on_alarm: true,
      },
      io: {
        probe_pin: 'gpio.22',
        user_output_0_pin: 'gpio.32',
        user_output_1_pin: 'gpio.33',
      },
      control: {
        feed_hold_pin: 'gpio.17',
        cycle_start_pin: 'gpio.16',
        reset_pin: 'gpio.18',
      },
    },
  },
  {
    id: 'rotary-4axis-router',
    name: '4-Axis Rotary Router',
    description: '3-axis router with rotary A-axis for cylindrical workpieces',
    category: 'rotary',
    author: 'FluidNC Community',
    version: '1.0.0',
    tags: ['rotary', '4-axis', 'router', 'cylindrical'],
    config: {
      name: '4-Axis Rotary Router',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
          homing: {
            cycle: 1,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 100,
            seek_mm_per_min: 1000,
          },
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
          homing: {
            cycle: 1,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 100,
            seek_mm_per_min: 1000,
          },
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 1000,
          acceleration_mm_per_sec2: 50,
          max_travel_mm: 100,
          soft_limits: true,
          homing: {
            cycle: 2,
            positive_direction: true,
            mpos_mm: 100,
            feed_mm_per_min: 50,
            seek_mm_per_min: 500,
          },
        },
        a: {
          steps_per_mm: 11.11,
          max_rate_mm_per_min: 3600,
          acceleration_mm_per_sec2: 200,
          max_travel_mm: 360,
          soft_limits: false,
          homing: {
            cycle: 3,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 100,
            seek_mm_per_min: 1000,
          },
        },
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4',
        direction_pin: 'gpio.16',
        pwm_hz: 5000,
        off_on_alarm: true,
      },
      control: {
        feed_hold_pin: 'gpio.17',
        cycle_start_pin: 'gpio.16',
        reset_pin: 'gpio.18',
      },
    },
  },
];

export function getPresetById(id: string): MachinePreset | undefined {
  return DEFAULT_PRESETS.find((preset) => preset.id === id);
}

export function getPresetsByCategory(category: PresetMetadata['category']): MachinePreset[] {
  return DEFAULT_PRESETS.filter((preset) => preset.category === category);
}
