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

/**
 * Enhanced axis validation that includes cross-field validation
 */
export function validateAxisConfigWithContext(axisConfig: unknown, motorConfig?: MotorConfig, tmcConfig?: TMCConfig): { 
  success: boolean; 
  data?: z.infer<typeof AxisConfigSchema>; 
  errors?: z.ZodError;
  validationMessages?: string[];
} {
  const result = validateAxisConfig(axisConfig);
  
  if (!result.success) {
    return result;
  }
  
  // Perform cross-field validation
  const context: AxisValidationContext = {
    axis: result.data as AxisConfig,
    motorConfig,
    tmcConfig: tmcConfig || motorConfig?.tmc_2130 || motorConfig?.tmc_2209,
  };
  
  const validation = validateAxisConfiguration(context);
  
  return {
    success: validation.valid,
    data: result.data,
    validationMessages: validation.messages,
  };
}

// =============================================================================
// Defaults and Constants
// =============================================================================

export const DEFAULT_CONFIG: FluidNCConfig = {
  name: 'FluidNC Configuration',
  board: '',
};

// =============================================================================
// Steps/MM Calculator Utilities
// =============================================================================

export interface StepsPerMMParams {
  motor_steps_per_rev?: number; // Default: 200 (1.8° stepper)
  microsteps?: number; // Default: 16
  drive_pulley_teeth?: number; // For belt drives
  driven_pulley_teeth?: number; // For belt drives
  belt_pitch_mm?: number; // GT2 = 2mm, GT3 = 3mm
  leadscrew_pitch_mm?: number; // For leadscrew drives
  pinion_teeth?: number; // For rack & pinion
  rack_pitch_mm?: number; // For rack & pinion
  gear_ratio?: number; // Additional gear reduction
}

/**
 * Calculate steps per mm for belt/pulley drive systems
 */
export function calculateStepsPerMM_Belt(params: StepsPerMMParams): number {
  const motorSteps = params.motor_steps_per_rev ?? 200;
  const microsteps = params.microsteps ?? 16;
  const drivePulleyTeeth = params.drive_pulley_teeth ?? 20;
  const drivenPulleyTeeth = params.driven_pulley_teeth ?? drivePulleyTeeth;
  const beltPitch = params.belt_pitch_mm ?? 2; // GT2 default
  const gearRatio = params.gear_ratio ?? 1;
  
  const totalStepsPerRev = motorSteps * microsteps;
  const drivePulleyCircumference = drivePulleyTeeth * beltPitch;
  const mechanicalRatio = drivePulleyTeeth / drivenPulleyTeeth; // Smaller driven pulley = higher ratio
  
  return (totalStepsPerRev * gearRatio * mechanicalRatio) / drivePulleyCircumference;
}

/**
 * Calculate steps per mm for leadscrew drive systems
 */
export function calculateStepsPerMM_Leadscrew(params: StepsPerMMParams): number {
  const motorSteps = params.motor_steps_per_rev ?? 200;
  const microsteps = params.microsteps ?? 16;
  const leadscrewPitch = params.leadscrew_pitch_mm ?? 8; // 8mm leadscrew default
  const gearRatio = params.gear_ratio ?? 1;
  
  const totalStepsPerRev = motorSteps * microsteps;
  
  return (totalStepsPerRev * gearRatio) / leadscrewPitch;
}

/**
 * Calculate steps per mm for rack and pinion drive systems
 */
export function calculateStepsPerMM_RackPinion(params: StepsPerMMParams): number {
  const motorSteps = params.motor_steps_per_rev ?? 200;
  const microsteps = params.microsteps ?? 16;
  const pinionTeeth = params.pinion_teeth ?? 20;
  const rackPitch = params.rack_pitch_mm ?? 2; // GT2 rack default
  const gearRatio = params.gear_ratio ?? 1;
  
  const totalStepsPerRev = motorSteps * microsteps;
  const pinionCircumference = pinionTeeth * rackPitch;
  
  return (totalStepsPerRev * gearRatio) / pinionCircumference;
}

/**
 * General steps per mm calculator that detects drive type from parameters
 */
export function calculateStepsPerMM(params: StepsPerMMParams): number {
  if (params.leadscrew_pitch_mm) {
    return calculateStepsPerMM_Leadscrew(params);
  } else if (params.pinion_teeth && params.rack_pitch_mm) {
    return calculateStepsPerMM_RackPinion(params);
  } else if (params.drive_pulley_teeth && params.belt_pitch_mm) {
    return calculateStepsPerMM_Belt(params);
  } else {
    // Default to belt drive with GT2
    return calculateStepsPerMM_Belt(params);
  }
}

// =============================================================================
// Cross-field Validation Utilities
// =============================================================================

export interface AxisValidationContext {
  axis: AxisConfig;
  motorConfig?: MotorConfig | undefined;
  tmcConfig?: TMCConfig | undefined;
}

/**
 * Validates that steps_per_mm is consistent with motor configuration
 */
export function validateStepsPerMMConsistency(context: AxisValidationContext): { valid: boolean; message?: string } {
  const { axis, tmcConfig } = context;
  
  if (!axis.steps_per_mm || !tmcConfig?.microsteps) {
    return { valid: true }; // Cannot validate without required data
  }
  
  // Calculate expected range based on common motor configurations
  const motorSteps = 200; // Assume 1.8° stepper
  const microsteps = tmcConfig.microsteps;
  const totalStepsPerRev = motorSteps * microsteps;
  
  // Reasonable range for steps_per_mm: 1-10000 (covers most mechanical systems)
  const minExpected = totalStepsPerRev / 10000; // Very fine pitch (e.g., 1mm leadscrew)
  const maxExpected = totalStepsPerRev / 0.1; // Very coarse pitch (e.g., large pulley)
  
  if (axis.steps_per_mm < minExpected || axis.steps_per_mm > maxExpected) {
    return {
      valid: false,
      message: `steps_per_mm (${axis.steps_per_mm}) appears inconsistent with microsteps (${microsteps}). Expected range: ${minExpected.toFixed(2)}-${maxExpected.toFixed(2)}`
    };
  }
  
  return { valid: true };
}

/**
 * Validates that feed rates are achievable with the given steps_per_mm and motor configuration
 */
export function validateFeedRateCapability(context: AxisValidationContext): { valid: boolean; message?: string } {
  const { axis, tmcConfig } = context;
  
  if (!axis.steps_per_mm || !axis.max_rate_mm_per_min || !tmcConfig?.microsteps) {
    return { valid: true }; // Cannot validate without required data
  }
  
  const stepsPerSecond = (axis.steps_per_mm * axis.max_rate_mm_per_min) / 60;
  
  // Typical stepper motor maximum step rate: ~50kHz for good performance
  const maxStepRate = 50000; // Hz
  
  if (stepsPerSecond > maxStepRate) {
    return {
      valid: false,
      message: `max_rate_mm_per_min (${axis.max_rate_mm_per_min}) requires ${stepsPerSecond.toFixed(0)} steps/sec, which exceeds typical stepper limit of ${maxStepRate} steps/sec`
    };
  }
  
  return { valid: true };
}

/**
 * Validates acceleration limits based on motor and mechanical constraints
 */
export function validateAccelerationLimits(context: AxisValidationContext): { valid: boolean; message?: string } {
  const { axis } = context;
  
  if (!axis.acceleration_mm_per_sec2 || !axis.steps_per_mm) {
    return { valid: true }; // Cannot validate without required data
  }
  
  const stepsPerSec2 = axis.acceleration_mm_per_sec2 * axis.steps_per_mm;
  
  // Reasonable acceleration limit for steppers: ~100,000 steps/sec²
  const maxAcceleration = 100000; // steps/sec²
  
  if (stepsPerSec2 > maxAcceleration) {
    return {
      valid: false,
      message: `acceleration_mm_per_sec2 (${axis.acceleration_mm_per_sec2}) requires ${stepsPerSec2.toFixed(0)} steps/sec², which may be too high for reliable stepper operation`
    };
  }
  
  return { valid: true };
}

/**
 * Validates homing feed rates are reasonable compared to max rates
 */
export function validateHomingRates(context: AxisValidationContext): { valid: boolean; message?: string } {
  const { axis } = context;
  
  if (!axis.homing || !axis.max_rate_mm_per_min) {
    return { valid: true }; // Cannot validate without required data
  }
  
  const { feed_mm_per_min, seek_mm_per_min } = axis.homing;
  
  if (feed_mm_per_min && feed_mm_per_min > axis.max_rate_mm_per_min) {
    return {
      valid: false,
      message: `homing feed_mm_per_min (${feed_mm_per_min}) exceeds axis max_rate_mm_per_min (${axis.max_rate_mm_per_min})`
    };
  }
  
  if (seek_mm_per_min && seek_mm_per_min > axis.max_rate_mm_per_min) {
    return {
      valid: false,
      message: `homing seek_mm_per_min (${seek_mm_per_min}) exceeds axis max_rate_mm_per_min (${axis.max_rate_mm_per_min})`
    };
  }
  
  return { valid: true };
}

/**
 * Comprehensive axis configuration validation
 */
export function validateAxisConfiguration(context: AxisValidationContext): { valid: boolean; messages: string[] } {
  const validators = [
    validateStepsPerMMConsistency,
    validateFeedRateCapability,
    validateAccelerationLimits,
    validateHomingRates,
  ];
  
  const messages: string[] = [];
  let allValid = true;
  
  for (const validator of validators) {
    const result = validator(context);
    if (!result.valid) {
      allValid = false;
      if (result.message) {
        messages.push(result.message);
      }
    }
  }
  
  return { valid: allValid, messages };
}

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
