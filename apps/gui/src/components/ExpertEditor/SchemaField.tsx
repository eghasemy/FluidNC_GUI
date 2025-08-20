import React, { useState } from 'react';

export interface SchemaFieldProps {
  path: string[];
  value: unknown;
  onChange: (value: unknown) => void;
}

export const SchemaField: React.FC<SchemaFieldProps> = ({
  path,
  value,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState(String(value ?? ''));

  const fieldName = path[path.length - 1] || 'unknown';
  const valueType = typeof value;

  const handleChange = (newValue: string) => {
    setInputValue(newValue);
    
    // Try to determine the appropriate type based on the field name and current value
    let parsedValue: unknown = newValue;
    
    // If original value was a boolean
    if (valueType === 'boolean') {
      parsedValue = newValue.toLowerCase() === 'true';
    }
    // If original value was a number or field suggests number
    else if (valueType === 'number' || 
             fieldName.includes('rate') || 
             fieldName.includes('acceleration') || 
             fieldName.includes('steps') ||
             fieldName.includes('mm') ||
             fieldName.includes('ms') ||
             fieldName.includes('amps') ||
             fieldName.includes('cycle')) {
      const numValue = Number(newValue);
      if (!isNaN(numValue)) {
        parsedValue = numValue;
      }
    }
    // If it looks like JSON, try to parse it
    else if (newValue.startsWith('{') || newValue.startsWith('[')) {
      try {
        parsedValue = JSON.parse(newValue);
      } catch {
        // Keep as string if JSON parsing fails
      }
    }
    
    onChange(parsedValue);
  };

  const getFieldHint = (): string => {
    // Provide hints based on field names
    if (fieldName.includes('pin')) {
      return 'GPIO pin (e.g., gpio.1, gpio.2)';
    }
    if (fieldName.includes('rate')) {
      return 'Rate in mm/min';
    }
    if (fieldName.includes('acceleration')) {
      return 'Acceleration in mm/sec²';
    }
    if (fieldName.includes('steps')) {
      return 'Steps per mm';
    }
    if (fieldName.includes('amps')) {
      return 'Current in amperes';
    }
    if (fieldName.includes('baud')) {
      return 'Baud rate (e.g., 115200)';
    }
    if (fieldName.includes('cycle')) {
      return 'Cycle number (1-10)';
    }
    if (valueType === 'boolean') {
      return 'Boolean value (true/false)';
    }
    if (valueType === 'number') {
      return 'Numeric value';
    }
    return 'Text value';
  };

  const renderInput = () => {
    if (valueType === 'boolean') {
      return (
        <select
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (fieldName === 'run_mode') {
      return (
        <select
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Select mode...</option>
          <option value="StealthChop">StealthChop</option>
          <option value="CoolStep">CoolStep</option>
          <option value="StallGuard">StallGuard</option>
        </select>
      );
    }

    if (fieldName.includes('direction') && fieldName.includes('positive')) {
      return (
        <select
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="true">Positive Direction</option>
          <option value="false">Negative Direction</option>
        </select>
      );
    }

    // Default to text input
    return (
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={`Enter ${fieldName}`}
      />
    );
  };

  return (
    <div className="schema-field">
      <div className="form-group">
        <label>{fieldName}</label>
        {renderInput()}
        <div className="help-text">
          {getFieldHint()}
        </div>
        <div className="type-info">
          Current type: <code>{valueType}</code>
          {value !== null && value !== undefined && (
            <span> | Current value: <code>{JSON.stringify(value)}</code></span>
          )}
        </div>
      </div>
    </div>
  );
};