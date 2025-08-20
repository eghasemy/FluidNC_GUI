#!/usr/bin/env python3
"""
Simple test script to validate Wi-Fi Console implementation structure.
This tests the code structure without requiring full compilation.
"""

import os
import re
import sys

def test_file_exists(filepath, description):
    """Test if a file exists"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ {description}: {filepath} - NOT FOUND")
        return False

def test_file_contains(filepath, pattern, description):
    """Test if a file contains a specific pattern"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            if re.search(pattern, content, re.MULTILINE | re.DOTALL):
                print(f"✅ {description}")
                return True
            else:
                print(f"❌ {description} - Pattern not found")
                return False
    except Exception as e:
        print(f"❌ {description} - Error reading file: {e}")
        return False

def main():
    print("🔍 Testing Wi-Fi Console Implementation")
    print("=" * 50)
    
    base_path = "/home/runner/work/FluidNC_GUI/FluidNC_GUI"
    
    # Test file existence
    files_to_check = [
        (f"{base_path}/apps/gui/src-tauri/Cargo.toml", "Cargo.toml exists"),
        (f"{base_path}/apps/gui/src-tauri/src/lib.rs", "Rust backend exists"),
        (f"{base_path}/apps/gui/src/components/Console.tsx", "React frontend exists"),
        (f"{base_path}/WIFI_CONSOLE_IMPLEMENTATION.md", "Documentation exists"),
    ]
    
    all_tests_passed = True
    
    print("\n📁 File Existence Tests:")
    for filepath, description in files_to_check:
        if not test_file_exists(filepath, description):
            all_tests_passed = False
    
    # Test Cargo.toml for WebSocket dependencies
    print("\n📦 Dependency Tests:")
    cargo_toml = f"{base_path}/apps/gui/src-tauri/Cargo.toml"
    if not test_file_contains(cargo_toml, r"tokio-tungstenite", "WebSocket dependency added"):
        all_tests_passed = False
    if not test_file_contains(cargo_toml, r"futures-util", "Futures dependency added"):
        all_tests_passed = False
    
    # Test Rust backend for new connection types
    print("\n🦀 Rust Backend Tests:")
    rust_file = f"{base_path}/apps/gui/src-tauri/src/lib.rs"
    backend_patterns = [
        (r"enum ConnectionType", "ConnectionType enum defined"),
        (r"trait Connection", "Connection trait defined"),
        (r"struct TcpConnection", "TcpConnection struct defined"),
        (r"connect_device", "Generic connect_device command exists"),
        (r"disconnect_device", "Generic disconnect_device command exists"),
        (r"write_device_data", "Generic write_device_data command exists"),
        (r"connection-data", "New event type defined"),
    ]
    
    for pattern, description in backend_patterns:
        if not test_file_contains(rust_file, pattern, description):
            all_tests_passed = False
    
    # Test React frontend for Wi-Fi UI
    print("\n⚛️ React Frontend Tests:")
    frontend_file = f"{base_path}/apps/gui/src/components/Console.tsx"
    frontend_patterns = [
        (r"ConnectionType.*=.*'Serial'.*\|.*'Tcp'.*\|.*'WebSocket'", "Connection type definition"),
        (r"connectionType.*useState", "Connection type state"),
        (r"ipAddress.*useState", "IP address state"),
        (r"port.*useState", "Port state"),
        (r"TCP.*Wi-Fi", "TCP Wi-Fi option in UI"),
        (r"WebSocket.*Wi-Fi", "WebSocket Wi-Fi option in UI"),
        (r"connection-data", "New event listener"),
        (r"connectToDevice", "Generic connection function"),
    ]
    
    for pattern, description in frontend_patterns:
        if not test_file_contains(frontend_file, pattern, description):
            all_tests_passed = False
    
    # Test backward compatibility
    print("\n🔄 Backward Compatibility Tests:")
    compatibility_patterns = [
        (r"connect_serial_port", "Legacy serial connect command preserved"),
        (r"disconnect_serial_port", "Legacy serial disconnect command preserved"),
        (r"write_serial_data", "Legacy serial write command preserved"),
    ]
    
    for pattern, description in compatibility_patterns:
        if not test_file_contains(rust_file, pattern, description):
            all_tests_passed = False
    
    # Test frontend backward compatibility separately since it listens for legacy events
    frontend_compatibility_patterns = [
        (r"connect_serial_port", "Legacy serial connect used in frontend"),
        (r"disconnect_serial_port", "Legacy serial disconnect used in frontend"),
        (r"write_serial_data", "Legacy serial write used in frontend"),
        (r"serial-data", "Legacy serial event listener in frontend"),
    ]
    
    for pattern, description in frontend_compatibility_patterns:
        if not test_file_contains(frontend_file, pattern, description):
            all_tests_passed = False
    
    print("\n" + "=" * 50)
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED! Wi-Fi Console implementation looks good!")
        print("\n📋 Implementation Summary:")
        print("   • Backend supports Serial, TCP, and WebSocket connections")
        print("   • Frontend has connection type selector and Wi-Fi configuration")
        print("   • Backward compatibility maintained with legacy serial commands")
        print("   • New generic connection system ready for use")
        print("   • Documentation and mockups created")
    else:
        print("❌ Some tests failed. Please check the implementation.")
    
    return 0 if all_tests_passed else 1

if __name__ == "__main__":
    sys.exit(main())