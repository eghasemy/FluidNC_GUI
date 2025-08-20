import { useState } from 'react';
import { FluidNCConfig } from '@fluidnc-gui/core';
import { Wizard } from './components/Wizard';
import { TestCalculator } from './components/TestCalculator';
import './App.css';

function App() {
  const [showTest, setShowTest] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [completedConfig, setCompletedConfig] = useState<FluidNCConfig | null>(null);

  const handleConfigurationComplete = (config: FluidNCConfig) => {
    setCompletedConfig(config);
    setShowWizard(false);
  };

  const startNewConfiguration = () => {
    setCompletedConfig(null);
    setShowWizard(true);
    setShowTest(false);
  };

  const showWizardApp = () => {
    setShowTest(false);
    setShowWizard(true);
  };

  if (showTest) {
    return (
      <div>
        <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
          <button onClick={showWizardApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Go to Full Wizard
          </button>
          <span>Steps/mm Calculator Demo</span>
        </div>
        <TestCalculator />
      </div>
    );
  }

  if (showWizard) {
    return (
      <div>
        <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
          <button onClick={() => setShowTest(true)} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Back to Calculator Demo
          </button>
          <span>Full Configuration Wizard</span>
        </div>
        <Wizard onConfigurationComplete={handleConfigurationComplete} />
      </div>
    );
  }

  return (
    <main className="container">
      <h1>FluidNC Configuration Complete!</h1>
      
      <div className="completion-message">
        <p>Your FluidNC configuration has been generated successfully.</p>
        <p>Configuration name: <strong>{completedConfig?.name}</strong></p>
        <p>Board type: <strong>{completedConfig?.board}</strong></p>
        
        <button 
          onClick={startNewConfiguration}
          className="restart-button"
        >
          Create New Configuration
        </button>
      </div>
    </main>
  );
}

export default App;
