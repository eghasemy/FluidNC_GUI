import React, { useEffect, useState } from 'react';
import { FluidNCConfig, validateFluidNCConfig, getAllBoardDescriptors } from '@fluidnc-gui/core';

interface MachineStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const MachineStep: React.FC<MachineStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const validateStep = (currentConfig: FluidNCConfig) => {
    const validation = validateFluidNCConfig(currentConfig);
    const newErrors: string[] = [];
    
    // Basic validation
    if (!currentConfig.name || currentConfig.name.trim() === '') {
      newErrors.push('Machine name is required');
    }
    
    if (!currentConfig.board || currentConfig.board.trim() === '') {
      newErrors.push('Board type is required');
    }

    if (!validation.success) {
      validation.errors.issues.forEach((issue) => {
        newErrors.push(`${issue.path.join('.')}: ${issue.message}`);
      });
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, onValidationChange]);

  const handleInputChange = (field: keyof FluidNCConfig, value: string) => {
    const updates = { [field]: value };
    onConfigChange(updates);
  };

  const boardOptions = [
    { value: '', label: 'Select Board Type' },
    ...getAllBoardDescriptors().map(board => ({
      value: board.id,
      label: `${board.name} - ${board.manufacturer || 'Unknown'}`
    }))
  ];

  return (
    <div className="machine-step">
      <p>Configure the basic machine information and board type.</p>
      
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

      {errors.length === 0 && config.name && config.board && (
        <div className="validation-summary valid">
          <h4>✓ Machine configuration is valid</h4>
        </div>
      )}

      <div className="form-row">
        <div className={`form-group ${errors.some(e => e.includes('name')) ? 'error' : ''}`}>
          <label htmlFor="machine-name">Machine Name *</label>
          <input
            id="machine-name"
            type="text"
            value={config.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter a name for your machine"
          />
          <div className="help-text">
            Give your machine a descriptive name (e.g., &quot;CNC Router&quot;, &quot;Laser Engraver&quot;)
          </div>
        </div>

        <div className={`form-group ${errors.some(e => e.includes('board')) ? 'error' : ''}`}>
          <label htmlFor="board-type">Board Type *</label>
          <select
            id="board-type"
            value={config.board || ''}
            onChange={(e) => handleInputChange('board', e.target.value)}
          >
            {boardOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="help-text">
            Select the controller board you are using for your CNC machine
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="machine-version">Version</label>
        <input
          id="machine-version"
          type="text"
          value={config.version || ''}
          onChange={(e) => handleInputChange('version', e.target.value)}
          placeholder="1.0 (optional)"
        />
        <div className="help-text">
          Optional version number for your configuration
        </div>
      </div>
    </div>
  );
};