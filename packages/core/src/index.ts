// Core domain models and utilities for FluidNC configuration
import { z } from 'zod';
import * as yaml from 'js-yaml';

// =============================================================================
// Core Interfaces
// =============================================================================

export interface FluidNCConfig {
  name?: string;
  board?: string;
  version?: string;
  axes?: Record<string, AxisConfig>;
  homing?: GlobalHomingConfig;
  spindle?: SpindleConfig;
  io?: IOConfig;
  uart?: UARTConfig;
  macros?: MacrosConfig;
  control?: ControlConfig;
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
  motor1?: MotorConfig;
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

export interface GlobalHomingConfig {
  cycle?: number[];
  allow_single_axis?: boolean;
  must_home_first?: boolean;
  depart_mm?: number;
  [key: string]: unknown;
}

export interface MotorConfig {
  limit_neg_pin?: string;
  limit_pos_pin?: string;
  limit_all_pin?: string;
  hard_limits?: boolean;
  pulloff_mm?: number;
  step_pin?: string;
  direction_pin?: string;
  disable_pin?: string;
  tmc_2130?: TMCConfig;
  tmc_2209?: TMCConfig;
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

export interface SpindleConfig {
  pwm_hz?: number;
  output_pin?: string;
  enable_pin?: string;
  direction_pin?: string;
  speed_map?: string;
  spinup_ms?: number;
  spindown_ms?: number;
  tool_num?: number;
  off_on_alarm?: boolean;
  [key: string]: unknown;
}

export interface IOConfig {
  probe_pin?: string;
  flood_pin?: string;
  mist_pin?: string;
  macro0_pin?: string;
  macro1_pin?: string;
  macro2_pin?: string;
  macro3_pin?: string;
  [key: string]: unknown;
}

export interface UARTConfig {
  uart0?: UARTChannelConfig;
  uart1?: UARTChannelConfig;
  uart2?: UARTChannelConfig;
  [key: string]: unknown;
}

export interface UARTChannelConfig {
  txd_pin?: string;
  rxd_pin?: string;
  rts_pin?: string;
  baud?: number;
  mode?: string;
  [key: string]: unknown;
}

export interface MacrosConfig {
  macro0?: string;
  macro1?: string;
  macro2?: string;
  macro3?: string;
  startup_line0?: string;
  startup_line1?: string;
  [key: string]: unknown;
}

export interface ControlConfig {
  safety_door_pin?: string;
  reset_pin?: string;
  feed_hold_pin?: string;
  cycle_start_pin?: string;
  fro_pin?: string;
  sro_pin?: string;
  [key: string]: unknown;
}

// =============================================================================
// Zod Schemas
// =============================================================================

const TMCRunModeSchema = z.enum(['StealthChop', 'CoolStep', 'StallGuard']);

export const TMCConfigSchema = z.object({
  cs_pin: z.string().optional(),
  r_sense_ohms: z.number().positive().optional(),
  run_amps: z.number().positive().optional(),
  hold_amps: z.number().nonnegative().optional(),
  microsteps: z.number().int().min(1).max(256).optional(),
  stallguard: z.number().int().min(-64).max(63).optional(),
  stallguard_debug: z.boolean().optional(),
  toff_disable: z.number().int().min(0).max(15).optional(),
  toff_stealthchop: z.number().int().min(0).max(15).optional(),
  toff_coolstep: z.number().int().min(0).max(15).optional(),
  run_mode: TMCRunModeSchema.optional(),
  homing_mode: TMCRunModeSchema.optional(),
  use_enable: z.boolean().optional(),
}).catchall(z.unknown());

export const MotorConfigSchema = z.object({
  limit_neg_pin: z.string().optional(),
  limit_pos_pin: z.string().optional(),
  limit_all_pin: z.string().optional(),
  hard_limits: z.boolean().optional(),
  pulloff_mm: z.number().nonnegative().optional(),
  step_pin: z.string().optional(),
  direction_pin: z.string().optional(),
  disable_pin: z.string().optional(),
  tmc_2130: TMCConfigSchema.optional(),
  tmc_2209: TMCConfigSchema.optional(),
}).catchall(z.unknown());

export const HomingConfigSchema = z.object({
  cycle: z.number().int().min(0).max(10).optional(),
  positive_direction: z.boolean().optional(),
  mpos_mm: z.number().optional(),
  feed_mm_per_min: z.number().positive().optional(),
  seek_mm_per_min: z.number().positive().optional(),
  debounce_ms: z.number().int().nonnegative().optional(),
  seek_scaler: z.number().positive().optional(),
  feed_scaler: z.number().positive().optional(),
}).catchall(z.unknown());

export const GlobalHomingConfigSchema = z.object({
  cycle: z.array(z.number().int().min(0).max(10)).optional(),
  allow_single_axis: z.boolean().optional(),
  must_home_first: z.boolean().optional(),
  depart_mm: z.number().nonnegative().optional(),
}).catchall(z.unknown());

export const AxisConfigSchema = z.object({
  steps_per_mm: z.number().positive().optional(),
  max_rate_mm_per_min: z.number().positive().optional(),
  acceleration_mm_per_sec2: z.number().positive().optional(),
  max_travel_mm: z.number().positive().optional(),
  soft_limits: z.boolean().optional(),
  homing: HomingConfigSchema.optional(),
  motor0: MotorConfigSchema.optional(),
  motor1: MotorConfigSchema.optional(),
}).catchall(z.unknown());

export const SpindleConfigSchema = z.object({
  pwm_hz: z.number().int().positive().optional(),
  output_pin: z.string().optional(),
  enable_pin: z.string().optional(),
  direction_pin: z.string().optional(),
  speed_map: z.string().optional(),
  spinup_ms: z.number().int().nonnegative().optional(),
  spindown_ms: z.number().int().nonnegative().optional(),
  tool_num: z.number().int().nonnegative().optional(),
  off_on_alarm: z.boolean().optional(),
}).catchall(z.unknown());

export const IOConfigSchema = z.object({
  probe_pin: z.string().optional(),
  flood_pin: z.string().optional(),
  mist_pin: z.string().optional(),
  macro0_pin: z.string().optional(),
  macro1_pin: z.string().optional(),
  macro2_pin: z.string().optional(),
  macro3_pin: z.string().optional(),
}).catchall(z.unknown());

export const UARTChannelConfigSchema = z.object({
  txd_pin: z.string().optional(),
  rxd_pin: z.string().optional(),
  rts_pin: z.string().optional(),
  baud: z.number().int().positive().optional(),
  mode: z.string().optional(),
}).catchall(z.unknown());

export const UARTConfigSchema = z.object({
  uart0: UARTChannelConfigSchema.optional(),
  uart1: UARTChannelConfigSchema.optional(),
  uart2: UARTChannelConfigSchema.optional(),
}).catchall(z.unknown());

export const MacrosConfigSchema = z.object({
  macro0: z.string().optional(),
  macro1: z.string().optional(),
  macro2: z.string().optional(),
  macro3: z.string().optional(),
  startup_line0: z.string().optional(),
  startup_line1: z.string().optional(),
}).catchall(z.unknown());

export const ControlConfigSchema = z.object({
  safety_door_pin: z.string().optional(),
  reset_pin: z.string().optional(),
  feed_hold_pin: z.string().optional(),
  cycle_start_pin: z.string().optional(),
  fro_pin: z.string().optional(),
  sro_pin: z.string().optional(),
}).catchall(z.unknown());

export const FluidNCConfigSchema = z.object({
  name: z.string().optional(),
  board: z.string().optional(),
  version: z.string().optional(),
  axes: z.record(z.string(), AxisConfigSchema).optional(),
  homing: GlobalHomingConfigSchema.optional(),
  spindle: SpindleConfigSchema.optional(),
  io: IOConfigSchema.optional(),
  uart: UARTConfigSchema.optional(),
  macros: MacrosConfigSchema.optional(),
  control: ControlConfigSchema.optional(),
}).catchall(z.unknown());

// =============================================================================
// Validation Utilities
// =============================================================================

export function validateFluidNCConfig(config: unknown): { success: true; data: z.infer<typeof FluidNCConfigSchema> } | { success: false; errors: z.ZodError } {
  const result = FluidNCConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateAxisConfig(config: unknown): { success: true; data: z.infer<typeof AxisConfigSchema> } | { success: false; errors: z.ZodError } {
  const result = AxisConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateSpindleConfig(config: unknown): { success: true; data: z.infer<typeof SpindleConfigSchema> } | { success: false; errors: z.ZodError } {
  const result = SpindleConfigSchema.safeParse(config);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

// =============================================================================
// Defaults and Constants
// =============================================================================

export const DEFAULT_CONFIG: FluidNCConfig = {
  name: 'FluidNC Configuration',
  board: '',
};

// =============================================================================
// YAML Converters
// =============================================================================

/**
 * Converts a FluidNC configuration object to YAML string.
 * Preserves unknown keys during conversion.
 */
export function toYAML(config: z.infer<typeof FluidNCConfigSchema>): string {
  return yaml.dump(config, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}

/**
 * Converts a YAML string to FluidNC configuration object.
 * Preserves unknown keys during conversion and validates the result.
 */
export function fromYAML(yamlString: string): { success: true; data: z.infer<typeof FluidNCConfigSchema> } | { success: false; errors: z.ZodError } {
  try {
    const parsed = yaml.load(yamlString);
    return validateFluidNCConfig(parsed);
  } catch (error) {
    // Create a ZodError for YAML parsing errors
    const zodError = new z.ZodError([
      {
        code: 'custom',
        message: `YAML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        path: [],
      },
    ]);
    return { success: false, errors: zodError };
  }
}
