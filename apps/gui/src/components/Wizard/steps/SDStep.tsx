import React, { useEffect, useState } from 'react';
import { FluidNCConfig, SDConfig } from '@fluidnc-gui/core';
import { PinInput } from '../../PinInput';
import { usePinManager } from '../../../hooks/usePinManager';

interface SDStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const SDStep: React.FC<SDStepProps> = ({
  config,
  onConfigChange,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const pinManager = usePinManager(config);

  const validateStep = () => {
    const newErrors: string[] = [];
    
    // Check for pin conflicts
    if (pinManager.hasPinConflicts) {
      Object.entries(pinManager.pinConflicts).forEach(([pin, usedBy]) => {
        const usedByArray = Array.isArray(usedBy) ? usedBy : [usedBy];
        newErrors.push(`Pin ${pin} is used by multiple fields: ${usedByArray.join(', ')}`);
      });
    }
    
    // Validate SD card pins
    if (config.sd) {
      const sdPins = [
        'card_detect_pin', 'miso_pin', 'mosi_pin', 'sck_pin', 'cs_pin'
      ] as const;
      
      sdPins.forEach(field => {
        const pin = config.sd?.[field];
        if (pin && typeof pin === 'string' && pin.trim() !== '') {
          const validation = pinManager.validatePinAssignment(pin, `sd.${field}`);
          if (!validation.isValid) {
            newErrors.push(`${field.replace('_', ' ')}: ${validation.errors[0]}`);
          }
        }
      });
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidationChange(isValid);
  };

  useEffect(validateStep, [config, pinManager, onValidationChange]);

  const handleSDConfigChange = (field: keyof SDConfig, value: string) => {
    const currentSD = config.sd || {};
    
    const updatedSD: SDConfig = { ...currentSD };
    
    if (value === '') {
      delete updatedSD[field];
    } else {
      updatedSD[field] = value;
    }
    
    onConfigChange({ 
      ...(Object.keys(updatedSD).length > 0 ? { sd: updatedSD } : {})
    });
  };

  return (
    <div className="sd-step">
      <div className="step-header">
        <h2>SD Card Configuration</h2>
        <p>Configure SD card interface for file storage and program execution. The SD card can store G-code files, configuration backups, and job files.</p>
      </div>

      <div className="section">
        <h3>SPI Interface Pins</h3>
        <p>SD cards use SPI (Serial Peripheral Interface) communication. All pins are required for proper operation.</p>
        
        <div className="form-grid">
          <div className="form-group">
            <PinInput
              label="MISO Pin"
              value={config.sd?.miso_pin || ''}
              onChange={(value) => handleSDConfigChange('miso_pin', value)}
              config={config}
              sourceField="sd.miso_pin"
              placeholder="e.g., gpio.19"
            />
            <small>Master In, Slave Out - Data from SD card to controller</small>
          </div>
          
          <div className="form-group">
            <PinInput
              label="MOSI Pin"
              value={config.sd?.mosi_pin || ''}
              onChange={(value) => handleSDConfigChange('mosi_pin', value)}
              config={config}
              sourceField="sd.mosi_pin"
              placeholder="e.g., gpio.23"
            />
            <small>Master Out, Slave In - Data from controller to SD card</small>
          </div>
          
          <div className="form-group">
            <PinInput
              label="SCK Pin"
              value={config.sd?.sck_pin || ''}
              onChange={(value) => handleSDConfigChange('sck_pin', value)}
              config={config}
              sourceField="sd.sck_pin"
              placeholder="e.g., gpio.18"
            />
            <small>Serial Clock - Clock signal for SPI communication</small>
          </div>
          
          <div className="form-group">
            <PinInput
              label="CS Pin"
              value={config.sd?.cs_pin || ''}
              onChange={(value) => handleSDConfigChange('cs_pin', value)}
              config={config}
              sourceField="sd.cs_pin"
              placeholder="e.g., gpio.5"
            />
            <small>Chip Select - Selects the SD card for communication</small>
          </div>
          
          <div className="form-group">
            <PinInput
              label="Card Detect Pin (Optional)"
              value={config.sd?.card_detect_pin || ''}
              onChange={(value) => handleSDConfigChange('card_detect_pin', value)}
              config={config}
              sourceField="sd.card_detect_pin"
              placeholder="e.g., gpio.21"
            />
            <small>Detects when SD card is inserted (if your slot has this feature)</small>
          </div>
        </div>
      </div>

      <div className="info-section">
        <h3>💡 SD Card Usage</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>📁 File Storage</h4>
            <ul>
              <li>Store G-code programs (.nc, .gcode files)</li>
              <li>Save configuration backups</li>
              <li>Log operation data</li>
              <li>Store custom macros</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>🚀 Program Execution</h4>
            <ul>
              <li>Run programs directly from SD card</li>
              <li>Resume after power loss</li>
              <li>Execute batch operations</li>
              <li>Load settings on startup</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>⚡ Common ESP32 SPI Pins</h4>
            <ul>
              <li><strong>MISO:</strong> GPIO 19</li>
              <li><strong>MOSI:</strong> GPIO 23</li>
              <li><strong>SCK:</strong> GPIO 18</li>
              <li><strong>CS:</strong> GPIO 5</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>🔧 Setup Tips</h4>
            <ul>
              <li>Use short, well-shielded wires</li>
              <li>Format SD card as FAT32</li>
              <li>Use Class 10 or better SD cards</li>
              <li>Check voltage compatibility (3.3V)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="warning-section">
        <h3>⚠️ Important Notes</h3>
        <ul>
          <li><strong>Voltage Level:</strong> Ensure SD card module operates at 3.3V, not 5V</li>
          <li><strong>Pin Conflicts:</strong> SPI pins cannot be shared with other SPI devices without proper CS handling</li>
          <li><strong>Card Detect:</strong> Only configure if your SD card slot has a physical detection switch</li>
          <li><strong>File System:</strong> Use FAT32 format for maximum compatibility</li>
          <li><strong>Wire Length:</strong> Keep SPI wires as short as possible for reliable communication</li>
        </ul>
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