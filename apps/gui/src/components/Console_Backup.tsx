import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

// Connection types
type ConnectionType = 'Serial' | 'Tcp' | 'WebSocket';

interface SerialPortInfo {
  port_name: string;
  port_type: string;
}

interface ConnectionInfo {
  connection_id: string;
  connection_type: ConnectionType;
  address: string;
  baud_rate?: number;
  is_connected: boolean;
}

interface ConnectionMessage {
  connection_id: string;
  data: string;
  timestamp: number;
  is_error: boolean;
}

// Legacy interfaces for backward compatibility
interface SerialConnectionInfo {
  port_name: string;
  baud_rate: number;
  is_connected: boolean;
}

interface SerialMessage {
  port_name: string;
  data: string;
  timestamp: number;
  is_error: boolean;
}

const Console: React.FC = () => {
  // Connection type state
  const [connectionType, setConnectionType] = useState<ConnectionType>('Serial');
  
  // Serial-specific state
  const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(115200);
  
  // Wi-Fi/Network-specific state
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.100');
  const [port, setPort] = useState<number>(23);
  
  // Common state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<ConnectionMessage[]>([]);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentConnectionId, setCurrentConnectionId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load available serial ports on component mount
  useEffect(() => {
    loadSerialPorts();
  }, []);

  // Listen for connection data events (replaces serial-data for new generic system)
  useEffect(() => {
    const unlisten = listen<ConnectionMessage>('connection-data', (event: any) => {
      const message = event.payload;
      setMessages((prev: ConnectionMessage[]) => [...prev, message]);
    });

    return () => {
      unlisten.then((fn: () => void) => fn());
    };
  }, []);

  // Fallback: Listen for legacy serial data events for backward compatibility
  useEffect(() => {
    const unlisten = listen<SerialMessage>('serial-data', (event: any) => {
      const message = event.payload;
      // Convert legacy SerialMessage to ConnectionMessage
      const connectionMessage: ConnectionMessage = {
        connection_id: message.port_name,
        data: message.data,
        timestamp: message.timestamp,
        is_error: message.is_error,
      };
      setMessages((prev: ConnectionMessage[]) => [...prev, connectionMessage]);
    });

    return () => {
      unlisten.then((fn: () => void) => fn());
    };
  }, []);

  const loadSerialPorts = async () => {
    try {
      const ports = await invoke<SerialPortInfo[]>('list_serial_ports');
      setAvailablePorts(ports);
      if (ports.length > 0 && !selectedPort && ports[0]) {
        setSelectedPort(ports[0].port_name);
      }
    } catch (err) {
      setError(`Failed to load serial ports: ${err}`);
    }
  };

  const connectToDevice = async () => {
    let address: string;
    let baudRateParam: number | undefined;

    if (connectionType === 'Serial') {
      if (!selectedPort) {
        setError('Please select a serial port');
        return;
      }
      address = selectedPort;
      baudRateParam = baudRate;
    } else {
      // TCP or WebSocket
      address = `${ipAddress}:${port}`;
      baudRateParam = undefined;
    }

    setIsLoading(true);
    setError('');

    try {
      // Try the new generic connection method first
      try {
        const connectionInfo = await invoke<ConnectionInfo>('connect_device', {
          connectionType: connectionType,
          address: address,
          baudRate: baudRateParam,
        });
        
        setIsConnected(connectionInfo.is_connected);
        setCurrentConnectionId(connectionInfo.connection_id);
        
        // Add connection message
        const connectMessage: ConnectionMessage = {
          connection_id: connectionInfo.connection_id,
          data: `Connected to ${address} (${connectionType})`,
          timestamp: Date.now(),
          is_error: false,
        };
        setMessages((prev: ConnectionMessage[]) => [...prev, connectMessage]);
        
      } catch (newApiError) {
        // Fallback to legacy serial connection for backward compatibility
        if (connectionType === 'Serial') {
          const connectionInfo = await invoke<SerialConnectionInfo>('connect_serial_port', {
            portName: selectedPort,
            baudRate: baudRate,
          });
          
          setIsConnected(connectionInfo.is_connected);
          setCurrentConnectionId(selectedPort);
          
          // Add connection message
          const connectMessage: ConnectionMessage = {
            connection_id: selectedPort,
            data: `Connected to ${selectedPort} at ${baudRate} baud`,
            timestamp: Date.now(),
            is_error: false,
          };
          setMessages((prev: ConnectionMessage[]) => [...prev, connectMessage]);
        } else {
          throw new Error('Wi-Fi connections require updated backend. Please ensure the latest version is installed.');
        }
      }
      
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
      // Try new generic disconnect first
      try {
        await invoke('disconnect_device', {
          connectionId: currentConnectionId,
        });
      } catch (newApiError) {
        // Fallback to legacy serial disconnect
        await invoke('disconnect_serial_port', {
          portName: currentConnectionId,
        });
      }
      
      setIsConnected(false);
      
      // Add disconnection message
      const disconnectMessage: ConnectionMessage = {
        connection_id: currentConnectionId,
        data: `Disconnected from ${currentConnectionId}`,
        timestamp: Date.now(),
        is_error: false,
      };
      setMessages((prev: ConnectionMessage[]) => [...prev, disconnectMessage]);
      
    } catch (err) {
      setError(`Failed to disconnect: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendCommand = async () => {
    if (!inputCommand.trim() || !isConnected || !currentConnectionId) return;

    try {
      // Try new generic write first
      try {
        await invoke('write_device_data', {
          connectionId: currentConnectionId,
          data: inputCommand.trim(),
        });
      } catch (newApiError) {
        // Fallback to legacy serial write
        await invoke('write_serial_data', {
          portName: currentConnectionId,
          data: inputCommand.trim(),
        });
      }

      // Add sent command to messages
      const sentMessage: ConnectionMessage = {
        connection_id: currentConnectionId,
        data: `> ${inputCommand.trim()}`,
        timestamp: Date.now(),
        is_error: false,
      };
      setMessages((prev: ConnectionMessage[]) => [...prev, sentMessage]);
      setInputCommand('');
      
    } catch (err) {
      setError(`Failed to send command: ${err}`);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      sendCommand();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      fontFamily: 'monospace',
      backgroundColor: '#1e1e1e',
      color: '#ffffff'
    }}>
      {/* Header with connection controls */}
      <div style={{ 
        padding: '10px', 
        borderBottom: '1px solid #333',
        backgroundColor: '#2d2d2d'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>FluidNC Console</h2>
        
        {error && (
          <div style={{ color: '#ff6b6b', marginBottom: '10px', padding: '5px', backgroundColor: '#ffebee', border: '1px solid #ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Connection Type Selector */}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>Connection Type:</label>
          <select 
            value={connectionType} 
            onChange={(e: any) => setConnectionType(e.target.value as ConnectionType)}
            style={{ padding: '5px', marginRight: '10px' }}
          >
            <option value="Serial">Serial Port</option>
            <option value="Tcp">TCP (Wi-Fi)</option>
            <option value="WebSocket">WebSocket (Wi-Fi)</option>
          </select>
        </div>

        {/* Serial Port Configuration */}
        {connectionType === 'Serial' && (
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={loadSerialPorts}
              style={{
                padding: '5px 10px',
                marginRight: '10px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Refresh Ports
            </button>
            
            <select 
              value={selectedPort} 
              onChange={(e: any) => setSelectedPort(e.target.value)}
              style={{ padding: '5px', marginRight: '10px', minWidth: '150px' }}
            >
              {availablePorts.map((port: any) => (
                <option key={port.port_name} value={port.port_name}>
                  {port.port_name} ({port.port_type})
                </option>
              ))}
            </select>
            
            <label style={{ marginRight: '5px' }}>Baud Rate:</label>
            <select 
              value={baudRate} 
              onChange={(e: any) => setBaudRate(parseInt(e.target.value))}
              style={{ padding: '5px', marginRight: '10px' }}
            >
              <option value={9600}>9600</option>
              <option value={19200}>19200</option>
              <option value={38400}>38400</option>
              <option value={57600}>57600</option>
              <option value={115200}>115200</option>
              <option value={230400}>230400</option>
            </select>
          </div>
        )}

        {/* Wi-Fi/Network Configuration */}
        {(connectionType === 'Tcp' || connectionType === 'WebSocket') && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '5px' }}>IP Address:</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e: any) => setIpAddress(e.target.value)}
              placeholder="192.168.1.100"
              style={{ padding: '5px', marginRight: '10px', width: '150px' }}
            />
            
            <label style={{ marginRight: '5px' }}>Port:</label>
            <input
              type="number"
              value={port}
              onChange={(e: any) => setPort(parseInt(e.target.value))}
              placeholder="23"
              style={{ padding: '5px', marginRight: '10px', width: '80px' }}
            />
          </div>
        )}

        {/* Connection Controls */}
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={isConnected ? disconnectFromDevice : connectToDevice}
            disabled={isLoading}
            style={{
              padding: '8px 15px',
              backgroundColor: isConnected ? '#f44336' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {isLoading ? 'Connecting...' : (isConnected ? 'Disconnect' : 'Connect')}
          </button>
          
          <span style={{ 
            padding: '8px 15px',
            backgroundColor: isConnected ? '#4CAF50' : '#666',
            color: 'white',
            borderRadius: '3px'
          }}>
            {isConnected ? `Connected (${connectionType})` : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={messagesContainerRef}
        style={{ 
          flex: 1, 
          padding: '10px', 
          overflowY: 'auto',
          backgroundColor: '#1e1e1e',
          border: '1px solid #333'
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={clearMessages}
            style={{
              padding: '5px 10px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear Messages
          </button>
        </div>
        
        {messages.map((message: any, index: any) => (
          <div 
            key={index}
            style={{ 
              marginBottom: '5px',
              padding: '5px',
              backgroundColor: message.is_error ? '#ffebee' : 'transparent',
              color: message.is_error ? '#f44336' : (message.data.startsWith('>') ? '#4CAF50' : '#ffffff'),
              borderLeft: message.is_error ? '3px solid #f44336' : (message.data.startsWith('>') ? '3px solid #4CAF50' : 'none'),
              paddingLeft: message.is_error || message.data.startsWith('>') ? '8px' : '5px'
            }}
          >
            <span style={{ opacity: 0.7, fontSize: '12px', marginRight: '10px' }}>
              [{formatTimestamp(message.timestamp)}]
            </span>
            <span>{message.data}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{ 
        padding: '10px', 
        borderTop: '1px solid #333',
        backgroundColor: '#2d2d2d'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputCommand}
            onChange={(e: any) => setInputCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter G-code command..."
            disabled={!isConnected}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid #ccc',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={sendCommand}
            disabled={!isConnected || !inputCommand.trim()}
            style={{
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: isConnected && inputCommand.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
        padding: '10px', 
        borderBottom: '1px solid #333',
        backgroundColor: '#2d2d2d'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#ffffff' }}>Serial Console</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
            disabled={isConnected || isLoading}
            style={{
              padding: '5px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555'
            }}
          >
            <option value="">Select Port</option>
            {availablePorts.map((port) => (
              <option key={port.port_name} value={port.port_name}>
                {port.port_name} ({port.port_type})
              </option>
            ))}
          </select>

          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={isConnected || isLoading}
            style={{
              padding: '5px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555'
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
            onClick={isConnected ? disconnectFromPort : connectToPort}
            disabled={isLoading || !selectedPort}
            style={{
              padding: '5px 15px',
              backgroundColor: isConnected ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Working...' : isConnected ? 'Disconnect' : 'Connect'}
          </button>

          <button
            onClick={loadSerialPorts}
            disabled={isLoading}
            style={{
              padding: '5px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Refresh Ports
          </button>

          <button
            onClick={clearMessages}
            style={{
              padding: '5px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>

          <div style={{ 
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#28a745' : '#dc3545'
            }}></div>
            <span style={{ fontSize: '12px' }}>
              {isConnected ? `Connected to ${selectedPort}` : 'Disconnected'}
            </span>
          </div>
        </div>

        {error && (
          <div style={{ 
            marginTop: '10px',
            padding: '5px 10px',
            backgroundColor: '#dc3545',
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '10px',
          backgroundColor: '#1e1e1e'
        }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: '2px',
              fontSize: '12px',
              fontFamily: 'Consolas, Monaco, monospace',
              color: message.is_error ? '#ff6b6b' : 
                     message.data.startsWith('>') ? '#4ecdc4' : '#ffffff',
              whiteSpace: 'pre-wrap'
            }}
          >
            <span style={{ color: '#888', marginRight: '8px' }}>
              {formatTimestamp(message.timestamp)}
            </span>
            {message.data}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div style={{ 
        padding: '10px',
        borderTop: '1px solid #333',
        backgroundColor: '#2d2d2d'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Enter command..." : "Connect to a port first"}
            disabled={!isConnected}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '3px',
              fontFamily: 'Consolas, Monaco, monospace'
            }}
          />
          <button
            onClick={sendCommand}
            disabled={!isConnected || !inputCommand.trim()}
            style={{
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: isConnected && inputCommand.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Console;