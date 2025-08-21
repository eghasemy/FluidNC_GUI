/**
 * Legacy Configuration Mapper
 * 
 * Handles transformation of legacy FluidNC configurations to modern format
 * with detailed mapping hints and suggestions for users.
 */
import { z } from 'zod';

export interface LegacyMapping {
  oldPath: string;
  newPath: string;
  description: string;
  transformer?: (value: any) => any;
}

export interface ImportSuggestion {
  type: 'warning' | 'info' | 'error';
  message: string;
  suggestion?: string;
  path?: string[];
}

export interface ImportResult {
  success: boolean;
  data?: any;
  mappings: LegacyMapping[];
  suggestions: ImportSuggestion[];
  errors: z.ZodError | null;
}

// Common legacy field mappings
const LEGACY_MAPPINGS: LegacyMapping[] = [
  // Stepper driver mappings
  {
    oldPath: 'stepper_driver',
    newPath: 'motor0.driver_type',
    description: 'Legacy stepper_driver field moved to motor0.driver_type'
  },
  {
    oldPath: 'step_pin',
    newPath: 'motor0.step_pin',
    description: 'Legacy step_pin moved to motor configuration'
  },
  {
    oldPath: 'direction_pin',
    newPath: 'motor0.direction_pin',
    description: 'Legacy direction_pin moved to motor configuration'
  },
  {
    oldPath: 'disable_pin',
    newPath: 'motor0.disable_pin',
    description: 'Legacy disable_pin moved to motor configuration'
  },
  
  // TMC driver mappings
  {
    oldPath: 'tmc2130',
    newPath: 'motor0.tmc_2130',
    description: 'TMC2130 configuration moved to motor0.tmc_2130'
  },
  {
    oldPath: 'tmc2209',
    newPath: 'motor0.tmc_2209',
    description: 'TMC2209 configuration moved to motor0.tmc_2209'
  },
  
  // Homing configuration changes
  {
    oldPath: 'homing_cycle',
    newPath: 'homing.cycle',
    description: 'Legacy homing_cycle moved to homing.cycle'
  },
  {
    oldPath: 'positive_direction',
    newPath: 'homing.positive_direction',
    description: 'Legacy positive_direction moved to homing configuration'
  },
  
  // Speed and feed mappings
  {
    oldPath: 'max_rate',
    newPath: 'max_rate_mm_per_min',
    description: 'Legacy max_rate renamed to max_rate_mm_per_min for clarity'
  },
  {
    oldPath: 'acceleration',
    newPath: 'acceleration_mm_per_sec2',
    description: 'Legacy acceleration renamed to acceleration_mm_per_sec2 for clarity'
  },
  
  // Spindle mappings
  {
    oldPath: 'pwm_pin',
    newPath: 'spindle.output_pin',
    description: 'Legacy spindle PWM pin moved to spindle.output_pin'
  },
  {
    oldPath: 'spindle_enable_pin',
    newPath: 'spindle.enable_pin',
    description: 'Legacy spindle enable pin moved to spindle.enable_pin'
  },
  {
    oldPath: 'spindle_dir_pin',
    newPath: 'spindle.direction_pin',
    description: 'Legacy spindle direction pin moved to spindle.direction_pin'
  },
];

/**
 * Transforms a legacy configuration object to modern format
 */
export function transformLegacyConfig(config: any): ImportResult {
  const mappings: LegacyMapping[] = [];
  const suggestions: ImportSuggestion[] = [];
  let transformed = { ...config };

  // First, ensure proper axes structure from flat configuration
  transformed = ensureAxesStructure(transformed, suggestions);

  // Apply legacy mappings to axes
  if (transformed.axes) {
    for (const [axisName, axisConfig] of Object.entries(transformed.axes)) {
      if (typeof axisConfig === 'object' && axisConfig !== null) {
        transformed.axes[axisName] = applyAxisLegacyMappings(axisConfig as any, mappings, suggestions);
      }
    }
  }

  // Apply global legacy mappings
  for (const mapping of LEGACY_MAPPINGS) {
    // Skip mappings that should be applied at axis level
    if (mapping.newPath.startsWith('motor0.') || mapping.newPath.startsWith('homing.')) {
      continue;
    }
    
    const value = getNestedValue(config, mapping.oldPath);
    if (value !== undefined) {
      // Remove old path
      transformed = removeNestedValue(transformed, mapping.oldPath);
      
      // Set new path
      const transformedValue = mapping.transformer ? mapping.transformer(value) : value;
      transformed = setNestedValue(transformed, mapping.newPath, transformedValue);
      
      mappings.push(mapping);
      suggestions.push({
        type: 'info',
        message: mapping.description,
        path: mapping.newPath.split('.')
      });
    }
  }

  // Check for common legacy patterns and add suggestions
  addLegacyPatternSuggestions(config, suggestions);

  return {
    success: true,
    data: transformed,
    mappings,
    suggestions,
    errors: null
  };
}

/**
 * Applies legacy mappings specific to axis configuration
 */
function applyAxisLegacyMappings(axisConfig: any, mappings: LegacyMapping[], suggestions: ImportSuggestion[]): any {
  let transformed = { ...axisConfig };
  
  // Map motor-related fields
  const motorMappings = LEGACY_MAPPINGS.filter(m => m.newPath.startsWith('motor0.'));
  
  for (const mapping of motorMappings) {
    const fieldName = mapping.oldPath;
    const value = transformed[fieldName];
    if (value !== undefined) {
      // Remove old field
      delete transformed[fieldName];
      
      // Set in motor0 configuration
      if (!transformed.motor0) {
        transformed.motor0 = {};
      }
      const motorField = mapping.newPath.replace('motor0.', '');
      transformed.motor0[motorField] = mapping.transformer ? mapping.transformer(value) : value;
      
      mappings.push(mapping);
      suggestions.push({
        type: 'info',
        message: mapping.description,
        path: ['motor0', motorField]
      });
    }
  }
  
  // Map homing-related fields
  const homingMappings = LEGACY_MAPPINGS.filter(m => m.newPath.startsWith('homing.'));
  
  for (const mapping of homingMappings) {
    const fieldName = mapping.oldPath;
    const value = transformed[fieldName];
    if (value !== undefined) {
      // Remove old field
      delete transformed[fieldName];
      
      // Set in homing configuration
      if (!transformed.homing) {
        transformed.homing = {};
      }
      const homingField = mapping.newPath.replace('homing.', '');
      transformed.homing[homingField] = mapping.transformer ? mapping.transformer(value) : value;
      
      mappings.push(mapping);
      suggestions.push({
        type: 'info',
        message: mapping.description,
        path: ['homing', homingField]
      });
    }
  }
  
  // Handle TMC driver mappings
  if (transformed.tmc2130) {
    if (!transformed.motor0) transformed.motor0 = {};
    transformed.motor0.tmc_2130 = transformed.tmc2130;
    delete transformed.tmc2130;
    mappings.push({
      oldPath: 'tmc2130',
      newPath: 'motor0.tmc_2130',
      description: 'TMC2130 configuration moved to motor0.tmc_2130'
    });
  }
  
  if (transformed.tmc2209) {
    if (!transformed.motor0) transformed.motor0 = {};
    transformed.motor0.tmc_2209 = transformed.tmc2209;
    delete transformed.tmc2209;
    mappings.push({
      oldPath: 'tmc2209',
      newPath: 'motor0.tmc_2209',
      description: 'TMC2209 configuration moved to motor0.tmc_2209'
    });
  }
  
  return transformed;
}

/**
 * Adds suggestions for common legacy patterns
 */
function addLegacyPatternSuggestions(config: any, suggestions: ImportSuggestion[]) {
  // Check if configuration has flat axis structure
  if (config.x || config.y || config.z) {
    suggestions.push({
      type: 'warning',
      message: 'Detected flat axis configuration. Converting to nested axes structure.',
      suggestion: 'Modern FluidNC uses axes.x, axes.y, axes.z structure instead of flat x, y, z fields.'
    });
  }

  // Check for old stepper driver names
  const oldDrivers = ['A4988', 'DRV8825', 'LV8729', 'TMC2100'];
  for (const driver of oldDrivers) {
    if (JSON.stringify(config).includes(driver)) {
      suggestions.push({
        type: 'info',
        message: `Detected legacy stepper driver: ${driver}`,
        suggestion: 'Consider upgrading to TMC2209 or TMC2130 for better performance and features.'
      });
    }
  }

  // Check for missing board specification
  if (!config.board) {
    suggestions.push({
      type: 'warning',
      message: 'No board type specified',
      suggestion: 'Add board: "ESP32" or appropriate board type for your hardware.'
    });
  }

  // Check for missing machine name
  if (!config.name) {
    suggestions.push({
      type: 'info',
      message: 'No machine name specified',
      suggestion: 'Add a descriptive name for your machine configuration.'
    });
  }
}

/**
 * Ensures proper axes structure from flat or mixed configurations
 */
function ensureAxesStructure(config: any, suggestions: ImportSuggestion[]): any {
  const result = { ...config };
  const axisNames = ['x', 'y', 'z', 'a', 'b', 'c'];
  
  // Check if we have flat axis configuration
  let hasAxes = false;
  const flatAxes: any = {};
  
  for (const axisName of axisNames) {
    if (config[axisName] && typeof config[axisName] === 'object') {
      flatAxes[axisName] = config[axisName];
      delete result[axisName];
      hasAxes = true;
    }
  }
  
  if (hasAxes) {
    // Merge with existing axes if present
    result.axes = {
      ...result.axes,
      ...flatAxes
    };
    
    suggestions.push({
      type: 'info',
      message: 'Converted flat axis configuration to nested axes structure',
      suggestion: 'Flat axis fields (x, y, z) have been moved to axes.x, axes.y, axes.z'
    });
  }
  
  return result;
}

/**
 * Helper function to get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Helper function to set nested value in object using dot notation
 */
function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!key) continue; // Skip empty keys
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    } else {
      current[key] = { ...current[key] };
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey) {
    current[lastKey] = value;
  }
  return result;
}

/**
 * Helper function to remove nested value from object using dot notation
 */
function removeNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!key || !(key in current)) return result;
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey) {
    delete current[lastKey];
  }
  return result;
}

/**
 * Generates user-friendly error messages for validation failures
 */
export function generateUserFriendlyErrors(errors: z.ZodError): ImportSuggestion[] {
  const suggestions: ImportSuggestion[] = [];
  
  for (const issue of errors.issues) {
    const pathStr = issue.path.join('.');
    let suggestion: string | undefined;
    
    // Generate contextual suggestions based on the error
    if (issue.code === 'invalid_type') {
      if (pathStr.includes('steps_per_mm')) {
        suggestion = 'steps_per_mm should be a positive number (e.g., 80 for typical setup)';
      } else if (pathStr.includes('pin')) {
        suggestion = 'Pin should be a string like "gpio.2" or "NO_PIN" to disable';
      } else if (pathStr.includes('rate')) {
        suggestion = 'Rate values should be positive numbers in mm/min';
      }
    } else if (issue.code === 'too_small') {
      if (pathStr.includes('steps_per_mm') || pathStr.includes('rate') || pathStr.includes('acceleration')) {
        suggestion = 'Value must be positive for motor configuration';
      }
    }
    
    suggestions.push({
      type: 'error',
      message: `${pathStr}: ${issue.message}`,
      ...(suggestion && { suggestion }),
      path: issue.path as string[]
    });
  }
  
  return suggestions;
}