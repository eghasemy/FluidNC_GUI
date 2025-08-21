import React, { useState } from 'react';
import { FluidNCConfig } from '@fluidnc-gui/core';
import { DEFAULT_PRESETS, getPresetsByCategory } from '@fluidnc-gui/presets';
import { YamlDiffViewer } from './YamlDiffViewer';

// Import yaml from js-yaml (types should be available via @types/js-yaml)
import { dump, load } from 'js-yaml';

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
      const yamlString = dump(config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      });
      
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

  const handleImportYaml = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const yamlString = e.target?.result as string;
        const parsedConfig = load(yamlString) as FluidNCConfig;
        onConfigChange(parsedConfig);
      } catch (error) {
        alert('Failed to import configuration: ' + error);
      }
    };
    reader.readAsText(file);
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
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
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
            <label className="action-btn import">
              Import YAML
              <input
                type="file"
                accept=".yaml,.yml"
                onChange={handleImportYaml}
                style={{ display: 'none' }}
              />
            </label>
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
    </>
  );
};