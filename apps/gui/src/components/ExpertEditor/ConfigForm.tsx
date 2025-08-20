import React, { useState, useEffect } from 'react';
import { FluidNCConfig, validateFluidNCConfig } from '@fluidnc-gui/core';
import { SchemaField } from './SchemaField';

export interface ConfigFormProps {
  config: FluidNCConfig;
  selectedPath: string[];
  onConfigChange: (config: FluidNCConfig) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  selectedPath,
  onConfigChange,
  onValidationChange,
}) => {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const getValueAtPath = (obj: unknown, path: string[]): unknown => {
    if (path.length === 0) return obj;
    
    let current = obj as Record<string, unknown>;
    for (const key of path) {
      if (current === null || current === undefined) return undefined;
      current = current[key] as Record<string, unknown>;
    }
    return current;
  };

  const setValueAtPath = (obj: Record<string, unknown>, path: string[], value: unknown): Record<string, unknown> => {
    if (path.length === 0) return value as Record<string, unknown>;
    
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!key) continue; // Skip undefined keys
      if (current[key] === undefined || current[key] === null) {
        current[key] = {};
      } else {
        current[key] = { ...(current[key] as Record<string, unknown>) };
      }
      current = current[key] as Record<string, unknown>;
    }
    
    const lastKey = path[path.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
    
    return result;
  };

  const deleteValueAtPath = (obj: Record<string, unknown>, path: string[]): Record<string, unknown> => {
    if (path.length === 0) return {};
    
    const result = { ...obj };
    let current = result;
    
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!key || current[key] === undefined) return result;
      current[key] = { ...(current[key] as Record<string, unknown>) };
      current = current[key] as Record<string, unknown>;
    }
    
    const lastKey = path[path.length - 1];
    if (lastKey) {
      delete current[lastKey];
    }
    
    return result;
  };

  const currentValue = getValueAtPath(config, selectedPath);
  const isObject = typeof currentValue === 'object' && currentValue !== null;

  const handleValueChange = (value: unknown) => {
    const newConfig = setValueAtPath(config as Record<string, unknown>, selectedPath, value) as FluidNCConfig;
    onConfigChange(newConfig);
  };

  const handleDeleteKey = () => {
    if (selectedPath.length === 0) return;
    
    const newConfig = deleteValueAtPath(config as Record<string, unknown>, selectedPath) as FluidNCConfig;
    onConfigChange(newConfig);
  };

  const handleAddKey = () => {
    if (!newKeyName.trim()) return;
    
    let parsedValue: unknown = newKeyValue;
    
    // Try to parse the value as JSON for non-string types
    if (newKeyValue.trim() !== '') {
      try {
        parsedValue = JSON.parse(newKeyValue);
      } catch {
        // If JSON parsing fails, treat as string
        parsedValue = newKeyValue;
      }
    }
    
    const newPath = [...selectedPath, newKeyName];
    const newConfig = setValueAtPath(config as Record<string, unknown>, newPath, parsedValue) as FluidNCConfig;
    onConfigChange(newConfig);
    
    setNewKeyName('');
    setNewKeyValue('');
  };

  // Validate configuration
  useEffect(() => {
    const validation = validateFluidNCConfig(config);
    const newErrors: string[] = [];
    
    if (!validation.success) {
      validation.errors.issues.forEach((issue) => {
        newErrors.push(`${issue.path.join('.')}: ${issue.message}`);
      });
    }
    
    setErrors(newErrors);
    if (onValidationChange) {
      onValidationChange(validation.success);
    }
  }, [config, onValidationChange]);

  if (selectedPath.length === 0) {
    return (
      <div className="config-form">
        <div className="form-header">
          <h3>Root Configuration</h3>
        </div>
        
        <div className="add-key-section">
          <h4>Add New Root Key</h4>
          <div className="form-row">
            <div className="form-group">
              <label>Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., custom_setting"
              />
            </div>
            <div className="form-group">
              <label>Value</label>
              <input
                type="text"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                placeholder='e.g., true, 123, or "text"'
              />
            </div>
            <button onClick={handleAddKey} disabled={!newKeyName.trim()}>
              Add Key
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="validation-errors">
            <h4>Validation Errors</h4>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="config-form">
      <div className="form-header">
        <h3>Edit: {selectedPath.join(' → ')}</h3>
        <button className="delete-key-btn" onClick={handleDeleteKey}>
          Delete Key
        </button>
      </div>
      
      {!isObject ? (
        <SchemaField
          path={selectedPath}
          value={currentValue}
          onChange={handleValueChange}
        />
      ) : (
        <div className="object-editor">
          <div className="add-key-section">
            <h4>Add Property</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Property Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Property name"
                />
              </div>
              <div className="form-group">
                <label>Value</label>
                <input
                  type="text"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="Value (JSON or string)"
                />
              </div>
              <button onClick={handleAddKey} disabled={!newKeyName.trim()}>
                Add Property
              </button>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="validation-errors">
          <h4>Validation Errors</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};