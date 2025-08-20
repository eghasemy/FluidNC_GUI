import React, { useState } from 'react';
import { 
  calculateStepsPerMM_Belt, 
  calculateStepsPerMM_Leadscrew, 
  calculateStepsPerMM_RackPinion,
  StepsPerMMParams 
} from '@fluidnc-gui/core';

type DriveType = 'belt' | 'leadscrew' | 'rack_pinion';

interface StepsPerMMCalculatorProps {
  onCalculatedValue: (stepsPerMM: number) => void;
  initialValue?: number;
}

export const StepsPerMMCalculator: React.FC<StepsPerMMCalculatorProps> = ({
  onCalculatedValue,
  initialValue = 80
}) => {
  const [driveType, setDriveType] = useState<DriveType>('belt');
  const [showCalculator, setShowCalculator] = useState(false);
  const [params, setParams] = useState<StepsPerMMParams>({
    motor_steps_per_rev: 200,
    microsteps: 16,
    // Belt defaults
    drive_pulley_teeth: 20,
    driven_pulley_teeth: 20,
    belt_pitch_mm: 2,
    // Leadscrew defaults
    leadscrew_pitch_mm: 8,
    // Rack & pinion defaults
    pinion_teeth: 20,
    rack_pitch_mm: 2,
    // Common
    gear_ratio: 1
  });

  const calculateValue = () => {
    let result = 0;
    switch (driveType) {
      case 'belt':
        result = calculateStepsPerMM_Belt(params);
        break;
      case 'leadscrew':
        result = calculateStepsPerMM_Leadscrew(params);
        break;
      case 'rack_pinion':
        result = calculateStepsPerMM_RackPinion(params);
        break;
    }
    return Math.round(result * 100) / 100; // Round to 2 decimal places
  };

  const handleParamChange = (key: keyof StepsPerMMParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyCalculation = () => {
    const calculatedValue = calculateValue();
    onCalculatedValue(calculatedValue);
    setShowCalculator(false);
  };

  const currentCalculatedValue = showCalculator ? calculateValue() : initialValue;

  return (
    <div className="steps-per-mm-calculator">
      <div className="calculator-header">
        <button 
          type="button"
          className="calculator-toggle"
          onClick={() => setShowCalculator(!showCalculator)}
        >
          {showCalculator ? 'Hide Calculator' : 'Use Calculator'}
        </button>
        {showCalculator && (
          <div className="calculated-preview">
            Calculated: {currentCalculatedValue} steps/mm
          </div>
        )}
      </div>

      {showCalculator && (
        <div className="calculator-panel">
          <div className="drive-type-selector">
            <label>Drive Type:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="belt"
                  checked={driveType === 'belt'}
                  onChange={(e) => setDriveType(e.target.value as DriveType)}
                />
                Belt/Pulley
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="leadscrew"
                  checked={driveType === 'leadscrew'}
                  onChange={(e) => setDriveType(e.target.value as DriveType)}
                />
                Leadscrew
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="rack_pinion"
                  checked={driveType === 'rack_pinion'}
                  onChange={(e) => setDriveType(e.target.value as DriveType)}
                />
                Rack & Pinion
              </label>
            </div>
          </div>

          <div className="common-params">
            <h4>Motor Configuration</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Motor Steps/Rev</label>
                <input
                  type="number"
                  value={params.motor_steps_per_rev || ''}
                  onChange={(e) => handleParamChange('motor_steps_per_rev', parseFloat(e.target.value) || 200)}
                  placeholder="200"
                />
                <div className="help-text">Typically 200 for 1.8° steppers</div>
              </div>
              <div className="form-group">
                <label>Microsteps</label>
                <input
                  type="number"
                  value={params.microsteps || ''}
                  onChange={(e) => handleParamChange('microsteps', parseInt(e.target.value) || 16)}
                  placeholder="16"
                />
                <div className="help-text">Driver microstepping setting</div>
              </div>
            </div>

            <div className="form-group">
              <label>Gear Ratio</label>
              <input
                type="number"
                step="0.1"
                value={params.gear_ratio || ''}
                onChange={(e) => handleParamChange('gear_ratio', parseFloat(e.target.value) || 1)}
                placeholder="1"
              />
              <div className="help-text">Additional gear reduction (1 = direct drive)</div>
            </div>
          </div>

          {driveType === 'belt' && (
            <div className="drive-specific-params">
              <h4>Belt Drive Parameters</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Drive Pulley Teeth</label>
                  <input
                    type="number"
                    value={params.drive_pulley_teeth || ''}
                    onChange={(e) => handleParamChange('drive_pulley_teeth', parseInt(e.target.value) || 20)}
                    placeholder="20"
                  />
                  <div className="help-text">Motor pulley teeth count</div>
                </div>
                <div className="form-group">
                  <label>Driven Pulley Teeth</label>
                  <input
                    type="number"
                    value={params.driven_pulley_teeth || ''}
                    onChange={(e) => handleParamChange('driven_pulley_teeth', parseInt(e.target.value) || 20)}
                    placeholder="20"
                  />
                  <div className="help-text">Axis pulley teeth count</div>
                </div>
              </div>
              <div className="form-group">
                <label>Belt Pitch (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={params.belt_pitch_mm || ''}
                  onChange={(e) => handleParamChange('belt_pitch_mm', parseFloat(e.target.value) || 2)}
                  placeholder="2"
                />
                <div className="help-text">GT2 = 2mm, GT3 = 3mm</div>
              </div>
            </div>
          )}

          {driveType === 'leadscrew' && (
            <div className="drive-specific-params">
              <h4>Leadscrew Parameters</h4>
              <div className="form-group">
                <label>Leadscrew Pitch (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={params.leadscrew_pitch_mm || ''}
                  onChange={(e) => handleParamChange('leadscrew_pitch_mm', parseFloat(e.target.value) || 8)}
                  placeholder="8"
                />
                <div className="help-text">Distance traveled per revolution</div>
              </div>
            </div>
          )}

          {driveType === 'rack_pinion' && (
            <div className="drive-specific-params">
              <h4>Rack & Pinion Parameters</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Pinion Teeth</label>
                  <input
                    type="number"
                    value={params.pinion_teeth || ''}
                    onChange={(e) => handleParamChange('pinion_teeth', parseInt(e.target.value) || 20)}
                    placeholder="20"
                  />
                  <div className="help-text">Number of teeth on pinion gear</div>
                </div>
                <div className="form-group">
                  <label>Rack Pitch (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={params.rack_pitch_mm || ''}
                    onChange={(e) => handleParamChange('rack_pitch_mm', parseFloat(e.target.value) || 2)}
                    placeholder="2"
                  />
                  <div className="help-text">Distance between rack teeth</div>
                </div>
              </div>
            </div>
          )}

          <div className="calculator-actions">
            <button 
              type="button" 
              className="apply-button"
              onClick={handleApplyCalculation}
            >
              Apply Calculated Value ({currentCalculatedValue} steps/mm)
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setShowCalculator(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};