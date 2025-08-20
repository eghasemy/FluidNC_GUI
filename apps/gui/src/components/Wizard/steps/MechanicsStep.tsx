import React, { useEffect, useState } from 'react';
import { FluidNCConfig, AxisConfig, validateAxisConfig } from '@fluidnc-gui/core';

interface MechanicsStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const MechanicsStep: React.FC<MechanicsStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedAxes, setSelectedAxes] = useState<string[]>(['x', 'y', 'z']);

  const validateStep = () => {
    const newErrors: string[] = [];
    
    if (selectedAxes.length === 0) {
      newErrors.push('At least one axis must be configured');
    }

    // Validate each axis configuration
    if (config.axes) {
      Object.entries(config.axes).forEach(([axisName, axisConfig]) => {
        const validation = validateAxisConfig(axisConfig);
        if (!validation.success) {
          validation.errors.issues.forEach((issue) => {
            newErrors.push(`${axisName} axis: ${issue.message}`);
          });
        }

        // Check for required basic configuration
        if (!axisConfig.steps_per_mm || axisConfig.steps_per_mm <= 0) {
          newErrors.push(`${axisName} axis: steps_per_mm is required and must be positive`);
        }
        if (!axisConfig.max_rate_mm_per_min || axisConfig.max_rate_mm_per_min <= 0) {
          newErrors.push(`${axisName} axis: max_rate_mm_per_min is required and must be positive`);
        }
      });
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0 && selectedAxes.length > 0;
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.axes, selectedAxes]);

  const handleAxisToggle = (axisName: string) => {
    const newSelectedAxes = selectedAxes.includes(axisName)
      ? selectedAxes.filter(name => name !== axisName)
      : [...selectedAxes, axisName];
    
    setSelectedAxes(newSelectedAxes);
    
    // Update config axes
    const newAxes = { ...config.axes };
    if (newSelectedAxes.includes(axisName)) {
      if (!newAxes[axisName]) {
        newAxes[axisName] = {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        };
      }
    } else {
      delete newAxes[axisName];
    }
    
    onConfigChange({ axes: newAxes });
  };

  const handleAxisConfigChange = (axisName: string, field: keyof AxisConfig, value: number | boolean) => {
    const newAxes = {
      ...config.axes,
      [axisName]: {
        ...config.axes?.[axisName],
        [field]: value,
      },
    };
    onConfigChange({ axes: newAxes });
  };

  const availableAxes = [
    { name: 'x', label: 'X Axis' },
    { name: 'y', label: 'Y Axis' },
    { name: 'z', label: 'Z Axis' },
    { name: 'a', label: 'A Axis (Rotary)' },
    { name: 'b', label: 'B Axis (Rotary)' },
    { name: 'c', label: 'C Axis (Rotary)' },
  ];

  return (
    <div className="mechanics-step">
      <p>Configure the mechanical properties of your machine axes.</p>
      
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

      {errors.length === 0 && selectedAxes.length > 0 && (
        <div className="validation-summary valid">
          <h4>✓ Mechanics configuration is valid</h4>
        </div>
      )}

      <div className="form-group">
        <label>Active Axes *</label>
        <div className="axis-selection">
          {availableAxes.map((axis) => (
            <label key={axis.name} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedAxes.includes(axis.name)}
                onChange={() => handleAxisToggle(axis.name)}
              />
              {axis.label}
            </label>
          ))}
        </div>
        <div className="help-text">
          Select which axes your machine uses
        </div>
      </div>

      {selectedAxes.map((axisName) => {
        const axisConfig = config.axes?.[axisName];
        return (
          <div key={axisName} className="axis-configuration">
            <h3>{axisName.toUpperCase()} Axis Configuration</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Steps per mm *</label>
                <input
                  type="number"
                  step="0.1"
                  value={axisConfig?.steps_per_mm || ''}
                  onChange={(e) => 
                    handleAxisConfigChange(axisName, 'steps_per_mm', parseFloat(e.target.value) || 0)
                  }
                  placeholder="80"
                />
                <div className="help-text">
                  Number of motor steps per millimeter of movement
                </div>
              </div>

              <div className="form-group">
                <label>Max Rate (mm/min) *</label>
                <input
                  type="number"
                  step="100"
                  value={axisConfig?.max_rate_mm_per_min || ''}
                  onChange={(e) => 
                    handleAxisConfigChange(axisName, 'max_rate_mm_per_min', parseFloat(e.target.value) || 0)
                  }
                  placeholder="5000"
                />
                <div className="help-text">
                  Maximum feed rate in mm per minute
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Acceleration (mm/s²)</label>
                <input
                  type="number"
                  step="10"
                  value={axisConfig?.acceleration_mm_per_sec2 || ''}
                  onChange={(e) => 
                    handleAxisConfigChange(axisName, 'acceleration_mm_per_sec2', parseFloat(e.target.value) || 0)
                  }
                  placeholder="100"
                />
                <div className="help-text">
                  Acceleration in mm per second squared
                </div>
              </div>

              <div className="form-group">
                <label>Max Travel (mm)</label>
                <input
                  type="number"
                  step="1"
                  value={axisConfig?.max_travel_mm || ''}
                  onChange={(e) => 
                    handleAxisConfigChange(axisName, 'max_travel_mm', parseFloat(e.target.value) || 0)
                  }
                  placeholder="300"
                />
                <div className="help-text">
                  Maximum travel distance in mm
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={axisConfig?.soft_limits ?? false}
                  onChange={(e) => 
                    handleAxisConfigChange(axisName, 'soft_limits', e.target.checked)
                  }
                />
                Enable Soft Limits
              </label>
              <div className="help-text">
                Prevent movement beyond defined travel limits
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};