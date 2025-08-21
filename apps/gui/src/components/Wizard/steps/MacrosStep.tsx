import React, { useEffect, useState } from 'react';
import { FluidNCConfig, MacrosConfig } from '@fluidnc-gui/core';

interface MacrosStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const MacrosStep: React.FC<MacrosStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);

  const validateStep = () => {
    const newErrors: string[] = [];
    
    // Basic validation - macros should be strings if provided
    if (config.macros) {
      Object.entries(config.macros).forEach(([key, value]) => {
        if (value !== undefined && typeof value !== 'string') {
          newErrors.push(`${key}: Macro content must be a string`);
        }
      });
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidationChange(isValid);
  };

  useEffect(validateStep, [config, onValidationChange]);

  const handleMacroChange = (macroKey: keyof MacrosConfig, value: string) => {
    const currentMacros = config.macros || {};
    
    const updatedMacros: MacrosConfig = { ...currentMacros };
    
    if (value === '') {
      delete updatedMacros[macroKey];
    } else {
      updatedMacros[macroKey] = value;
    }
    
    onConfigChange({ 
      ...(Object.keys(updatedMacros).length > 0 ? { macros: updatedMacros } : {})
    });
  };

  const renderMacroEditor = (macroKey: keyof MacrosConfig, title: string, description: string) => {
    const rawValue = config.macros?.[macroKey];
    const value = typeof rawValue === 'string' ? rawValue : '';
    
    return (
      <div key={macroKey} className="form-group macro-editor">
        <label>{title}</label>
        <textarea
          value={value}
          onChange={(e) => handleMacroChange(macroKey, e.target.value)}
          placeholder={`Enter ${title.toLowerCase()} G-code commands...`}
          rows={4}
          className="macro-textarea"
        />
        <small>{description}</small>
        {value && (
          <div className="macro-preview">
            <strong>Commands:</strong>
            <pre>{value}</pre>
          </div>
        )}
      </div>
    );
  };

  const macroExamples = [
    {
      title: "Homing Sequence",
      code: "$H\nG92 X0 Y0 Z0",
      description: "Home all axes and reset work coordinates"
    },
    {
      title: "Tool Change Position",
      code: "G0 Z50\nG0 X0 Y0",
      description: "Move to safe Z height, then to origin"
    },
    {
      title: "Spindle Warmup",
      code: "M3 S1000\nG4 P5\nM3 S5000\nG4 P3\nM5",
      description: "Gradually warm up spindle, then stop"
    },
    {
      title: "Probe Sequence",
      code: "G38.2 Z-10 F100\nG92 Z0\nG0 Z5",
      description: "Probe down, set zero, retract"
    }
  ];

  return (
    <div className="macros-step">
      <div className="step-header">
        <h2>Macros Configuration</h2>
        <p>Define custom G-code macros and startup sequences. Macros allow you to execute predefined sequences of commands with a single button press or at system startup.</p>
      </div>

      <div className="macros-content">
        <div className="macros-grid">
          <div className="macros-editors">
            <div className="section">
              <h3>Macro Buttons</h3>
              <p>These macros can be triggered by physical buttons (configured in I/O step) or from the interface.</p>
              
              {renderMacroEditor('macro0', 'Macro 0', 'First macro button - commonly used for homing')}
              {renderMacroEditor('macro1', 'Macro 1', 'Second macro button - often tool change or probe')}
              {renderMacroEditor('macro2', 'Macro 2', 'Third macro button - custom operation')}
              {renderMacroEditor('macro3', 'Macro 3', 'Fourth macro button - custom operation')}
            </div>

            <div className="section">
              <h3>Startup Sequences</h3>
              <p>These commands are executed automatically when the system starts.</p>
              
              {renderMacroEditor('startup_line0', 'Startup Line 0', 'First command executed at startup (usually homing)')}
              {renderMacroEditor('startup_line1', 'Startup Line 1', 'Second command executed at startup')}
            </div>
          </div>

          <div className="macros-help">
            <div className="section">
              <h3>📖 G-code Reference</h3>
              <div className="gcode-reference">
                <div className="gcode-category">
                  <h4>Motion Commands</h4>
                  <ul>
                    <li><code>G0</code> - Rapid positioning</li>
                    <li><code>G1</code> - Linear interpolation</li>
                    <li><code>G2/G3</code> - Circular interpolation</li>
                    <li><code>G28</code> - Go to home position</li>
                  </ul>
                </div>
                
                <div className="gcode-category">
                  <h4>System Commands</h4>
                  <ul>
                    <li><code>$H</code> - Home all axes</li>
                    <li><code>G92</code> - Set work coordinates</li>
                    <li><code>G4 P[seconds]</code> - Dwell/pause</li>
                    <li><code>M3/M5</code> - Spindle on/off</li>
                  </ul>
                </div>
                
                <div className="gcode-category">
                  <h4>Probing</h4>
                  <ul>
                    <li><code>G38.2</code> - Probe toward workpiece</li>
                    <li><code>G38.3</code> - Probe toward workpiece (no error)</li>
                    <li><code>G38.4</code> - Probe away from workpiece</li>
                    <li><code>G38.5</code> - Probe away (no error)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="section">
              <h3>💡 Example Macros</h3>
              <div className="macro-examples">
                {macroExamples.map((example, index) => (
                  <div key={index} className="macro-example">
                    <h4>{example.title}</h4>
                    <pre className="example-code">{example.code}</pre>
                    <p>{example.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="section">
              <h3>⚠️ Safety Notes</h3>
              <ul>
                <li>Always test macros carefully before use</li>
                <li>Use <code>G0 Z[safe_height]</code> before rapid moves</li>
                <li>Consider work coordinate systems (G54, G55, etc.)</li>
                <li>Startup macros run automatically - keep them simple</li>
                <li>Multiple commands can be separated by newlines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="validation-errors">
          <h3>⚠️ Configuration Issues</h3>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};