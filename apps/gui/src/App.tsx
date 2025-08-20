import { useState } from 'react';
import { FluidNCConfig } from '@fluidnc-gui/core';
import { Wizard } from './components/Wizard';
import { TestCalculator } from './components/TestCalculator';
import { ExpertEditor } from './components/ExpertEditor';
import Console from './components/Console';
import './App.css';

function App() {
  const [showTest, setShowTest] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [completedConfig, setCompletedConfig] = useState<FluidNCConfig | null>(null);

  const handleConfigurationComplete = (config: FluidNCConfig) => {
    setCompletedConfig(config);
    setShowWizard(false);
    setShowExpert(false);
    setShowConsole(false);
  };

  const startNewConfiguration = () => {
    setCompletedConfig(null);
    setShowWizard(true);
    setShowTest(false);
    setShowExpert(false);
    setShowConsole(false);
  };

  const showWizardApp = () => {
    setShowTest(false);
    setShowWizard(true);
    setShowExpert(false);
    setShowConsole(false);
  };

  const showExpertApp = () => {
    setShowTest(false);
    setShowWizard(false);
    setShowExpert(true);
    setShowConsole(false);
  };

  const showConsoleApp = () => {
    setShowTest(false);
    setShowWizard(false);
    setShowExpert(false);
    setShowConsole(true);
  };

  const handleExpertConfigChange = (config: FluidNCConfig) => {
    setCompletedConfig(config);
  };

  if (showTest) {
    return (
      <div>
        <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
          <button onClick={showWizardApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Go to Full Wizard
          </button>
          <button onClick={showExpertApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Go to Expert Editor
          </button>
          <button onClick={showConsoleApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Go to Console
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
          <button onClick={showExpertApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Switch to Expert Editor
          </button>
          <button onClick={showConsoleApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Go to Console
          </button>
          <span>Full Configuration Wizard</span>
        </div>
        <Wizard onConfigurationComplete={handleConfigurationComplete} />
      </div>
    );
  }

  if (showExpert) {
    const currentConfig = completedConfig || {
      name: 'New FluidNC Configuration',
      board: '',
    };
    
    return (
      <div>
        <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#f0f0f0' }}>
          <button onClick={() => setShowTest(true)} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Back to Calculator Demo
          </button>
          <button onClick={showWizardApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Switch to Wizard
          </button>
          <button onClick={showConsoleApp} style={{ padding: '10px 20px', marginRight: '10px' }}>
            Go to Console
          </button>
          <span>Expert Configuration Editor</span>
        </div>
        <ExpertEditor 
          config={currentConfig}
          onConfigChange={handleExpertConfigChange}
        />
      </div>
    );
  }

  if (showConsole) {
    return <Console />;
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
          style={{ marginRight: '10px' }}
        >
          Create New Configuration
        </button>
        <button 
          onClick={showExpertApp}
          className="restart-button"
        >
          Edit in Expert Mode
        </button>
      </div>
    </main>
  );
}

export default App;
