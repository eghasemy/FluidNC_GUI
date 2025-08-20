import React from 'react';
import { WizardStep } from './index';

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStepIndex: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStepIndex }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step.id} className="step-indicator-item">
          <div
            className={`step-circle ${
              index === currentStepIndex
                ? 'active'
                : index < currentStepIndex || step.isCompleted
                ? 'completed'
                : step.isValid
                ? 'valid'
                : 'pending'
            }`}
          >
            {index < currentStepIndex || step.isCompleted ? (
              <span className="step-check">✓</span>
            ) : (
              <span className="step-number">{index + 1}</span>
            )}
          </div>
          <span className="step-title">{step.title}</span>
          {index < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );
};