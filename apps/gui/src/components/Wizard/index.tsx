import React, { useState } from 'react';
import { FluidNCConfig } from '@fluidnc-gui/core';
import { MachineStep } from './steps/MachineStep';
import { MechanicsStep } from './steps/MechanicsStep';
import { MotorsStep } from './steps/MotorsStep';
import { HomingStep } from './steps/HomingStep';
import { SpindleStep } from './steps/SpindleStep';
import { IOStep } from './steps/IOStep';
import { ReviewStep } from './steps/ReviewStep';
import { WizardNavigation } from './WizardNavigation';
import { StepIndicator } from './StepIndicator';
import './Wizard.css';

export interface WizardStep {
  id: string;
  title: string;
  isValid: boolean;
  isCompleted: boolean;
}

export interface WizardProps {
  onConfigurationComplete: (config: FluidNCConfig) => void;
}

const WIZARD_STEPS: Omit<WizardStep, 'isValid' | 'isCompleted'>[] = [
  { id: 'machine', title: 'Machine' },
  { id: 'mechanics', title: 'Mechanics' },
  { id: 'motors', title: 'Motors' },
  { id: 'homing', title: 'Homing' },
  { id: 'spindle', title: 'Spindle' },
  { id: 'io', title: 'IO' },
  { id: 'review', title: 'Review' },
];

export const Wizard: React.FC<WizardProps> = ({ onConfigurationComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [config, setConfig] = useState<FluidNCConfig>({
    name: 'FluidNC Configuration',
    board: '',
  });
  const [stepValidation, setStepValidation] = useState<Record<string, boolean>>({});

  const updateStepValidation = (stepId: string, isValid: boolean) => {
    setStepValidation(prev => ({ ...prev, [stepId]: isValid }));
  };

  const updateConfig = (updates: Partial<FluidNCConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const canAdvance = () => {
    const currentStep = WIZARD_STEPS[currentStepIndex];
    if (!currentStep) return false;
    return stepValidation[currentStep.id] === true;
  };

  const canGoBack = () => {
    return currentStepIndex > 0;
  };

  const handleNext = () => {
    if (canAdvance() && currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (canGoBack()) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (stepValidation.review) {
      onConfigurationComplete(config);
    }
  };

  const steps: WizardStep[] = WIZARD_STEPS.map((step, index) => ({
    ...step,
    isValid: stepValidation[step.id] === true,
    isCompleted: index < currentStepIndex || stepValidation[step.id] === true,
  }));

  const currentStep = WIZARD_STEPS[currentStepIndex];
  if (!currentStep) {
    return <div>Invalid step</div>;
  }

  const renderCurrentStep = () => {
    switch (currentStep.id) {
      case 'machine':
        return (
          <MachineStep
            config={config}
            onConfigChange={updateConfig}
            onValidationChange={(isValid) => updateStepValidation('machine', isValid)}
          />
        );
      case 'mechanics':
        return (
          <MechanicsStep
            config={config}
            onConfigChange={updateConfig}
            onValidationChange={(isValid) => updateStepValidation('mechanics', isValid)}
          />
        );
      case 'motors':
        return (
          <MotorsStep
            config={config}
            onConfigChange={updateConfig}
            onValidationChange={(isValid) => updateStepValidation('motors', isValid)}
          />
        );
      case 'homing':
        return (
          <HomingStep
            config={config}
            onConfigChange={updateConfig}
            onValidationChange={(isValid) => updateStepValidation('homing', isValid)}
          />
        );
      case 'spindle':
        return (
          <SpindleStep
            config={config}
            onConfigChange={updateConfig}
            onValidationChange={(isValid) => updateStepValidation('spindle', isValid)}
          />
        );
      case 'io':
        return (
          <IOStep
            config={config}
            onConfigChange={updateConfig}
            onValidationChange={(isValid) => updateStepValidation('io', isValid)}
          />
        );
      case 'review':
        return (
          <ReviewStep
            config={config}
            onValidationChange={(isValid) => updateStepValidation('review', isValid)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="wizard">
      <div className="wizard-header">
        <h1>FluidNC Configuration Wizard</h1>
        <StepIndicator steps={steps} currentStepIndex={currentStepIndex} />
      </div>
      
      <div className="wizard-content">
        <div className="wizard-step">
          <h2>{currentStep.title}</h2>
          {renderCurrentStep()}
        </div>
      </div>

      <WizardNavigation
        currentStepIndex={currentStepIndex}
        totalSteps={WIZARD_STEPS.length}
        canGoBack={canGoBack()}
        canAdvance={canAdvance()}
        onBack={handleBack}
        onNext={handleNext}
        onComplete={handleComplete}
      />
    </div>
  );
};