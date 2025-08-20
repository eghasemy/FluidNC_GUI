// Machine and board presets for FluidNC configuration

import type { FluidNCConfig } from '@fluidnc-gui/core';

export interface PresetMetadata {
  id: string;
  name: string;
  description: string;
  category: 'router' | 'laser' | 'plasma' | 'mill' | 'other';
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
];

export function getPresetById(id: string): MachinePreset | undefined {
  return DEFAULT_PRESETS.find((preset) => preset.id === id);
}

export function getPresetsByCategory(category: PresetMetadata['category']): MachinePreset[] {
  return DEFAULT_PRESETS.filter((preset) => preset.category === category);
}
