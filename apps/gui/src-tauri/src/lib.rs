// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde::{Deserialize, Serialize};
use serialport::SerialPort;
use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write, BufWriter};
use std::net::TcpStream;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};
use tokio_tungstenite::{connect_async, tungstenite::Message};
use futures_util::{SinkExt, StreamExt};

// Connection type enum
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConnectionType {
    Serial,
    Tcp,
    WebSocket,
}

// Generic connection info struct
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionInfo {
    pub connection_id: String,
    pub connection_type: ConnectionType,
    pub address: String, // Serial port name, or IP:port for network
    pub baud_rate: Option<u32>, // Only used for serial
    pub is_connected: bool,
}

// Message struct that works for all connection types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionMessage {
    pub connection_id: String,
    pub data: String,
    pub timestamp: u64,
    pub is_error: bool,
}

// Connection trait for different connection types
pub trait Connection: Send {
    fn write_data(&mut self, data: &str) -> Result<(), String>;
    fn read_data(&mut self) -> Result<Option<String>, String>;
}

// Serial connection wrapper
pub struct SerialConnection {
    port: Box<dyn SerialPort + Send>,
}

impl SerialConnection {
    pub fn new(port: Box<dyn SerialPort + Send>) -> Self {
        Self { port }
    }
}

impl Connection for SerialConnection {
    fn write_data(&mut self, data: &str) -> Result<(), String> {
        let data_with_newline = format!("{}\n", data);
        self.port.write_all(data_with_newline.as_bytes())
            .map_err(|e| format!("Failed to write to serial port: {}", e))?;
        self.port.flush()
            .map_err(|e| format!("Failed to flush serial port: {}", e))?;
        Ok(())
    }

    fn read_data(&mut self) -> Result<Option<String>, String> {
        // This is handled differently for serial - we use the existing threaded approach
        Ok(None)
    }
}

// TCP connection wrapper
pub struct TcpConnection {
    stream: TcpStream,
}

impl TcpConnection {
    pub fn new(address: &str) -> Result<Self, String> {
        let stream = TcpStream::connect(address)
            .map_err(|e| format!("Failed to connect to TCP {}: {}", address, e))?;
        stream.set_read_timeout(Some(Duration::from_millis(100)))
            .map_err(|e| format!("Failed to set TCP read timeout: {}", e))?;
        Ok(Self { stream })
    }
}

impl Connection for TcpConnection {
    fn write_data(&mut self, data: &str) -> Result<(), String> {
        let data_with_newline = format!("{}\n", data);
        self.stream.write_all(data_with_newline.as_bytes())
            .map_err(|e| format!("Failed to write to TCP: {}", e))?;
        self.stream.flush()
            .map_err(|e| format!("Failed to flush TCP: {}", e))?;
        Ok(())
    }

    fn read_data(&mut self) -> Result<Option<String>, String> {
        let mut reader = BufReader::new(&self.stream);
        let mut line = String::new();
        match reader.read_line(&mut line) {
            Ok(0) => Ok(None), // EOF
            Ok(_) => Ok(Some(line.trim_end().to_string())),
            Err(e) if e.kind() == std::io::ErrorKind::TimedOut => Ok(None),
            Err(e) => Err(format!("TCP read error: {}", e)),
        }
    }
}

// Shared state for all connections
pub type Connections = Arc<Mutex<HashMap<String, Box<dyn Connection + Send>>>>;

// Legacy compatibility structs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerialPortInfo {
    pub port_name: String,
    pub port_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerialConnectionInfo {
    pub port_name: String,
    pub baud_rate: u32,
    pub is_connected: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerialMessage {
    pub port_name: String,
    pub data: String,
    pub timestamp: u64,
    pub is_error: bool,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn list_serial_ports() -> Result<Vec<SerialPortInfo>, String> {
    let ports = serialport::available_ports()
        .map_err(|e| format!("Failed to list serial ports: {}", e))?;
    
    let port_infos = ports.into_iter().map(|port| {
        SerialPortInfo {
            port_name: port.port_name,
            port_type: format!("{:?}", port.port_type),
        }
    }).collect();
    
    Ok(port_infos)
}

// New generic connection commands
#[tauri::command]
fn connect_device(
    connection_type: ConnectionType,
    address: String,
    baud_rate: Option<u32>,
    connections: State<'_, Connections>,
    app_handle: AppHandle,
) -> Result<ConnectionInfo, String> {
    let connection_id = address.clone();
    
    // Check if already connected
    {
        let connections_guard = connections.lock().unwrap();
        if connections_guard.contains_key(&connection_id) {
            return Ok(ConnectionInfo {
                connection_id,
                connection_type,
                address,
                baud_rate,
                is_connected: true,
            });
        }
    }

    // Create connection based on type
    let connection: Box<dyn Connection + Send> = match connection_type {
        ConnectionType::Serial => {
            let baud_rate = baud_rate.unwrap_or(115200);
            let port = serialport::new(&address, baud_rate)
                .timeout(Duration::from_millis(100))
                .open()
                .map_err(|e| format!("Failed to open serial port {}: {}", address, e))?;
            
            // Start reading thread for serial
            let read_port = port
                .try_clone()
                .map_err(|e| format!("Failed to clone serial port: {}", e))?;
            
            let connection_id_clone = connection_id.clone();
            let app_handle_clone = app_handle.clone();
            thread::spawn(move || {
                let mut reader = BufReader::new(read_port);
                let mut line = String::new();
                
                loop {
                    line.clear();
                    match reader.read_line(&mut line) {
                        Ok(0) => break, // EOF
                        Ok(_) => {
                            let message = ConnectionMessage {
                                connection_id: connection_id_clone.clone(),
                                data: line.trim_end().to_string(),
                                timestamp: std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_millis() as u64,
                                is_error: false,
                            };
                            
                            if let Err(e) = app_handle_clone.emit("connection-data", &message) {
                                eprintln!("Failed to emit connection data: {}", e);
                                break;
                            }
                        }
                        Err(e) => {
                            if e.kind() == std::io::ErrorKind::TimedOut {
                                continue;
                            }
                            
                            let error_message = ConnectionMessage {
                                connection_id: connection_id_clone.clone(),
                                data: format!("Read error: {}", e),
                                timestamp: std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_millis() as u64,
                                is_error: true,
                            };
                            
                            let _ = app_handle_clone.emit("connection-data", &error_message);
                            break;
                        }
                    }
                }
            });
            
            Box::new(SerialConnection::new(port))
        }
        ConnectionType::Tcp => {
            let tcp_conn = TcpConnection::new(&address)?;
            
            // Start reading thread for TCP
            let address_clone = address.clone();
            let connection_id_clone = connection_id.clone();
            let app_handle_clone = app_handle.clone();
            thread::spawn(move || {
                let mut tcp_stream = match TcpStream::connect(&address_clone) {
                    Ok(stream) => stream,
                    Err(e) => {
                        let error_message = ConnectionMessage {
                            connection_id: connection_id_clone,
                            data: format!("Failed to connect: {}", e),
                            timestamp: std::time::SystemTime::now()
                                .duration_since(std::time::UNIX_EPOCH)
                                .unwrap()
                                .as_millis() as u64,
                            is_error: true,
                        };
                        let _ = app_handle_clone.emit("connection-data", &error_message);
                        return;
                    }
                };
                
                tcp_stream.set_read_timeout(Some(Duration::from_millis(100))).ok();
                let mut reader = BufReader::new(&tcp_stream);
                let mut line = String::new();
                
                loop {
                    line.clear();
                    match reader.read_line(&mut line) {
                        Ok(0) => break, // EOF
                        Ok(_) => {
                            let message = ConnectionMessage {
                                connection_id: connection_id_clone.clone(),
                                data: line.trim_end().to_string(),
                                timestamp: std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_millis() as u64,
                                is_error: false,
                            };
                            
                            if let Err(e) = app_handle_clone.emit("connection-data", &message) {
                                eprintln!("Failed to emit connection data: {}", e);
                                break;
                            }
                        }
                        Err(e) => {
                            if e.kind() == std::io::ErrorKind::TimedOut {
                                continue;
                            }
                            
                            let error_message = ConnectionMessage {
                                connection_id: connection_id_clone.clone(),
                                data: format!("TCP read error: {}", e),
                                timestamp: std::time::SystemTime::now()
                                    .duration_since(std::time::UNIX_EPOCH)
                                    .unwrap()
                                    .as_millis() as u64,
                                is_error: true,
                            };
                            
                            let _ = app_handle_clone.emit("connection-data", &error_message);
                            break;
                        }
                    }
                }
            });
            
            Box::new(tcp_conn)
        }
        ConnectionType::WebSocket => {
            // For now, we'll implement WebSocket as a future enhancement
            return Err("WebSocket connections not yet implemented".to_string());
        }
    };

    // Store connection
    {
        let mut connections_guard = connections.lock().unwrap();
        connections_guard.insert(connection_id.clone(), connection);
    }

    Ok(ConnectionInfo {
        connection_id,
        connection_type,
        address,
        baud_rate,
        is_connected: true,
    })
}

#[tauri::command]
fn disconnect_device(
    connection_id: String,
    connections: State<'_, Connections>,
) -> Result<(), String> {
    let mut connections_guard = connections.lock().unwrap();
    connections_guard.remove(&connection_id);
    Ok(())
}

#[tauri::command]
fn write_device_data(
    connection_id: String,
    data: String,
    connections: State<'_, Connections>,
) -> Result<(), String> {
    let mut connections_guard = connections.lock().unwrap();
    
    if let Some(connection) = connections_guard.get_mut(&connection_id) {
        connection.write_data(&data)
    } else {
        Err(format!("Connection {} not found", connection_id))
    }
}

#[tauri::command]
fn get_device_connections(
    connections: State<'_, Connections>,
) -> Result<Vec<ConnectionInfo>, String> {
    let connections_guard = connections.lock().unwrap();
    let mut status = Vec::new();
    
    for (connection_id, _) in connections_guard.iter() {
        // This is a simplified version - in practice we'd store more metadata
        status.push(ConnectionInfo {
            connection_id: connection_id.clone(),
            connection_type: ConnectionType::Serial, // Default for now
            address: connection_id.clone(),
            baud_rate: Some(115200),
            is_connected: true,
        });
    }
    
    Ok(status)
}

// Legacy serial commands for backward compatibility
#[tauri::command]
fn connect_serial_port(
    port_name: String,
    baud_rate: u32,
    connections: State<'_, Connections>,
    app_handle: AppHandle,
) -> Result<SerialConnectionInfo, String> {
    let result = connect_device(
        ConnectionType::Serial,
        port_name.clone(),
        Some(baud_rate),
        connections,
        app_handle,
    )?;
    
    Ok(SerialConnectionInfo {
        port_name,
        baud_rate,
        is_connected: result.is_connected,
    })
}

#[tauri::command]
fn disconnect_serial_port(
    port_name: String,
    connections: State<'_, Connections>,
) -> Result<(), String> {
    disconnect_device(port_name, connections)
}

#[tauri::command]
fn write_serial_data(
    port_name: String,
    data: String,
    connections: State<'_, Connections>,
) -> Result<(), String> {
    write_device_data(port_name, data, connections)
}

#[tauri::command]
fn get_connection_status(
    connections: State<'_, Connections>,
) -> Result<Vec<SerialConnectionInfo>, String> {
    let device_connections = get_device_connections(connections)?;
    let mut status = Vec::new();
    
    for conn in device_connections {
        if let ConnectionType::Serial = conn.connection_type {
            status.push(SerialConnectionInfo {
                port_name: conn.address,
                baud_rate: conn.baud_rate.unwrap_or(115200),
                is_connected: conn.is_connected,
            });
        }
    }
    
    Ok(status)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let connections: Connections = Arc::new(Mutex::new(HashMap::new()));
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(connections)
        .invoke_handler(tauri::generate_handler![
            greet,
            list_serial_ports,
            // New generic connection commands
            connect_device,
            disconnect_device,
            write_device_data,
            get_device_connections,
            // Legacy serial commands for backward compatibility
            connect_serial_port,
            disconnect_serial_port,
            write_serial_data,
            get_connection_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
