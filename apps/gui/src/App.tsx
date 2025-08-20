import { useState } from 'react';
import { FluidNCConfig } from '@fluidnc-gui/core';
import { Wizard } from './components/Wizard';
import './App.css';

function App() {
  const [showWizard, setShowWizard] = useState(true);
  const [completedConfig, setCompletedConfig] = useState<FluidNCConfig | null>(null);

  const handleConfigurationComplete = (config: FluidNCConfig) => {
    setCompletedConfig(config);
    setShowWizard(false);
  };

  const startNewConfiguration = () => {
    setCompletedConfig(null);
    setShowWizard(true);
  };

  if (showWizard) {
    return <Wizard onConfigurationComplete={handleConfigurationComplete} />;
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
