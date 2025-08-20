import React from 'react';

interface WizardNavigationProps {
  currentStepIndex: number;
  totalSteps: number;
  canGoBack: boolean;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStepIndex,
  totalSteps,
  canGoBack,
  canAdvance,
  onBack,
  onNext,
  onComplete,
}) => {
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="wizard-navigation">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="wizard-btn wizard-btn-secondary"
      >
        Back
      </button>
      
      <div className="wizard-nav-spacer" />
      
      {isLastStep ? (
        <button
          type="button"
          onClick={onComplete}
          disabled={!canAdvance}
          className="wizard-btn wizard-btn-primary"
        >
          Complete Configuration
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          className="wizard-btn wizard-btn-primary"
        >
          Next
        </button>
      )}
    </div>
  );
};