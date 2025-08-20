import React, { useEffect, useState } from 'react';
import { FluidNCConfig, validateFluidNCConfig, toYAML } from '@fluidnc-gui/core';

interface ReviewStepProps {
  config: FluidNCConfig;
  onValidationChange: (isValid: boolean) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  config,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [yamlConfig, setYamlConfig] = useState<string>('');

  const validateStep = () => {
    const newErrors: string[] = [];
    const newWarnings: string[] = [];
    
    // Comprehensive validation of the entire configuration
    const validation = validateFluidNCConfig(config);
    if (!validation.success) {
      validation.errors.issues.forEach((issue) => {
        newErrors.push(`${issue.path.join('.')}: ${issue.message}`);
      });
    }

    // Check for common configuration issues
    if (!config.name || config.name.trim() === '') {
      newErrors.push('Machine name is required');
    }
    
    if (!config.board || config.board.trim() === '') {
      newErrors.push('Board type is required');
    }

    if (!config.axes || Object.keys(config.axes).length === 0) {
      newErrors.push('At least one axis must be configured');
    }

    // Warnings for incomplete but valid configurations
    if (config.axes) {
      Object.entries(config.axes).forEach(([axisName, axisConfig]) => {
        if (!axisConfig.motor0) {
          newWarnings.push(`${axisName} axis: No motor configuration`);
        } else {
          if (!axisConfig.motor0.tmc_2130 && !axisConfig.motor0.tmc_2209) {
            newWarnings.push(`${axisName} axis: No TMC driver configuration`);
          }
        }
        
        if (!axisConfig.homing) {
          newWarnings.push(`${axisName} axis: No homing configuration`);
        }
      });
    }

    if (!config.spindle) {
      newWarnings.push('No spindle configuration - this may be intentional');
    }

    if (!config.io || Object.keys(config.io).length === 0) {
      newWarnings.push('No IO configuration - probes and coolant control will not be available');
    }

    // Generate YAML output
    try {
      const yaml = toYAML(validation.success ? validation.data : config);
      setYamlConfig(yaml);
    } catch (error) {
      newErrors.push('Failed to generate YAML configuration');
      setYamlConfig('Error generating configuration');
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    
    const isValid = newErrors.length === 0;
    onValidationChange(isValid);
    return isValid;
  };

  useEffect(() => {
    validateStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, onValidationChange]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(yamlConfig).then(() => {
      alert('Configuration copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard. Please select and copy manually.');
    });
  };

  const downloadConfig = () => {
    const blob = new Blob([yamlConfig], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.name?.replace(/\s+/g, '_') || 'fluidnc'}_config.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConfigSummary = () => {
    const summary = {
      machine: config.name || 'Unnamed',
      board: config.board || 'Not specified',
      axes: config.axes ? Object.keys(config.axes).length : 0,
      axesList: config.axes ? Object.keys(config.axes).join(', ').toUpperCase() : 'None',
      hasSpindle: !!config.spindle,
      hasHoming: config.axes ? Object.values(config.axes).some(axis => axis.homing) : false,
      hasIO: config.io ? Object.keys(config.io).length > 0 : false,
    };
    return summary;
  };

  const summary = getConfigSummary();

  return (
    <div className="review-step">
      <p>Review your FluidNC configuration before completing the wizard.</p>
      
      {errors.length > 0 && (
        <div className="validation-summary invalid">
          <h4>Configuration Errors (Must Fix):</h4>
          <ul>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="validation-summary" style={{ backgroundColor: '#fff3cd', borderColor: '#ffc107', color: '#856404' }}>
          <h4>Configuration Warnings:</h4>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
          <p><small>Warnings indicate potentially incomplete configuration but won&apos;t prevent the configuration from working.</small></p>
        </div>
      )}

      {errors.length === 0 && (
        <div className="validation-summary valid">
          <h4>✓ Configuration is valid and ready to use!</h4>
        </div>
      )}

      <div className="config-summary">
        <h3>Configuration Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <strong>Machine Name:</strong> {summary.machine}
          </div>
          <div className="summary-item">
            <strong>Board Type:</strong> {summary.board}
          </div>
          <div className="summary-item">
            <strong>Axes Count:</strong> {summary.axes}
          </div>
          <div className="summary-item">
            <strong>Configured Axes:</strong> {summary.axesList}
          </div>
          <div className="summary-item">
            <strong>Spindle Control:</strong> {summary.hasSpindle ? 'Enabled' : 'Disabled'}
          </div>
          <div className="summary-item">
            <strong>Homing:</strong> {summary.hasHoming ? 'Configured' : 'Not configured'}
          </div>
          <div className="summary-item">
            <strong>IO Features:</strong> {summary.hasIO ? 'Configured' : 'Not configured'}
          </div>
        </div>
      </div>

      <div className="config-output">
        <h3>Generated Configuration</h3>
        <p>This is your complete FluidNC YAML configuration file:</p>
        
        <div className="config-actions">
          <button 
            type="button" 
            onClick={copyToClipboard}
            className="wizard-btn wizard-btn-secondary"
          >
            Copy to Clipboard
          </button>
          <button 
            type="button" 
            onClick={downloadConfig}
            className="wizard-btn wizard-btn-secondary"
          >
            Download YAML File
          </button>
        </div>

        <pre className="config-preview">
          <code>{yamlConfig}</code>
        </pre>
      </div>

      <div className="next-steps">
        <h3>Next Steps</h3>
        <ol>
          <li><strong>Save the configuration:</strong> Copy or download the YAML configuration above.</li>
          <li><strong>Upload to FluidNC:</strong> Use the FluidNC web interface or file system to upload the configuration file.</li>
          <li><strong>Test carefully:</strong> Start with low speeds and short movements to verify your configuration.</li>
          <li><strong>Fine-tune:</strong> Adjust parameters as needed based on your machine&apos;s performance.</li>
        </ol>
        
        <div className="warning-box">
          <h4>⚠️ Safety Warning</h4>
          <p>
            Always test your configuration carefully before normal operation. Start with low speeds and verify:
          </p>
          <ul>
            <li>Motor directions are correct</li>
            <li>Limit switches and homing work properly</li>
            <li>Spindle control operates as expected</li>
            <li>Emergency stop functions correctly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};