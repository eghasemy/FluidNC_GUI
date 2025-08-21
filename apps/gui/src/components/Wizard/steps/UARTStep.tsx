import React, { useEffect, useState } from 'react';
import { FluidNCConfig, UARTChannelConfig } from '@fluidnc-gui/core';
import { PinInput } from '../../PinInput';
import { usePinManager } from '../../../hooks/usePinManager';

interface UARTStepProps {
  config: FluidNCConfig;
  onConfigChange: (updates: Partial<FluidNCConfig>) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const UARTStep: React.FC<UARTStepProps> = ({
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
    
    // Validate UART channels
    if (config.uart) {
      Object.entries(config.uart).forEach(([channelKey, channel]) => {
        if (typeof channel === 'object' && channel !== null) {
          const uartChannel = channel as UARTChannelConfig;
          
          // Validate TXD pin
          if (uartChannel.txd_pin && typeof uartChannel.txd_pin === 'string') {
            const validation = pinManager.validatePinAssignment(uartChannel.txd_pin, `uart.${channelKey}.txd_pin`);
            if (!validation.isValid) {
              newErrors.push(`${channelKey} TXD: ${validation.errors[0]}`);
            }
          }
          
          // Validate RXD pin
          if (uartChannel.rxd_pin && typeof uartChannel.rxd_pin === 'string') {
            const validation = pinManager.validatePinAssignment(uartChannel.rxd_pin, `uart.${channelKey}.rxd_pin`);
            if (!validation.isValid) {
              newErrors.push(`${channelKey} RXD: ${validation.errors[0]}`);
            }
          }
          
          // Validate RTS pin
          if (uartChannel.rts_pin && typeof uartChannel.rts_pin === 'string') {
            const validation = pinManager.validatePinAssignment(uartChannel.rts_pin, `uart.${channelKey}.rts_pin`);
            if (!validation.isValid) {
              newErrors.push(`${channelKey} RTS: ${validation.errors[0]}`);
            }
          }
          
          // Validate baud rate
          if (uartChannel.baud && (uartChannel.baud <= 0 || uartChannel.baud > 921600)) {
            newErrors.push(`${channelKey}: Baud rate must be between 1 and 921600`);
          }
        }
      });
    }

    setErrors(newErrors);
    const isValid = newErrors.length === 0;
    onValidationChange(isValid);
  };

  useEffect(validateStep, [config, pinManager, onValidationChange]);

  const handleUARTConfigChange = (channelKey: string, field: keyof UARTChannelConfig, value: string | number) => {
    const currentUart = config.uart || {};
    const currentChannel = currentUart[channelKey] || {};
    
    const updatedChannel: UARTChannelConfig = { ...currentChannel };
    
    if (value === '') {
      delete updatedChannel[field];
    } else {
      updatedChannel[field] = value;
    }
    
    const updatedUart = { ...currentUart };
    if (Object.keys(updatedChannel).length > 0) {
      updatedUart[channelKey] = updatedChannel;
    } else {
      delete updatedUart[channelKey];
    }
    
    onConfigChange({ 
      ...(Object.keys(updatedUart).length > 0 ? { uart: updatedUart } : {})
    });
  };

  const renderUARTChannel = (channelKey: string, channelName: string) => {
    const channel = config.uart?.[channelKey] as UARTChannelConfig | undefined;
    
    return (
      <div key={channelKey} className="section">
        <h3>{channelName}</h3>
        <p>Configure UART communication channel for {channelName.toLowerCase()}.</p>
        
        <div className="form-grid">
          <div className="form-group">
            <PinInput
              label="TXD Pin"
              value={channel?.txd_pin || ''}
              onChange={(value) => handleUARTConfigChange(channelKey, 'txd_pin', value)}
              config={config}
              sourceField={`uart.${channelKey}.txd_pin`}
              placeholder="e.g., gpio.1"
            />
            <small>Transmit data pin</small>
          </div>
          
          <div className="form-group">
            <PinInput
              label="RXD Pin"
              value={channel?.rxd_pin || ''}
              onChange={(value) => handleUARTConfigChange(channelKey, 'rxd_pin', value)}
              config={config}
              sourceField={`uart.${channelKey}.rxd_pin`}
              placeholder="e.g., gpio.2"
            />
            <small>Receive data pin</small>
          </div>
          
          <div className="form-group">
            <PinInput
              label="RTS Pin (Optional)"
              value={channel?.rts_pin || ''}
              onChange={(value) => handleUARTConfigChange(channelKey, 'rts_pin', value)}
              config={config}
              sourceField={`uart.${channelKey}.rts_pin`}
              placeholder="e.g., gpio.3"
            />
            <small>Request to send pin (flow control)</small>
          </div>
          
          <div className="form-group">
            <label>Baud Rate</label>
            <select
              value={channel?.baud || 115200}
              onChange={(e) => handleUARTConfigChange(channelKey, 'baud', parseInt(e.target.value))}
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200</option>
              <option value={230400}>230400</option>
              <option value={460800}>460800</option>
              <option value={921600}>921600</option>
            </select>
            <small>Communication speed in bits per second</small>
          </div>
          
          <div className="form-group">
            <label>Mode (Optional)</label>
            <input
              type="text"
              value={channel?.mode || ''}
              onChange={(e) => handleUARTConfigChange(channelKey, 'mode', e.target.value)}
              placeholder="e.g., 8N1"
            />
            <small>UART mode configuration (data bits, parity, stop bits)</small>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="uart-step">
      <div className="step-header">
        <h2>UART Configuration</h2>
        <p>Configure UART (Universal Asynchronous Receiver-Transmitter) channels for serial communication. UART is commonly used for connecting external devices like displays, WiFi modules, or other controllers.</p>
      </div>

      {renderUARTChannel('uart0', 'UART Channel 0')}
      {renderUARTChannel('uart1', 'UART Channel 1')}
      {renderUARTChannel('uart2', 'UART Channel 2')}

      <div className="info-section">
        <h3>💡 UART Usage Tips</h3>
        <ul>
          <li><strong>UART0:</strong> Often used for the main communication interface</li>
          <li><strong>UART1:</strong> Secondary communication, external displays, or WiFi modules</li>
          <li><strong>UART2:</strong> Additional peripherals or debugging interfaces</li>
          <li><strong>Baud Rate:</strong> Must match the connected device. 115200 is most common</li>
          <li><strong>Flow Control:</strong> RTS pin is optional, used for hardware flow control</li>
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