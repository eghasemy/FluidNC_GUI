import React, { useEffect, useState } from 'react';
import { FluidNCConfig, IOConfig } from '@fluidnc-gui/core';
import { PinInput } from '../../PinInput';
import { usePinManager } from '../../../hooks/usePinManager';

interface IOStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const IOStep: React.FC<IOStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const pinManager = usePinManager(config);

  const validateStep = () => {
    const newErrors: string[] = [];
    
    // Check for pin conflicts
    if (pinManager.hasPinConflicts) {
      Object.entries(pinManager.pinConflicts).forEach(([pin, usedBy]) => {
        const usedByArray = Array.isArray(usedBy) ? usedBy : [usedBy];
        newErrors.push(`Pin ${pin} is used by multiple fields: ${usedByArray.join(', ')}`);
      });
    }
    
    // Check individual pin validity
    if (config.io) {
      const pinFields: (keyof IOConfig)[] = [
        'probe_pin', 'flood_pin', 'mist_pin', 
        'macro0_pin', 'macro1_pin', 'macro2_pin', 'macro3_pin'
      ];
      
      pinFields.forEach(field => {
        const pin = config.io?.[field];
        if (pin && typeof pin === 'string' && pin.trim() !== '') {
          const validation = pinManager.validatePinAssignment(pin, `io.${field}`);
          if (!validation.isValid) {
            newErrors.push(`${field}: ${validation.errors[0]}`);
          }
        }
      });
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.io, onValidationChange]);

  const handleIOConfigChange = (field: keyof IOConfig, value: string) => {
    const newIO = {
      ...config.io,
      [field]: value || undefined, // Remove empty strings
    };
    
    // Clean up empty values
    Object.keys(newIO).forEach(key => {
      if (!newIO[key as keyof IOConfig]) {
        delete newIO[key as keyof IOConfig];
      }
    });
    
    onConfigChange({ io: Object.keys(newIO).length > 0 ? newIO : {} });
  };

  return (
    <div className="io-step">
      <p>Configure input/output pins for probes, coolant, and macro functions. All settings are optional.</p>
      
      {pinManager.hasPinConflicts && (
        <div className="validation-summary invalid">
          <h4>⚠ Pin Conflicts Detected</h4>
          <ul>
            {Object.entries(pinManager.pinConflicts).map(([pin, usedBy]) => {
              const usedByArray = Array.isArray(usedBy) ? usedBy : [usedBy];
              return (
                <li key={pin}>
                  <strong>{pin}</strong> is used by: {usedByArray.join(', ')}
                </li>
              );
            })}
          </ul>
          <p>Please change one of the conflicting assignments to resolve this issue.</p>
        </div>
      )}
      
      {errors.length > 0 && (
        <div className="validation-summary invalid">
          <h4>Please fix the following issues:</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {errors.length === 0 && !pinManager.hasPinConflicts && (
        <div className="validation-summary valid">
          <h4>✓ IO configuration is valid</h4>
          {pinManager.boardDescriptor && (
            <p>Board: {pinManager.boardDescriptor.name}</p>
          )}
        </div>
      )}

      <div className="io-configuration">
        <h3>Probe Configuration</h3>
        <div className="form-group">
          <PinInput
            label="Probe Pin"
            value={config.io?.probe_pin || ''}
            onChange={(value) => handleIOConfigChange('probe_pin', value)}
            config={config}
            sourceField="io.probe_pin"
            placeholder="gpio.32"
          />
          <div className="help-text">
            GPIO pin for tool length probe or touch probe input
          </div>
        </div>

        <h3>Coolant Control</h3>
        <div className="form-row">
          <div className="form-group">
            <PinInput
              label="Flood Coolant Pin"
              value={config.io?.flood_pin || ''}
              onChange={(value) => handleIOConfigChange('flood_pin', value)}
              config={config}
              sourceField="io.flood_pin"
              placeholder="gpio.16"
            />
            <div className="help-text">
              GPIO pin to control flood coolant pump
            </div>
          </div>

          <div className="form-group">
            <PinInput
              label="Mist Coolant Pin"
              value={config.io?.mist_pin || ''}
              onChange={(value) => handleIOConfigChange('mist_pin', value)}
              config={config}
              sourceField="io.mist_pin"
              placeholder="gpio.17"
            />
            <div className="help-text">
              GPIO pin to control mist coolant system
            </div>
          </div>
        </div>

        <h3>Macro Buttons</h3>
        <p>Configure pins for macro buttons that can trigger custom G-code sequences.</p>
        
        <div className="form-row">
          <div className="form-group">
            <PinInput
              label="Macro 0 Pin"
              value={config.io?.macro0_pin || ''}
              onChange={(value) => handleIOConfigChange('macro0_pin', value)}
              config={config}
              sourceField="io.macro0_pin"
              placeholder="gpio.33"
            />
            <div className="help-text">
              GPIO pin for macro button 0
            </div>
          </div>

          <div className="form-group">
            <PinInput
              label="Macro 1 Pin"
              value={config.io?.macro1_pin || ''}
              onChange={(value) => handleIOConfigChange('macro1_pin', value)}
              config={config}
              sourceField="io.macro1_pin"
              placeholder="gpio.34"
            />
            <div className="help-text">
              GPIO pin for macro button 1
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <PinInput
              label="Macro 2 Pin"
              value={config.io?.macro2_pin || ''}
              onChange={(value) => handleIOConfigChange('macro2_pin', value)}
              config={config}
              sourceField="io.macro2_pin"
              placeholder="gpio.35"
            />
            <div className="help-text">
              GPIO pin for macro button 2
            </div>
          </div>

          <div className="form-group">
            <PinInput
              label="Macro 3 Pin"
              value={config.io?.macro3_pin || ''}
              onChange={(value) => handleIOConfigChange('macro3_pin', value)}
              config={config}
              sourceField="io.macro3_pin"
              placeholder="gpio.36"
            />
            <div className="help-text">
              GPIO pin for macro button 3
            </div>
          </div>
        </div>

        <div className="io-info">
          <h4>GPIO Pin Information</h4>
          <p>
            <strong>Pin Format:</strong> Use the format &apos;gpio.XX&apos; where XX is the GPIO number (e.g., &apos;gpio.25&apos;).
            You can also use I2S pins with &apos;i2so.XX&apos; (output) or &apos;i2si.XX&apos; (input) format.
          </p>
          <p>
            <strong>Probe Pin:</strong> Connect your touch probe, tool setter, or Z-probe to this input.
            Make sure to use appropriate pull-up/pull-down resistors.
          </p>
          <p>
            <strong>Coolant Pins:</strong> These control relays or solid-state switches for coolant pumps.
            Flood coolant is typically used for cutting operations, while mist coolant is for lighter duty.
          </p>
          <p>
            <strong>Macro Pins:</strong> Connect momentary switches to these pins to trigger predefined G-code macros.
            Useful for functions like tool changes, part probing, or custom routines.
          </p>
          <p>
            <strong>Note:</strong> All IO configurations are optional. Only configure pins that you actually plan to use.
            Unused pins should be left empty.
          </p>
        </div>
      </div>
    </div>
  );
};