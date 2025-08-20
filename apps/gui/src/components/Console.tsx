import React, { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

interface SerialPortInfo {
  port_name: string;
  port_type: string;
}

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
  const [availablePorts, setAvailablePorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<SerialMessage[]>([]);
  const [inputCommand, setInputCommand] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
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

  // Listen for serial data events
  useEffect(() => {
    const unlisten = listen<SerialMessage>('serial-data', (event) => {
      const message = event.payload;
      setMessages(prev => [...prev, message]);
    });

    return () => {
      unlisten.then(fn => fn());
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

  const connectToPort = async () => {
    if (!selectedPort) {
      setError('Please select a serial port');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const connectionInfo = await invoke<SerialConnectionInfo>('connect_serial_port', {
        portName: selectedPort,
        baudRate: baudRate,
      });
      
      setIsConnected(connectionInfo.is_connected);
      
      // Add connection message
      const connectMessage: SerialMessage = {
        port_name: selectedPort,
        data: `Connected to ${selectedPort} at ${baudRate} baud`,
        timestamp: Date.now(),
        is_error: false,
      };
      setMessages(prev => [...prev, connectMessage]);
      
    } catch (err) {
      setError(`Failed to connect: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectFromPort = async () => {
    if (!selectedPort) return;

    setIsLoading(true);
    try {
      await invoke('disconnect_serial_port', {
        portName: selectedPort,
      });
      
      setIsConnected(false);
      
      // Add disconnection message
      const disconnectMessage: SerialMessage = {
        port_name: selectedPort,
        data: `Disconnected from ${selectedPort}`,
        timestamp: Date.now(),
        is_error: false,
      };
      setMessages(prev => [...prev, disconnectMessage]);
      
    } catch (err) {
      setError(`Failed to disconnect: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendCommand = async () => {
    if (!inputCommand.trim() || !isConnected || !selectedPort) return;

    try {
      await invoke('write_serial_data', {
        portName: selectedPort,
        data: inputCommand.trim(),
      });

      // Add sent command to messages
      const sentMessage: SerialMessage = {
        port_name: selectedPort,
        data: `> ${inputCommand.trim()}`,
        timestamp: Date.now(),
        is_error: false,
      };
      setMessages(prev => [...prev, sentMessage]);
      setInputCommand('');
      
    } catch (err) {
      setError(`Failed to send command: ${err}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    <div className="console-container" style={{ 
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