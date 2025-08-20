import React, { useState, useEffect } from 'react';
import { SpeedMapEntry, parseSpeedMap, validateSpeedMap, formatSpeedMap } from '@fluidnc-gui/core';
import './SpeedMapEditor.css';

interface SpeedMapEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SpeedMapEditor: React.FC<SpeedMapEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [entries, setEntries] = useState<SpeedMapEntry[]>([]);
  const [error, setError] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);

  // Parse the value when it changes externally
  useEffect(() => {
    const parseResult = parseSpeedMap(value);
    if (parseResult.success) {
      setEntries(parseResult.entries);
      setError('');
      setIsValid(true);
    } else {
      setError(parseResult.error);
      setIsValid(false);
    }
  }, [value]);

  const handleEntryChange = (index: number, field: 'rpm' | 'pwm', newValue: string) => {
    const numericValue = parseFloat(newValue);
    if (isNaN(numericValue) && newValue !== '') {
      return; // Don't update if it's not a valid number
    }

    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: newValue === '' ? 0 : numericValue,
    };

    setEntries(newEntries);
    updateValue(newEntries);
  };

  const addEntry = () => {
    const newEntries = [...entries, { rpm: 0, pwm: 0 }];
    setEntries(newEntries);
    updateValue(newEntries);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    updateValue(newEntries);
  };

  const updateValue = (newEntries: SpeedMapEntry[]) => {
    const formattedValue = formatSpeedMap(newEntries);
    
    // Validate the new value
    const validation = validateSpeedMap(formattedValue);
    if (validation.valid) {
      setError('');
      setIsValid(true);
    } else {
      setError(validation.error);
      setIsValid(false);
    }

    onChange(formattedValue);
  };

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    onChange(newValue);
  };

  return (
    <div className="speed-map-editor">
      <div className="speed-map-editor-header">
        <label>Speed Map</label>
        <div className="speed-map-validation">
          {isValid ? (
            <span className="validation-success">✓ Valid monotonic mapping</span>
          ) : (
            <span className="validation-error">⚠ {error}</span>
          )}
        </div>
      </div>

      <div className="speed-map-table">
        <div className="speed-map-table-header">
          <span>RPM</span>
          <span>PWM %</span>
          <span>Actions</span>
        </div>

        {entries.map((entry, index) => (
          <div key={index} className="speed-map-entry">
            <input
              type="number"
              value={entry.rpm}
              onChange={(e) => handleEntryChange(index, 'rpm', e.target.value)}
              placeholder="RPM"
              min="0"
              step="1"
              disabled={disabled}
            />
            <input
              type="number"
              value={entry.pwm}
              onChange={(e) => handleEntryChange(index, 'pwm', e.target.value)}
              placeholder="PWM %"
              min="0"
              max="100"
              step="0.1"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={() => removeEntry(index)}
              disabled={disabled}
              className="remove-entry-btn"
              title="Remove entry"
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          disabled={disabled}
          className="add-entry-btn"
        >
          + Add Speed Map Entry
        </button>
      </div>

      <div className="speed-map-text-editor">
        <label>Raw Speed Map (Advanced)</label>
        <textarea
          value={value}
          onChange={handleTextareaChange}
          placeholder="0=0% 1000=50% 2000=100%"
          rows={3}
          disabled={disabled}
        />
        <div className="help-text">
          Format: RPM=PWM% pairs separated by spaces. Map must be monotonic (higher RPM = higher or equal PWM).
        </div>
      </div>

      {!isValid && (
        <div className="speed-map-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="speed-map-info">
        <h4>Speed Map Information</h4>
        <p>
          <strong>Monotonic Requirement:</strong> The speed map must be monotonic, meaning that as RPM increases, 
          the PWM percentage must not decrease. This ensures predictable spindle behavior.
        </p>
        <p>
          <strong>Usage:</strong> Speed maps allow you to define custom curves for spindles that don't have 
          a linear RPM-to-PWM relationship. This is common with VFDs and some spindle controllers.
        </p>
      </div>
    </div>
  );
};