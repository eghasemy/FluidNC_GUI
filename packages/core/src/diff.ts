import { FluidNCConfig } from './index';

/**
 * Represents a difference between two configuration values
 */
export interface ConfigDiff {
  path: string[];
  type: 'added' | 'removed' | 'changed';
  oldValue?: any;
  newValue?: any;
}

/**
 * Compare two configuration objects and return structural differences.
 * This is AST-aware and provides stable diffs across minor changes.
 */
export function diffConfigurations(
  oldConfig: FluidNCConfig, 
  newConfig: FluidNCConfig
): ConfigDiff[] {
  const diffs: ConfigDiff[] = [];
  
  function compareObjects(
    oldObj: any, 
    newObj: any, 
    path: string[] = []
  ): void {
    // Handle null/undefined cases
    if (oldObj === null && newObj === null) return;
    if (oldObj === undefined && newObj === undefined) return;
    
    if (oldObj === null || oldObj === undefined) {
      diffs.push({
        path: [...path],
        type: 'added',
        newValue: newObj
      });
      return;
    }
    
    if (newObj === null || newObj === undefined) {
      diffs.push({
        path: [...path],
        type: 'removed',
        oldValue: oldObj
      });
      return;
    }
    
    // If types are different, treat as changed
    if (typeof oldObj !== typeof newObj) {
      diffs.push({
        path: [...path],
        type: 'changed',
        oldValue: oldObj,
        newValue: newObj
      });
      return;
    }
    
    // Handle primitive values
    if (typeof oldObj !== 'object' || oldObj instanceof Date) {
      if (oldObj !== newObj) {
        diffs.push({
          path: [...path],
          type: 'changed',
          oldValue: oldObj,
          newValue: newObj
        });
      }
      return;
    }
    
    // Handle arrays
    if (Array.isArray(oldObj) && Array.isArray(newObj)) {
      const maxLength = Math.max(oldObj.length, newObj.length);
      for (let i = 0; i < maxLength; i++) {
        if (i >= oldObj.length) {
          diffs.push({
            path: [...path, i.toString()],
            type: 'added',
            newValue: newObj[i]
          });
        } else if (i >= newObj.length) {
          diffs.push({
            path: [...path, i.toString()],
            type: 'removed',
            oldValue: oldObj[i]
          });
        } else {
          compareObjects(oldObj[i], newObj[i], [...path, i.toString()]);
        }
      }
      return;
    }
    
    // Handle objects
    const allKeys = new Set([
      ...Object.keys(oldObj),
      ...Object.keys(newObj)
    ]);
    
    for (const key of allKeys) {
      const oldValue = oldObj[key];
      const newValue = newObj[key];
      
      if (!(key in oldObj)) {
        diffs.push({
          path: [...path, key],
          type: 'added',
          newValue: newValue
        });
      } else if (!(key in newObj)) {
        diffs.push({
          path: [...path, key],
          type: 'removed',
          oldValue: oldValue
        });
      } else {
        compareObjects(oldValue, newValue, [...path, key]);
      }
    }
  }
  
  compareObjects(oldConfig, newConfig);
  return diffs;
}

/**
 * Format a value for display in the diff viewer
 */
export function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return `[${value.map(formatValue).join(', ')}]`;
    }
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

/**
 * Get the path as a readable string for display
 */
export function formatPath(path: string[]): string {
  if (path.length === 0) return '(root)';
  return path.join('.');
}