import React from 'react';
import './WizardSteps.css';

const WizardSteps = ({ currentStep, steps }) => {
  return (
    <div className="wizard-steps">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = currentStep > stepNumber;

        return (
          <div key={stepNumber} className="step-container">
            <div className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="step-number">
                {isCompleted ? '✓' : stepNumber}
              </div>
              <div className="step-label">{step}</div>
            </div>
            {stepNumber < steps.length && (
              <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WizardSteps;
