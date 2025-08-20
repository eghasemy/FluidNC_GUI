import React, { useEffect, useState } from 'react';
import { FluidNCConfig, MotorConfig, TMCConfig } from '@fluidnc-gui/core';

interface MotorsStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const MotorsStep: React.FC<MotorsStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const validateStep = () => {
    const newErrors: string[] = [];
    
    if (!config.axes || Object.keys(config.axes).length === 0) {
      newErrors.push('No axes configured. Please configure axes in the Mechanics step first.');
      setErrors(newErrors);
      onValidationChange(false);
      return false;
    }

    // Validate each axis has motor configuration
    Object.entries(config.axes).forEach(([axisName, axisConfig]) => {
      if (!axisConfig.motor0) {
        newErrors.push(`${axisName} axis: motor configuration is required`);
      } else {
        const motor = axisConfig.motor0;
        
        // Basic pin validation
        if (!motor.step_pin) {
          newErrors.push(`${axisName} axis motor: step_pin is required`);
        }
        if (!motor.direction_pin) {
          newErrors.push(`${axisName} axis motor: direction_pin is required`);
        }
        
        // TMC driver validation
        if (!motor.tmc_2130 && !motor.tmc_2209) {
          newErrors.push(`${axisName} axis motor: TMC driver configuration is required`);
        }
        
        if (motor.tmc_2130) {
          if (!motor.tmc_2130.cs_pin) {
            newErrors.push(`${axisName} axis TMC2130: cs_pin is required`);
          }
          if (!motor.tmc_2130.run_amps || motor.tmc_2130.run_amps <= 0) {
            newErrors.push(`${axisName} axis TMC2130: run_amps must be positive`);
          }
        }
        
        if (motor.tmc_2209) {
          if (!motor.tmc_2209.run_amps || motor.tmc_2209.run_amps <= 0) {
            newErrors.push(`${axisName} axis TMC2209: run_amps must be positive`);
          }
        }
      }
    });

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.axes, onValidationChange]);

  const handleMotorConfigChange = (
    axisName: string, 
    field: keyof MotorConfig, 
    value: string | number | boolean
  ) => {
    const newAxes = {
      ...config.axes,
      [axisName]: {
        ...config.axes?.[axisName],
        motor0: {
          ...config.axes?.[axisName]?.motor0,
          [field]: value,
        },
      },
    };
    onConfigChange({ axes: newAxes });
  };

  const handleTMCConfigChange = (
    axisName: string, 
    driverType: 'tmc_2130' | 'tmc_2209',
    field: keyof TMCConfig, 
    value: string | number | boolean
  ) => {
    const currentMotor = config.axes?.[axisName]?.motor0 || {};
    const newAxes = {
      ...config.axes,
      [axisName]: {
        ...config.axes?.[axisName],
        motor0: {
          ...currentMotor,
          [driverType]: {
            ...currentMotor[driverType],
            [field]: value,
          },
        },
      },
    };
    onConfigChange({ axes: newAxes });
  };

  const handleDriverTypeChange = (axisName: string, driverType: 'tmc_2130' | 'tmc_2209') => {
    const currentMotor = config.axes?.[axisName]?.motor0 || {};
    const newMotor = { ...currentMotor };
    
    // Clear both driver configs
    delete newMotor.tmc_2130;
    delete newMotor.tmc_2209;
    
    // Set default config for selected driver
    newMotor[driverType] = {
      run_amps: 1.0,
      microsteps: 16,
      ...(driverType === 'tmc_2130' && { cs_pin: '' }),
    };

    const newAxes = {
      ...config.axes,
      [axisName]: {
        ...config.axes?.[axisName],
        motor0: newMotor,
      },
    };
    onConfigChange({ axes: newAxes });
  };

  const ensureMotorConfig = (axisName: string) => {
    if (!config.axes?.[axisName]?.motor0) {
      const newAxes = {
        ...config.axes,
        [axisName]: {
          ...config.axes?.[axisName],
          motor0: {
            step_pin: '',
            direction_pin: '',
            disable_pin: '',
            tmc_2130: {
              cs_pin: '',
              run_amps: 1.0,
              microsteps: 16,
            },
          },
        },
      };
      onConfigChange({ axes: newAxes });
    }
  };

  if (!config.axes || Object.keys(config.axes).length === 0) {
    return (
      <div className="motors-step">
        <div className="validation-summary invalid">
          <h4>No axes configured</h4>
          <p>Please configure your machine axes in the Mechanics step before setting up motors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="motors-step">
      <p>Configure the stepper motors and drivers for each axis.</p>
      
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
          <h4>✓ Motor configuration is valid</h4>
        </div>
      )}

      {Object.entries(config.axes).map(([axisName, axisConfig]) => {
        const motorConfig = axisConfig.motor0;
        const hasTMC2130 = !!motorConfig?.tmc_2130;
        const hasTMC2209 = !!motorConfig?.tmc_2209;
        const currentDriverType = hasTMC2130 ? 'tmc_2130' : hasTMC2209 ? 'tmc_2209' : null;

        // Ensure motor config exists
        if (!motorConfig) {
          ensureMotorConfig(axisName);
          return null;
        }

        return (
          <div key={axisName} className="motor-configuration">
            <h3>{axisName.toUpperCase()} Axis Motor</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Step Pin *</label>
                <input
                  type="text"
                  value={motorConfig?.step_pin || ''}
                  onChange={(e) => handleMotorConfigChange(axisName, 'step_pin', e.target.value)}
                  placeholder="gpio.1"
                />
                <div className="help-text">GPIO pin for step signal</div>
              </div>

              <div className="form-group">
                <label>Direction Pin *</label>
                <input
                  type="text"
                  value={motorConfig?.direction_pin || ''}
                  onChange={(e) => handleMotorConfigChange(axisName, 'direction_pin', e.target.value)}
                  placeholder="gpio.2"
                />
                <div className="help-text">GPIO pin for direction signal</div>
              </div>

              <div className="form-group">
                <label>Disable Pin</label>
                <input
                  type="text"
                  value={motorConfig?.disable_pin || ''}
                  onChange={(e) => handleMotorConfigChange(axisName, 'disable_pin', e.target.value)}
                  placeholder="gpio.3"
                />
                <div className="help-text">GPIO pin to disable motor (optional)</div>
              </div>
            </div>

            <div className="form-group">
              <label>TMC Driver Type *</label>
              <select
                value={currentDriverType || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDriverTypeChange(axisName, e.target.value as 'tmc_2130' | 'tmc_2209');
                  }
                }}
              >
                <option value="">Select TMC Driver</option>
                <option value="tmc_2130">TMC2130 (SPI)</option>
                <option value="tmc_2209">TMC2209 (UART)</option>
              </select>
              <div className="help-text">Choose your TMC stepper driver type</div>
            </div>

            {currentDriverType && (
              <div className="tmc-configuration">
                <h4>TMC{currentDriverType === 'tmc_2130' ? '2130' : '2209'} Configuration</h4>
                
                {currentDriverType === 'tmc_2130' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>CS Pin *</label>
                      <input
                        type="text"
                        value={motorConfig.tmc_2130?.cs_pin || ''}
                        onChange={(e) => handleTMCConfigChange(axisName, 'tmc_2130', 'cs_pin', e.target.value)}
                        placeholder="gpio.4"
                      />
                      <div className="help-text">Chip select pin for SPI communication</div>
                    </div>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Run Current (A) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="3.0"
                      value={motorConfig[currentDriverType]?.run_amps || ''}
                      onChange={(e) => 
                        handleTMCConfigChange(axisName, currentDriverType, 'run_amps', parseFloat(e.target.value) || 0)
                      }
                      placeholder="1.0"
                    />
                    <div className="help-text">Motor current in amps (check motor specifications)</div>
                  </div>

                  <div className="form-group">
                    <label>Microsteps</label>
                    <select
                      value={motorConfig[currentDriverType]?.microsteps || '16'}
                      onChange={(e) => 
                        handleTMCConfigChange(axisName, currentDriverType, 'microsteps', parseInt(e.target.value) || 16)
                      }
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="8">8</option>
                      <option value="16">16</option>
                      <option value="32">32</option>
                      <option value="64">64</option>
                      <option value="128">128</option>
                      <option value="256">256</option>
                    </select>
                    <div className="help-text">Microstepping resolution</div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Hold Current (A)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="3.0"
                      value={motorConfig[currentDriverType]?.hold_amps || ''}
                      onChange={(e) => 
                        handleTMCConfigChange(axisName, currentDriverType, 'hold_amps', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.5"
                    />
                    <div className="help-text">Current when motor is holding position (optional)</div>
                  </div>

                  <div className="form-group">
                    <label>R Sense (Ohms)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={motorConfig[currentDriverType]?.r_sense_ohms || ''}
                      onChange={(e) => 
                        handleTMCConfigChange(axisName, currentDriverType, 'r_sense_ohms', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.11"
                    />
                    <div className="help-text">Sense resistor value (check driver board)</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};