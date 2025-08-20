import React from 'react';
import { usePinManager } from '../../hooks/usePinManager';
import { FluidNCConfig } from '@fluidnc-gui/core';
import './PinInput.css';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  config: FluidNCConfig;
  sourceField: string;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  config,
  sourceField,
  placeholder = 'gpio.XX',
  label,
  disabled = false
}) => {
  const pinManager = usePinManager(config);
  
  const statusClass = pinManager.getPinStatusClass(value, sourceField);
  const statusMessage = pinManager.getPinStatusMessage(value, sourceField);
  const validation = pinManager.validatePinAssignment(value, sourceField);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Block invalid assignments
    if (newValue && newValue.trim()) {
      const validation = pinManager.validatePinAssignment(newValue, sourceField);
      if (!validation.isValid) {
        // Don't update if the assignment would be invalid
        return;
      }
    }
    
    onChange(newValue);
  };

  return (
    <div className="pin-input-container">
      {label && <label className="pin-input-label">{label}</label>}
      <div className="pin-input-wrapper">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`pin-input ${statusClass} ${!validation.isValid ? 'invalid' : ''}`}
        />
        <div className={`pin-status-indicator ${statusClass}`}>
          {value && (
            <span className="pin-status-icon">
              {statusClass === 'pin-status-available' && '✓'}
              {statusClass === 'pin-status-used' && '●'}
              {statusClass === 'pin-status-conflict' && '⚠'}
              {statusClass === 'pin-status-invalid' && '✗'}
            </span>
          )}
        </div>
      </div>
      {value && statusMessage && (
        <div className={`pin-status-message ${statusClass}`}>
          {statusMessage}
        </div>
      )}
      {!validation.isValid && (
        <div className="pin-validation-error">
          {validation.errors[0]}
        </div>
      )}
    </div>
  );
};