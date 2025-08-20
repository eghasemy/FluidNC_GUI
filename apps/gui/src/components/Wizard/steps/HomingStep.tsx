import React, { useEffect, useState } from 'react';
import { FluidNCConfig, HomingConfig, validateHomingRates, AxisValidationContext } from '@fluidnc-gui/core';

interface HomingStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const HomingStep: React.FC<HomingStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [enabledAxes, setEnabledAxes] = useState<string[]>([]);

  const validateStep = () => {
    const newErrors: string[] = [];
    
    if (!config.axes || Object.keys(config.axes).length === 0) {
      newErrors.push('No axes configured. Please configure axes in the Mechanics step first.');
      setErrors(newErrors);
      onValidationChange(false);
      return false;
    }

    // Validate global homing configuration
    if (config.homing?.cycle && config.homing.cycle.length === 0) {
      newErrors.push('At least one homing cycle must be defined if homing is enabled');
    }

    // Validate each axis homing configuration
    Object.entries(config.axes).forEach(([axisName, axisConfig]) => {
      if (enabledAxes.includes(axisName) && axisConfig.homing) {
        const homing = axisConfig.homing;
        
        if (homing.cycle === undefined || homing.cycle < 0 || homing.cycle > 10) {
          newErrors.push(`${axisName} axis: homing cycle must be between 0 and 10`);
        }
        
        if (homing.feed_mm_per_min && homing.feed_mm_per_min <= 0) {
          newErrors.push(`${axisName} axis: homing feed rate must be positive`);
        }
        
        if (homing.seek_mm_per_min && homing.seek_mm_per_min <= 0) {
          newErrors.push(`${axisName} axis: homing seek rate must be positive`);
        }

        // Cross-field validation using core validation functions
        const context: AxisValidationContext = {
          axis: axisConfig,
          motorConfig: axisConfig.motor0,
          tmcConfig: axisConfig.motor0?.tmc_2130 || axisConfig.motor0?.tmc_2209,
        };
        
        const homingValidation = validateHomingRates(context);
        if (!homingValidation.valid && homingValidation.message) {
          newErrors.push(`${axisName} axis: ${homingValidation.message}`);
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
  }, [config, enabledAxes, onValidationChange]);

  const handleGlobalHomingChange = (field: keyof NonNullable<FluidNCConfig['homing']>, value: boolean | number | number[]) => {
    const newHoming = {
      ...config.homing,
      [field]: value,
    };
    onConfigChange({ homing: newHoming });
  };

  const handleAxisHomingToggle = (axisName: string) => {
    const newEnabledAxes = enabledAxes.includes(axisName)
      ? enabledAxes.filter(name => name !== axisName)
      : [...enabledAxes, axisName];
    
    setEnabledAxes(newEnabledAxes);
    
    const newAxes = { ...config.axes };
    if (newEnabledAxes.includes(axisName)) {
      newAxes[axisName] = {
        ...newAxes[axisName],
        homing: {
          cycle: 1,
          positive_direction: false,
          mpos_mm: 0,
          feed_mm_per_min: 100,
          seek_mm_per_min: 1000,
          debounce_ms: 500,
          seek_scaler: 1.1,
          feed_scaler: 1.1,
        },
      };
    } else {
      if (newAxes[axisName]) {
        delete newAxes[axisName].homing;
      }
    }
    
    onConfigChange({ axes: newAxes });
  };

  const handleAxisHomingChange = (
    axisName: string, 
    field: keyof HomingConfig, 
    value: number | boolean
  ) => {
    const newAxes = {
      ...config.axes,
      [axisName]: {
        ...config.axes?.[axisName],
        homing: {
          ...config.axes?.[axisName]?.homing,
          [field]: value,
        },
      },
    };
    onConfigChange({ axes: newAxes });
  };

  if (!config.axes || Object.keys(config.axes).length === 0) {
    return (
      <div className="homing-step">
        <div className="validation-summary invalid">
          <h4>No axes configured</h4>
          <p>Please configure your machine axes in the Mechanics step before setting up homing.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="homing-step">
      <p>Configure homing behavior for your machine axes. Homing allows the machine to find its reference position.</p>
      
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
          <h4>✓ Homing configuration is valid</h4>
        </div>
      )}

      <div className="global-homing-config">
        <h3>Global Homing Settings</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.homing?.must_home_first ?? false}
                onChange={(e) => handleGlobalHomingChange('must_home_first', e.target.checked)}
              />
              Must Home First
            </label>
            <div className="help-text">
              Require homing before any movement commands
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.homing?.allow_single_axis ?? false}
                onChange={(e) => handleGlobalHomingChange('allow_single_axis', e.target.checked)}
              />
              Allow Single Axis Homing
            </label>
            <div className="help-text">
              Allow homing individual axes
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Homing Depart Distance (mm)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={config.homing?.depart_mm || ''}
            onChange={(e) => 
              handleGlobalHomingChange('depart_mm', parseFloat(e.target.value) || 0)
            }
            placeholder="1.0"
          />
          <div className="help-text">
            Distance to move away from home switch after homing
          </div>
        </div>
      </div>

      <div className="axis-homing-config">
        <h3>Axis Homing Configuration</h3>
        
        <div className="form-group">
          <label>Enable Homing for Axes</label>
          <div className="axis-selection">
            {Object.keys(config.axes).map((axisName) => (
              <label key={axisName} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enabledAxes.includes(axisName)}
                  onChange={() => handleAxisHomingToggle(axisName)}
                />
                {axisName.toUpperCase()} Axis
              </label>
            ))}
          </div>
          <div className="help-text">
            Select which axes should have homing enabled
          </div>
        </div>

        {enabledAxes.map((axisName) => {
          const homingConfig = config.axes?.[axisName]?.homing;
          return (
            <div key={axisName} className="axis-homing-configuration">
              <h4>{axisName.toUpperCase()} Axis Homing</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Homing Cycle</label>
                  <select
                    value={homingConfig?.cycle || '1'}
                    onChange={(e) => 
                      handleAxisHomingChange(axisName, 'cycle', parseInt(e.target.value) || 1)
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(cycle => (
                      <option key={cycle} value={cycle}>{cycle}</option>
                    ))}
                  </select>
                  <div className="help-text">
                    Homing cycle order (lower numbers home first)
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={homingConfig?.positive_direction ?? false}
                      onChange={(e) => 
                        handleAxisHomingChange(axisName, 'positive_direction', e.target.checked)
                      }
                    />
                    Home in Positive Direction
                  </label>
                  <div className="help-text">
                    Direction to move when homing
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Home Position (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={homingConfig?.mpos_mm || ''}
                    onChange={(e) => 
                      handleAxisHomingChange(axisName, 'mpos_mm', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0"
                  />
                  <div className="help-text">
                    Machine position when homed
                  </div>
                </div>

                <div className="form-group">
                  <label>Debounce Time (ms)</label>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    value={homingConfig?.debounce_ms || ''}
                    onChange={(e) => 
                      handleAxisHomingChange(axisName, 'debounce_ms', parseInt(e.target.value) || 0)
                    }
                    placeholder="500"
                  />
                  <div className="help-text">
                    Switch debounce time in milliseconds
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Feed Rate (mm/min)</label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    value={homingConfig?.feed_mm_per_min || ''}
                    onChange={(e) => 
                      handleAxisHomingChange(axisName, 'feed_mm_per_min', parseFloat(e.target.value) || 0)
                    }
                    placeholder="100"
                  />
                  <div className="help-text">
                    Slow homing approach speed
                  </div>
                </div>

                <div className="form-group">
                  <label>Seek Rate (mm/min)</label>
                  <input
                    type="number"
                    step="100"
                    min="1"
                    value={homingConfig?.seek_mm_per_min || ''}
                    onChange={(e) => 
                      handleAxisHomingChange(axisName, 'seek_mm_per_min', parseFloat(e.target.value) || 0)
                    }
                    placeholder="1000"
                  />
                  <div className="help-text">
                    Fast homing search speed
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Seek Scaler</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={homingConfig?.seek_scaler || ''}
                    onChange={(e) => 
                      handleAxisHomingChange(axisName, 'seek_scaler', parseFloat(e.target.value) || 0)
                    }
                    placeholder="1.1"
                  />
                  <div className="help-text">
                    Seek rate scaling factor
                  </div>
                </div>

                <div className="form-group">
                  <label>Feed Scaler</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={homingConfig?.feed_scaler || ''}
                    onChange={(e) => 
                      handleAxisHomingChange(axisName, 'feed_scaler', parseFloat(e.target.value) || 0)
                    }
                    placeholder="1.1"
                  />
                  <div className="help-text">
                    Feed rate scaling factor
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};