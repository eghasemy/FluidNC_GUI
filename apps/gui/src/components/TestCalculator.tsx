import React, { useState } from 'react';
import { StepsPerMMCalculator } from './Wizard/components/StepsPerMMCalculator';

export const TestCalculator: React.FC = () => {
  const [stepsPerMM, setStepsPerMM] = useState(80);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Steps/mm Calculator Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Steps/mm Value: {stepsPerMM}</h3>
        <input 
          type="number" 
          value={stepsPerMM} 
          onChange={(e) => setStepsPerMM(parseFloat(e.target.value) || 0)}
          style={{ padding: '8px', marginLeft: '10px' }}
        />
      </div>
      
      <StepsPerMMCalculator
        onCalculatedValue={(value) => setStepsPerMM(value)}
        initialValue={stepsPerMM}
      />
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>How to use:</h3>
        <ol>
          <li>Click "Use Calculator" to show the calculator panel</li>
          <li>Select your drive type: Belt/Pulley, Leadscrew, or Rack & Pinion</li>
          <li>Enter the appropriate mechanical parameters</li>
          <li>The calculated value will be shown in real-time</li>
          <li>Click "Apply Calculated Value" to update the steps/mm field</li>
        </ol>
      </div>
    </div>
  );
};