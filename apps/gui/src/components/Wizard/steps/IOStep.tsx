import React, { useEffect, useState } from 'react';
import { FluidNCConfig, IOConfig } from '@fluidnc-gui/core';

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

  const validateStep = () => {
    const newErrors: string[] = [];
    
    // IO configuration is mostly optional, so validation is minimal
    // Just check for valid GPIO pin format if provided
    if (config.io) {
      const pinFields: (keyof IOConfig)[] = [
        'probe_pin', 'flood_pin', 'mist_pin', 
        'macro0_pin', 'macro1_pin', 'macro2_pin', 'macro3_pin'
      ];
      
      pinFields.forEach(field => {
        const pin = config.io?.[field];
        if (pin && typeof pin === 'string' && pin.trim() !== '') {
          // Basic GPIO pin validation
          if (!pin.match(/^gpio\.\d+$/i) && !pin.match(/^i2so\.\d+$/i) && !pin.match(/^i2si\.\d+$/i)) {
            newErrors.push(`${field}: Invalid GPIO pin format. Use format like 'gpio.25'`);
          }
        }
      });
    }

    setErrors(newErrors);
    // IO step is always valid since all configurations are optional
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

      {errors.length === 0 && (
        <div className="validation-summary valid">
          <h4>✓ IO configuration is valid</h4>
        </div>
      )}

      <div className="io-configuration">
        <h3>Probe Configuration</h3>
        <div className="form-group">
          <label>Probe Pin</label>
          <input
            type="text"
            value={config.io?.probe_pin || ''}
            onChange={(e) => handleIOConfigChange('probe_pin', e.target.value)}
            placeholder="gpio.32"
          />
          <div className="help-text">
            GPIO pin for tool length probe or touch probe input
          </div>
        </div>

        <h3>Coolant Control</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Flood Coolant Pin</label>
            <input
              type="text"
              value={config.io?.flood_pin || ''}
              onChange={(e) => handleIOConfigChange('flood_pin', e.target.value)}
              placeholder="gpio.16"
            />
            <div className="help-text">
              GPIO pin to control flood coolant pump
            </div>
          </div>

          <div className="form-group">
            <label>Mist Coolant Pin</label>
            <input
              type="text"
              value={config.io?.mist_pin || ''}
              onChange={(e) => handleIOConfigChange('mist_pin', e.target.value)}
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
            <label>Macro 0 Pin</label>
            <input
              type="text"
              value={config.io?.macro0_pin || ''}
              onChange={(e) => handleIOConfigChange('macro0_pin', e.target.value)}
              placeholder="gpio.33"
            />
            <div className="help-text">
              GPIO pin for macro button 0
            </div>
          </div>

          <div className="form-group">
            <label>Macro 1 Pin</label>
            <input
              type="text"
              value={config.io?.macro1_pin || ''}
              onChange={(e) => handleIOConfigChange('macro1_pin', e.target.value)}
              placeholder="gpio.34"
            />
            <div className="help-text">
              GPIO pin for macro button 1
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Macro 2 Pin</label>
            <input
              type="text"
              value={config.io?.macro2_pin || ''}
              onChange={(e) => handleIOConfigChange('macro2_pin', e.target.value)}
              placeholder="gpio.35"
            />
            <div className="help-text">
              GPIO pin for macro button 2
            </div>
          </div>

          <div className="form-group">
            <label>Macro 3 Pin</label>
            <input
              type="text"
              value={config.io?.macro3_pin || ''}
              onChange={(e) => handleIOConfigChange('macro3_pin', e.target.value)}
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