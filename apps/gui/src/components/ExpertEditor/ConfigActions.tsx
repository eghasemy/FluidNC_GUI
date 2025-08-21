import React, { useState } from 'react';
import { FluidNCConfig, ImportResult, toYAMLWithComments } from '@fluidnc-gui/core';
// import { DEFAULT_PRESETS, getPresetsByCategory } from '@fluidnc-gui/presets';
import { YamlDiffViewer } from './YamlDiffViewer';
import { ImportDialog } from '../ImportDialog';

// Temporary inline presets for testing until module resolution is fixed
const INLINE_PRESETS = [
  {
    id: 'basic-3axis-router',
    name: 'Basic 3-Axis Router',
    description: 'A simple 3-axis router configuration',
    category: 'router' as const,
    author: 'FluidNC GUI',
    version: '1.0.0',
    tags: ['basic', '3-axis', 'router'],
    config: {
      name: 'Basic 3-Axis Router',
      board: '',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 1000,
          acceleration_mm_per_sec2: 50,
          max_travel_mm: 100,
          soft_limits: true,
        },
      },
    },
  },
  {
    id: 'laser-engraver-2axis',
    name: '2-Axis Laser Engraver',
    description: 'CO2 laser engraver with 2-axis motion and laser control',
    category: 'laser' as const,
    author: 'FluidNC Community',
    version: '1.0.0',
    tags: ['laser', '2-axis', 'engraver', 'co2'],
    config: {
      name: '2-Axis Laser Engraver',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 8000,
          acceleration_mm_per_sec2: 200,
          max_travel_mm: 400,
          soft_limits: true,
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 8000,
          acceleration_mm_per_sec2: 200,
          max_travel_mm: 300,
          soft_limits: true,
        },
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4',
        pwm_hz: 5000,
        off_on_alarm: true,
      },
    },
  },
  {
    id: 'plasma-cutter-2axis',
    name: '2-Axis Plasma Cutter',
    description: 'Plasma cutting table with 2-axis motion and torch height control',
    category: 'plasma' as const,
    author: 'FluidNC Community',
    version: '1.0.0',
    tags: ['plasma', '2-axis', 'cutter', 'thc'],
    config: {
      name: '2-Axis Plasma Cutter',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 40,
          max_rate_mm_per_min: 6000,
          acceleration_mm_per_sec2: 150,
          max_travel_mm: 1200,
          soft_limits: true,
        },
        y: {
          steps_per_mm: 40,
          max_rate_mm_per_min: 6000,
          acceleration_mm_per_sec2: 150,
          max_travel_mm: 600,
          soft_limits: true,
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 2000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 100,
          soft_limits: true,
        },
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4',
        off_on_alarm: true,
      },
    },
  },
  {
    id: 'rotary-4axis-router',
    name: '4-Axis Rotary Router',
    description: '3-axis router with rotary A-axis for cylindrical workpieces',
    category: 'rotary' as const,
    author: 'FluidNC Community',
    version: '1.0.0',
    tags: ['rotary', '4-axis', 'router', 'cylindrical'],
    config: {
      name: '4-Axis Rotary Router',
      board: 'ESP32',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 300,
          soft_limits: true,
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 1000,
          acceleration_mm_per_sec2: 50,
          max_travel_mm: 100,
          soft_limits: true,
        },
        a: {
          steps_per_mm: 11.11,
          max_rate_mm_per_min: 3600,
          acceleration_mm_per_sec2: 200,
          max_travel_mm: 360,
          soft_limits: false,
        },
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4',
        direction_pin: 'gpio.16',
        pwm_hz: 5000,
        off_on_alarm: true,
      },
    },
  },
];

const getPresetsByCategory = (category: string) => {
  return INLINE_PRESETS.filter(preset => preset.category === category);
};

export interface ConfigActionsProps {
  config: FluidNCConfig;
  onConfigChange: (config: FluidNCConfig) => void;
}

export const ConfigActions: React.FC<ConfigActionsProps> = ({
  config,
  onConfigChange,
}) => {
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [baselineConfig, setBaselineConfig] = useState<FluidNCConfig | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const handleSaveBaseline = () => {
    setBaselineConfig({ ...config });
    setShowDiffViewer(false);
  };
  
  const handleToggleDiffViewer = () => {
    if (!baselineConfig) {
      // Set current config as baseline if none exists
      setBaselineConfig({ ...config });
    }
    setShowDiffViewer(!showDiffViewer);
  };
  const handleExportYaml = () => {
    try {
      // Use the new comment-aware export function
      const yamlString = toYAMLWithComments(config);
      
      const blob = new Blob([yamlString], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name || 'fluidnc-config'}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export configuration: ' + error);
    }
  };

  const handleImportYaml = () => {
    setShowImportDialog(true);
  };

  const handleImportSuccess = (importedConfig: FluidNCConfig, result: ImportResult) => {
    onConfigChange(importedConfig);
    
    // Show a success message with transformation details
    if (result.mappings.length > 0) {
      console.log('Legacy transformations applied:', result.mappings);
    }
    if (result.suggestions.length > 0) {
      console.log('Import suggestions:', result.suggestions);
    }
  };

  const handleExportJson = () => {
    try {
      const jsonString = JSON.stringify(config, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.name || 'fluidnc-config'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export configuration: ' + error);
    }
  };

  const handleLoadSample = () => {
    const sampleConfig: FluidNCConfig = {
      name: 'Sample CNC Configuration',
      board: 'ESP32',
      version: '3.7',
      axes: {
        x: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 500,
          max_travel_mm: 300,
          soft_limits: true,
          homing: {
            cycle: 1,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 100,
            seek_mm_per_min: 1000,
          },
          motor0: {
            step_pin: 'gpio.2',
            direction_pin: 'gpio.5',
            disable_pin: 'gpio.13',
          },
        },
        y: {
          steps_per_mm: 80,
          max_rate_mm_per_min: 5000,
          acceleration_mm_per_sec2: 500,
          max_travel_mm: 300,
          soft_limits: true,
          homing: {
            cycle: 1,
            positive_direction: false,
            mpos_mm: 0,
            feed_mm_per_min: 100,
            seek_mm_per_min: 1000,
          },
          motor0: {
            step_pin: 'gpio.12',
            direction_pin: 'gpio.14',
            disable_pin: 'gpio.13',
          },
        },
        z: {
          steps_per_mm: 400,
          max_rate_mm_per_min: 1000,
          acceleration_mm_per_sec2: 100,
          max_travel_mm: 100,
          soft_limits: true,
          homing: {
            cycle: 2,
            positive_direction: true,
            mpos_mm: 100,
            feed_mm_per_min: 50,
            seek_mm_per_min: 500,
          },
          motor0: {
            step_pin: 'gpio.27',
            direction_pin: 'gpio.26',
            disable_pin: 'gpio.13',
          },
        },
      },
      spindle: {
        output_pin: 'gpio.25',
        enable_pin: 'gpio.4',
        direction_pin: 'gpio.16',
        pwm_hz: 5000,
        off_on_alarm: true,
      },
      io: {
        probe_pin: 'gpio.22',
        flood_pin: 'gpio.21',
      },
    };
    
    onConfigChange(sampleConfig);
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = INLINE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      onConfigChange(preset.config);
    }
  };

  return (
    <>
      <div className="config-actions">
        <div className="action-group">
          <h4>Presets</h4>
          <div className="action-buttons">
            <select 
              onChange={(e) => e.target.value && handleLoadPreset(e.target.value)}
              defaultValue=""
              className="preset-selector"
            >
              <option value="">Load Machine Preset...</option>
              <optgroup label="Router">
                {getPresetsByCategory('router').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </optgroup>
              <optgroup label="Laser">
                {getPresetsByCategory('laser').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </optgroup>
              <optgroup label="Plasma">
                {getPresetsByCategory('plasma').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </optgroup>
              <optgroup label="Rotary">
                {getPresetsByCategory('rotary').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </optgroup>
              <optgroup label="Mill">
                {getPresetsByCategory('mill').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </optgroup>
              <optgroup label="Other">
                {getPresetsByCategory('other').map(preset => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
        
        <div className="action-group">
          <h4>Configuration Management</h4>
          <div className="action-buttons">
            <button onClick={handleLoadSample} className="action-btn sample">
              Load Sample Config
            </button>
            <button onClick={handleExportYaml} className="action-btn export">
              Export YAML
            </button>
            <button onClick={handleExportJson} className="action-btn export">
              Export JSON
            </button>
            <button onClick={handleImportYaml} className="action-btn import">
              Import YAML
            </button>
          </div>
        </div>
        
        <div className="action-group">
          <h4>Configuration Comparison</h4>
          <div className="action-buttons">
            <button onClick={handleSaveBaseline} className="action-btn">
              Save as Baseline
              {baselineConfig && <span className="baseline-indicator">✓</span>}
            </button>
            <button 
              onClick={handleToggleDiffViewer} 
              className="action-btn diff"
              disabled={!baselineConfig}
            >
              {showDiffViewer ? 'Hide Diff' : 'Show Diff'}
            </button>
          </div>
        </div>
      </div>
      
      {showDiffViewer && baselineConfig && (
        <YamlDiffViewer
          beforeConfig={baselineConfig}
          afterConfig={config}
          title="Configuration Changes"
        />
      )}
      
      <ImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};