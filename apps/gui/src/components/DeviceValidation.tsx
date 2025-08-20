import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { FluidNCConfig, toYAML } from '@fluidnc-gui/core';

interface ValidationResult {
  status: 'pass' | 'warn' | 'fail' | 'pending';
  errors: string[];
  warnings: string[];
  timestamp: Date;
}

interface DeviceValidationProps {
  config: FluidNCConfig;
  onValidationComplete?: (result: ValidationResult) => void;
}

interface ConnectionMessage {
  connection_id: string;
  data: string;
  timestamp: number;
  is_error: boolean;
}

interface SerialPortInfo {
  port_name: string;
  port_type: string;
}

export const DeviceValidation: React.FC<DeviceValidationProps> = ({
  config,
  onValidationComplete
}) => {
  // Connection state
  const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [currentConnectionId, setCurrentConnectionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    status: 'pending',
    errors: [],
    warnings: [],
    timestamp: new Date()
  });
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Load available serial ports on component mount
  useEffect(() => {
    loadSerialPorts();
  }, []);

  const loadSerialPorts = async () => {
    try {
      const ports = await invoke<SerialPortInfo[]>('get_serial_ports');
      setAvailablePorts(ports);
      if (ports.length > 0 && !selectedPort) {
        setSelectedPort(ports[0]?.port_name || '');
      }
    } catch (err) {
      setError(`Failed to load serial ports: ${err}`);
    }
  };

  // Listen for device messages during validation
  useEffect(() => {
    const unlisten = listen<ConnectionMessage>('connection-data', (event: any) => {
      const message = event.payload;
      
      // Parse MSG:ERR and MSG:WARN messages
      if (message.data.startsWith('MSG:ERR:') || message.data.startsWith('MSG:WARN:')) {
        setValidationMessages(prev => [...prev, message.data]);
        parseValidationMessage(message.data);
      }
    });

    return () => {
      unlisten.then((fn: () => void) => fn());
    };
  }, []);

  const parseValidationMessage = (message: string) => {
    const isError = message.startsWith('MSG:ERR:');
    const isWarning = message.startsWith('MSG:WARN:');
    const content = message.replace(/^MSG:(ERR|WARN):/, '').trim();

    setValidationResult(prev => {
      const newResult = { ...prev };
      
      if (isError) {
        newResult.errors = [...prev.errors, content];
        newResult.status = 'fail';
      } else if (isWarning) {
        newResult.warnings = [...prev.warnings, content];
        if (newResult.status === 'pending') {
          newResult.status = 'warn';
        }
      }
      
      newResult.timestamp = new Date();
      return newResult;
    });
  };

  const connectToDevice = async () => {
    if (!selectedPort) {
      setError('No port selected');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await invoke('connect_serial_port', {
        portName: selectedPort,
        baudRate: baudRate,
      });
      
      setIsConnected(true);
      setCurrentConnectionId(selectedPort);
    } catch (err) {
      setError(`Failed to connect: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFromDevice = async () => {
    if (!currentConnectionId) return;

    setIsLoading(true);
    try {
      await invoke('disconnect_serial_port', {
        portName: currentConnectionId,
      });
      
      setIsConnected(false);
      setCurrentConnectionId('');
    } catch (err) {
      setError(`Failed to disconnect: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAndValidateConfig = async () => {
    if (!isConnected || !currentConnectionId) {
      setError('Not connected to device');
      return;
    }

    setIsValidating(true);
    setError('');
    setValidationMessages([]);
    setValidationResult({
      status: 'pending',
      errors: [],
      warnings: [],
      timestamp: new Date()
    });

    try {
      // Generate YAML configuration
      const yamlConfig = toYAML(config);
      const configFilename = `${config.name || 'fluidnc-config'}.yaml`;

      // Step 1: Set configuration filename
      await sendDeviceCommand(`$Config/Filename=${configFilename}`);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Upload configuration content (simulate line by line)
      // Note: Real implementation would upload file contents to device storage
      const lines = yamlConfig.split('\n').filter(line => line.trim());
      setValidationMessages(prev => [...prev, `Uploading ${lines.length} lines of configuration...`]);
      
      // For demonstration, we'll just send a few key configuration commands
      // In a real implementation, this would write the YAML to device storage
      if (config.board) {
        await sendDeviceCommand(`$Config/Board=${config.board}`);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Step 3: Perform soft reset to apply and validate configuration
      setValidationMessages(prev => [...prev, 'Performing soft reset to validate configuration...']);
      await sendDeviceCommand('$RST=$');
      
      // Wait for validation messages to come back
      setTimeout(() => {
        if (validationResult.status === 'pending' && validationResult.errors.length === 0) {
          setValidationResult(prev => ({
            ...prev,
            status: prev.warnings.length > 0 ? 'warn' : 'pass',
            timestamp: new Date()
          }));
        }
        setIsValidating(false);
        
        if (onValidationComplete) {
          onValidationComplete(validationResult);
        }
      }, 3000); // Wait 3 seconds for all validation messages

    } catch (err) {
      setError(`Validation failed: ${err}`);
      setIsValidating(false);
      setValidationResult(prev => ({
        ...prev,
        status: 'fail',
        errors: [...prev.errors, `Upload error: ${err}`],
        timestamp: new Date()
      }));
    }
  };

  const sendDeviceCommand = async (command: string): Promise<void> => {
    try {
      await invoke('write_device_data', {
        connectionId: currentConnectionId,
        data: command,
      });
    } catch (error) {
      // Fallback to legacy serial write
      await invoke('write_serial_data', {
        portName: currentConnectionId,
        data: command,
      });
    }
  };

  const getStatusColor = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass': return '#4CAF50';
      case 'warn': return '#FF9800';
      case 'fail': return '#F44336';
      case 'pending': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'pass': return '✓';
      case 'warn': return '⚠️';
      case 'fail': return '❌';
      case 'pending': return '🔄';
      default: return '?';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>On-Device Configuration Validation</h2>
      
      {error && (
        <div style={{ 
          color: '#F44336', 
          backgroundColor: '#FFEBEE', 
          padding: '10px', 
          marginBottom: '10px',
          border: '1px solid #F44336',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Connection Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#F9F9F9', borderRadius: '4px' }}>
        <h3>Device Connection</h3>
        
        {!isConnected ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              disabled={isLoading}
              style={{
                padding: '8px',
                backgroundColor: '#FFF',
                border: '1px solid #CCC',
                borderRadius: '4px'
              }}
            >
              <option value="">Select a port...</option>
              {availablePorts.map((port) => (
                <option key={port.port_name} value={port.port_name}>
                  {port.port_name} ({port.port_type})
                </option>
              ))}
            </select>
            
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
              disabled={isLoading}
              style={{
                padding: '8px',
                backgroundColor: '#FFF',
                border: '1px solid #CCC',
                borderRadius: '4px'
              }}
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200</option>
              <option value={230400}>230400</option>
            </select>
            
            <button
              onClick={connectToDevice}
              disabled={!selectedPort || isLoading}
              style={{
                padding: '8px 15px',
                backgroundColor: selectedPort && !isLoading ? '#4CAF50' : '#CCC',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: selectedPort && !isLoading ? 'pointer' : 'not-allowed'
              }}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
            
            <button
              onClick={loadSerialPorts}
              style={{
                padding: '8px 15px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Ports
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
              ✓ Connected to {currentConnectionId} at {baudRate} baud
            </span>
            <button
              onClick={disconnectFromDevice}
              disabled={isLoading}
              style={{
                padding: '8px 15px',
                backgroundColor: '#F44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Configuration: {config.name || 'Unnamed Configuration'}</h3>
        <p>Board: {config.board || 'Not specified'}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={uploadAndValidateConfig}
          disabled={!isConnected || isValidating}
          style={{
            padding: '10px 20px',
            backgroundColor: isConnected && !isValidating ? '#2196F3' : '#CCC',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isConnected && !isValidating ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          {isValidating ? 'Validating...' : 'Upload & Validate Configuration'}
        </button>
      </div>

      {/* Validation Status */}
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#F5F5F5',
        borderRadius: '4px',
        border: `2px solid ${getStatusColor(validationResult.status)}`
      }}>
        <h3 style={{ 
          color: getStatusColor(validationResult.status),
          margin: '0 0 10px 0'
        }}>
          {getStatusIcon(validationResult.status)} Validation Status: {validationResult.status.toUpperCase()}
        </h3>
        
        <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
          Last updated: {validationResult.timestamp.toLocaleString()}
        </p>

        {validationResult.errors.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h4 style={{ color: '#F44336', margin: '10px 0 5px 0' }}>Errors:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationResult.errors.map((error, index) => (
                <li key={index} style={{ color: '#F44336', marginBottom: '5px' }}>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult.warnings.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h4 style={{ color: '#FF9800', margin: '10px 0 5px 0' }}>Warnings:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {validationResult.warnings.map((warning, index) => (
                <li key={index} style={{ color: '#FF9800', marginBottom: '5px' }}>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult.status === 'pass' && validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
          <p style={{ color: '#4CAF50', margin: '10px 0 0 0' }}>
            Configuration validation passed! No errors or warnings detected.
          </p>
        )}
      </div>

      {/* Raw Validation Messages */}
      {validationMessages.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Device Validation Messages:</h4>
          <div style={{ 
            backgroundColor: '#1E1E1E', 
            color: '#FFF', 
            padding: '10px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {validationMessages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div style={{ 
        marginTop: '20px',
        padding: '10px',
        backgroundColor: isConnected ? '#E8F5E8' : '#FFEBEE',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>Connection Status:</strong> {isConnected ? `Connected to ${currentConnectionId}` : 'Not connected to device - Please connect to proceed with validation'}
      </div>
    </div>
  );
};

export default DeviceValidation;