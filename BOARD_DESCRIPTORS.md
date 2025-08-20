# Board Descriptor Implementation Demo

## Overview
This demonstrates the board descriptor specification and loader implementation for FluidNC boards.

## Features Implemented

### 1. Board Descriptor Interface
```typescript
interface BoardDescriptor {
  id: string;
  name: string;
  description?: string;
  pins: BoardPin[];
  capabilities: BoardCapabilities;
  notes?: string;
  version?: string;
  manufacturer?: string;
}
```

### 2. Pin Capabilities
```typescript
interface PinCapability {
  digital?: boolean;
  analog?: boolean;
  pwm?: boolean;
  input?: boolean;
  output?: boolean;
  pullup?: boolean;
  pulldown?: boolean;
  notes?: string;
}
```

### 3. Board Capabilities
```typescript
interface BoardCapabilities {
  uart_channels?: number;
  spi_channels?: number;
  i2c_channels?: number;
  adc_channels?: number;
  dac_channels?: number;
  pwm_channels?: number;
  touch_pins?: number;
  flash_size?: string;
  ram_size?: string;
  cpu_frequency?: string;
  wifi?: boolean;
  bluetooth?: boolean;
  ethernet?: boolean;
  notes?: string;
}
```

## Usage Examples

### Loading a Board Descriptor from JSON
```typescript
import { loadBoardDescriptor } from '@fluidnc-gui/core';

const jsonString = `{
  "id": "esp32",
  "name": "ESP32",
  "pins": [...],
  "capabilities": {...}
}`;

const result = loadBoardDescriptor(jsonString);
if (result.success) {
  console.log('Board loaded:', result.data.name);
  console.log('WiFi support:', result.data.capabilities.wifi);
} else {
  console.error('Validation errors:', result.errors);
}
```

### Using Pre-defined Board Descriptors
```typescript
import { getBoardDescriptor, ESP32_BOARD, getAllBoardDescriptors } from '@fluidnc-gui/core';

// Get a specific board
const esp32 = getBoardDescriptor('esp32');
console.log(esp32?.capabilities.uart_channels); // 3

// Use the constant
console.log(ESP32_BOARD.name); // "ESP32"

// Get all available boards
const allBoards = getAllBoardDescriptors();
allBoards.forEach(board => {
  console.log(`${board.name}: WiFi=${board.capabilities.wifi}`);
});
```

### Finding Boards
```typescript
import { findBoardByName, getBoardIds } from '@fluidnc-gui/core';

// Find by name (case insensitive)
const esp32 = findBoardByName('ESP32');

// Get all available board IDs
const boardIds = getBoardIds(); // ['esp32', 'esp32-s2', 'esp32-s3', 'esp32-c3']
```

## Available Board Descriptors

- **ESP32**: Classic dual-core ESP32 with WiFi and Bluetooth
- **ESP32-S2**: Single-core with enhanced security and USB OTG
- **ESP32-S3**: Dual-core with AI acceleration and USB OTG
- **ESP32-C3**: Cost-effective RISC-V single-core with WiFi and Bluetooth LE
- **BDRing 6-Pack TMC2209**: 6-axis CNC controller with TMC2209 stepper drivers by Bart Dring
- **V1 Engineering Jackpot**: CNC controller designed for V1 Engineering machines
- **PiBot 4.9b Plus**: Advanced CNC controller board with enhanced features

## Validation

All board descriptors are validated using Zod schemas to ensure:
- Required fields are present
- Data types are correct
- Numeric constraints are met (e.g., non-negative GPIO numbers)
- Optional fields follow the correct format

## Test Coverage

122 tests covering:
- Schema validation for all interfaces
- Loader functions with error handling
- Board utility functions
- Real board descriptor validation
- Edge cases and error conditions