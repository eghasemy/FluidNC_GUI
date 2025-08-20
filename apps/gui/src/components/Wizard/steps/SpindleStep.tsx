import React, { useEffect, useState } from 'react';
import { FluidNCConfig, SpindleConfig, SpindleType, validateSpindleConfig, validateSpeedMap } from '@fluidnc-gui/core';
import { SpeedMapEditor } from '../SpeedMapEditor';

interface SpindleStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const SpindleStep: React.FC<SpindleStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [spindleEnabled, setSpindleEnabled] = useState<boolean>(!!config.spindle);

  const validateStep = () => {
    const newErrors: string[] = [];
    
    if (spindleEnabled) {
      if (!config.spindle) {
        newErrors.push('Spindle configuration is required when spindle is enabled');
      } else {
        const validation = validateSpindleConfig(config.spindle);
        if (!validation.success) {
          validation.errors.issues.forEach((issue) => {
            newErrors.push(`Spindle: ${issue.message}`);
          });
        }

        // Additional validation
        if (config.spindle.pwm_hz && config.spindle.pwm_hz <= 0) {
          newErrors.push('PWM frequency must be positive');
        }
        
        if (!config.spindle.output_pin) {
          newErrors.push('Output pin is required for spindle control');
        }

        // Validate speed map if provided
        if (config.spindle.speed_map && config.spindle.speed_map.trim() !== '') {
          const speedMapValidation = validateSpeedMap(config.spindle.speed_map);
          if (!speedMapValidation.valid) {
            newErrors.push(`Speed map: ${speedMapValidation.error}`);
          }
        }
      }
    }

    setErrors(newErrors);
    // Always valid if spindle is disabled, otherwise check for no errors
    const isValid = !spindleEnabled || newErrors.length === 0;
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.spindle, spindleEnabled, onValidationChange]);

  const handleSpindleToggle = (enabled: boolean) => {
    setSpindleEnabled(enabled);
    if (enabled) {
      // Initialize default spindle config
      onConfigChange({
        spindle: {
          type: 'PWM',
          pwm_hz: 1000,
          output_pin: '',
          enable_pin: '',
          direction_pin: '',
          speed_map: '',
          spinup_ms: 1000,
          spindown_ms: 1000,
          tool_num: 0,
          off_on_alarm: true,
        },
      });
    } else {
      // Remove spindle config
      const newConfig = { ...config };
      delete newConfig.spindle;
      onConfigChange(newConfig);
    }
  };

  const handleSpindleConfigChange = (field: keyof SpindleConfig, value: string | number | boolean) => {
    const newSpindle = {
      ...config.spindle,
      [field]: value,
    };
    onConfigChange({ spindle: newSpindle });
  };

  return (
    <div className="spindle-step">
      <p>Configure spindle control for your machine. This is optional - skip if your machine doesn&apos;t have a spindle.</p>
      
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
          <h4>✓ Spindle configuration is valid</h4>
        </div>
      )}

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={spindleEnabled}
            onChange={(e) => handleSpindleToggle(e.target.checked)}
          />
          Enable Spindle Control
        </label>
        <div className="help-text">
          Check this if your machine has a spindle or router that needs to be controlled
        </div>
      </div>

      {spindleEnabled && (
        <div className="spindle-configuration">
          <h3>Spindle Configuration</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>Spindle Type *</label>
              <select
                value={config.spindle?.type || 'PWM'}
                onChange={(e) => handleSpindleConfigChange('type', e.target.value as SpindleType)}
              >
                <option value="PWM">PWM (Variable Speed)</option>
                <option value="Relay">Relay (On/Off)</option>
                <option value="DAC">DAC (Analog)</option>
                <option value="RS485">RS485 (Modbus)</option>
              </select>
              <div className="help-text">
                Select the type of spindle control interface
              </div>
            </div>

            <div className="form-group">
              <label>Output Pin *</label>
              <input
                type="text"
                value={config.spindle?.output_pin || ''}
                onChange={(e) => handleSpindleConfigChange('output_pin', e.target.value)}
                placeholder="gpio.25"
              />
              <div className="help-text">
                GPIO pin for {config.spindle?.type === 'PWM' ? 'PWM speed control signal' : 
                            config.spindle?.type === 'Relay' ? 'relay control' :
                            config.spindle?.type === 'DAC' ? 'DAC output' : 'RS485 communication'}
              </div>
            </div>
          </div>

          {config.spindle?.type === 'PWM' && (
            <div className="form-row">
              <div className="form-group">
                <label>PWM Frequency (Hz)</label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  value={config.spindle?.pwm_hz || ''}
                  onChange={(e) => 
                    handleSpindleConfigChange('pwm_hz', parseInt(e.target.value) || 0)
                  }
                  placeholder="1000"
                />
                <div className="help-text">
                  PWM frequency for speed control (typically 1000Hz)
                </div>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Enable Pin</label>
              <input
                type="text"
                value={config.spindle?.enable_pin || ''}
                onChange={(e) => handleSpindleConfigChange('enable_pin', e.target.value)}
                placeholder="gpio.26"
              />
              <div className="help-text">
                GPIO pin to enable/disable spindle (optional)
              </div>
            </div>

            <div className="form-group">
              <label>Direction Pin</label>
              <input
                type="text"
                value={config.spindle?.direction_pin || ''}
                onChange={(e) => handleSpindleConfigChange('direction_pin', e.target.value)}
                placeholder="gpio.27"
              />
              <div className="help-text">
                GPIO pin for spindle direction control (optional)
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Spinup Time (ms)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={config.spindle?.spinup_ms || ''}
                onChange={(e) => 
                  handleSpindleConfigChange('spinup_ms', parseInt(e.target.value) || 0)
                }
                placeholder="1000"
              />
              <div className="help-text">
                Time to wait for spindle to reach speed
              </div>
            </div>

            <div className="form-group">
              <label>Spindown Time (ms)</label>
              <input
                type="number"
                step="100"
                min="0"
                value={config.spindle?.spindown_ms || ''}
                onChange={(e) => 
                  handleSpindleConfigChange('spindown_ms', parseInt(e.target.value) || 0)
                }
                placeholder="1000"
              />
              <div className="help-text">
                Time to wait for spindle to stop
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tool Number</label>
              <input
                type="number"
                step="1"
                min="0"
                value={config.spindle?.tool_num || ''}
                onChange={(e) => 
                  handleSpindleConfigChange('tool_num', parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />
              <div className="help-text">
                Tool number associated with this spindle
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.spindle?.off_on_alarm ?? true}
                  onChange={(e) => handleSpindleConfigChange('off_on_alarm', e.target.checked)}
                />
                Turn Off on Alarm
              </label>
              <div className="help-text">
                Automatically turn off spindle when alarm occurs
              </div>
            </div>
          </div>

          <SpeedMapEditor
            value={config.spindle?.speed_map || ''}
            onChange={(value) => handleSpindleConfigChange('speed_map', value)}
          />

          <div className="spindle-info">
            <h4>Spindle Control Information</h4>
            <p>
              <strong>PWM Control:</strong> The output pin will generate a PWM signal proportional to the requested spindle speed.
              The PWM frequency should match your spindle controller requirements.
            </p>
            <p>
              <strong>Enable Pin:</strong> Use this if your spindle controller has a separate enable input.
              This pin will be set high when the spindle should run.
            </p>
            <p>
              <strong>Direction Pin:</strong> Use this if your spindle can reverse direction.
              This pin controls clockwise/counterclockwise rotation.
            </p>
            <p>
              <strong>Speed Map:</strong> Define custom speed curves if your spindle doesn&apos;t have a linear RPM to PWM relationship.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};