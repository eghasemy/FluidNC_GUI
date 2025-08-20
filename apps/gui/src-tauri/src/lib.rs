// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde::{Deserialize, Serialize};
use serialport::SerialPort;
use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, State};

// Custom serial port info struct that implements Serialize
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerialPortInfo {
    pub port_name: String,
    pub port_type: String,
}

// Serial connection state
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SerialConnectionInfo {
    pub port_name: String,
    pub baud_rate: u32,
    pub is_connected: bool,
}

// Shared state for serial connections
pub type SerialConnections = Arc<Mutex<HashMap<String, Box<dyn SerialPort + Send>>>>;

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

#[tauri::command]
fn connect_serial_port(
    port_name: String,
    baud_rate: u32,
    connections: State<'_, SerialConnections>,
    app_handle: AppHandle,
) -> Result<SerialConnectionInfo, String> {
    // Check if already connected
    {
        let connections_guard = connections.lock().unwrap();
        if connections_guard.contains_key(&port_name) {
            return Ok(SerialConnectionInfo {
                port_name,
                baud_rate,
                is_connected: true,
            });
        }
    }

    // Open serial port
    let port = serialport::new(&port_name, baud_rate)
        .timeout(Duration::from_millis(100))
        .open()
        .map_err(|e| format!("Failed to open serial port {}: {}", port_name, e))?;

    // Clone port for reading
    let read_port = port
        .try_clone()
        .map_err(|e| format!("Failed to clone serial port: {}", e))?;

    // Store connection
    {
        let mut connections_guard = connections.lock().unwrap();
        connections_guard.insert(port_name.clone(), port);
    }

    // Start reading thread
    let port_name_clone = port_name.clone();
    let app_handle_clone = app_handle.clone();
    thread::spawn(move || {
        let mut reader = BufReader::new(read_port);
        let mut line = String::new();
        
        loop {
            line.clear();
            match reader.read_line(&mut line) {
                Ok(0) => break, // EOF
                Ok(_) => {
                    let message = SerialMessage {
                        port_name: port_name_clone.clone(),
                        data: line.trim_end().to_string(),
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_millis() as u64,
                        is_error: false,
                    };
                    
                    if let Err(e) = app_handle_clone.emit("serial-data", &message) {
                        eprintln!("Failed to emit serial data: {}", e);
                        break;
                    }
                }
                Err(e) => {
                    // Check if it's a timeout (which is normal)
                    if e.kind() == std::io::ErrorKind::TimedOut {
                        continue;
                    }
                    
                    let error_message = SerialMessage {
                        port_name: port_name_clone.clone(),
                        data: format!("Read error: {}", e),
                        timestamp: std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap()
                            .as_millis() as u64,
                        is_error: true,
                    };
                    
                    let _ = app_handle_clone.emit("serial-data", &error_message);
                    break;
                }
            }
        }
    });

    Ok(SerialConnectionInfo {
        port_name,
        baud_rate,
        is_connected: true,
    })
}

#[tauri::command]
fn disconnect_serial_port(
    port_name: String,
    connections: State<'_, SerialConnections>,
) -> Result<(), String> {
    let mut connections_guard = connections.lock().unwrap();
    connections_guard.remove(&port_name);
    Ok(())
}

#[tauri::command]
fn write_serial_data(
    port_name: String,
    data: String,
    connections: State<'_, SerialConnections>,
) -> Result<(), String> {
    let mut connections_guard = connections.lock().unwrap();
    
    if let Some(port) = connections_guard.get_mut(&port_name) {
        let data_with_newline = format!("{}\n", data);
        port.write_all(data_with_newline.as_bytes())
            .map_err(|e| format!("Failed to write to serial port: {}", e))?;
        port.flush()
            .map_err(|e| format!("Failed to flush serial port: {}", e))?;
        Ok(())
    } else {
        Err(format!("Serial port {} not connected", port_name))
    }
}

#[tauri::command]
fn get_connection_status(
    connections: State<'_, SerialConnections>,
) -> Result<Vec<SerialConnectionInfo>, String> {
    let connections_guard = connections.lock().unwrap();
    let mut status = Vec::new();
    
    for (port_name, _) in connections_guard.iter() {
        status.push(SerialConnectionInfo {
            port_name: port_name.clone(),
            baud_rate: 115200, // Default, we could store this info if needed
            is_connected: true,
        });
    }
    
    Ok(status)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let serial_connections: SerialConnections = Arc::new(Mutex::new(HashMap::new()));
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(serial_connections)
        .invoke_handler(tauri::generate_handler![
            greet,
            list_serial_ports,
            connect_serial_port,
            disconnect_serial_port,
            write_serial_data,
            get_connection_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
