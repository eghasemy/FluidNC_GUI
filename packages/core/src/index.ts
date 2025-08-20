// Core domain models and utilities for FluidNC configuration

export interface FluidNCConfig {
  name?: string;
  board?: string;
  version?: string;
  axes?: Record<string, AxisConfig>;
  [key: string]: unknown;
}

export interface AxisConfig {
  steps_per_mm?: number;
  max_rate_mm_per_min?: number;
  acceleration_mm_per_sec2?: number;
  max_travel_mm?: number;
  soft_limits?: boolean;
  homing?: HomingConfig;
  motor0?: MotorConfig;
  [key: string]: unknown;
}

export interface HomingConfig {
  cycle?: number;
  positive_direction?: boolean;
  mpos_mm?: number;
  feed_mm_per_min?: number;
  seek_mm_per_min?: number;
  debounce_ms?: number;
  seek_scaler?: number;
  feed_scaler?: number;
  [key: string]: unknown;
}

export interface MotorConfig {
  limit_neg_pin?: string;
  limit_pos_pin?: string;
  limit_all_pin?: string;
  hard_limits?: boolean;
  pulloff_mm?: number;
  tmc_2130?: TMCConfig;
  [key: string]: unknown;
}

export interface TMCConfig {
  cs_pin?: string;
  r_sense_ohms?: number;
  run_amps?: number;
  hold_amps?: number;
  microsteps?: number;
  stallguard?: number;
  stallguard_debug?: boolean;
  toff_disable?: number;
  toff_stealthchop?: number;
  toff_coolstep?: number;
  run_mode?: 'StealthChop' | 'CoolStep' | 'StallGuard';
  homing_mode?: 'StealthChop' | 'CoolStep' | 'StallGuard';
  use_enable?: boolean;
  [key: string]: unknown;
}

export const DEFAULT_CONFIG: FluidNCConfig = {
  name: 'FluidNC Configuration',
  board: '',
};
