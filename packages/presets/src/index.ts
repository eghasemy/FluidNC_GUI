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
];

export function getPresetById(id: string): MachinePreset | undefined {
  return DEFAULT_PRESETS.find((preset) => preset.id === id);
}

export function getPresetsByCategory(category: PresetMetadata['category']): MachinePreset[] {
  return DEFAULT_PRESETS.filter((preset) => preset.category === category);
}
