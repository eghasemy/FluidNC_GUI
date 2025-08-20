// Board descriptor exports
import type { BoardDescriptor } from '../index';
import { loadBoardDescriptorFromObject } from '../index';

// Board descriptor data (embedded as TypeScript objects for better compatibility)
const esp32Data = {
  "id": "esp32",
  "name": "ESP32",
  "description": "ESP32 WROOM-32 development board with WiFi and Bluetooth",
  "version": "1.0",
  "manufacturer": "Espressif",
  "capabilities": {
    "uart_channels": 3,
    "spi_channels": 4,
    "i2c_channels": 2,
    "adc_channels": 18,
    "dac_channels": 2,
    "pwm_channels": 16,
    "touch_pins": 10,
    "flash_size": "4MB",
    "ram_size": "520KB",
    "cpu_frequency": "240MHz",
    "wifi": true,
    "bluetooth": true,
    "ethernet": false,
    "notes": "Classic ESP32 with dual-core processor and extensive peripheral support"
  },
  "pins": [
    {
      "name": "GPIO2",
      "gpio": 2,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Must be low during boot if 12V flash is used"
      }
    },
    {
      "name": "GPIO4",
      "gpio": 4,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "ADC2_CH0, can be used as analog input"
      }
    },
    {
      "name": "GPIO5",
      "gpio": 5,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Safe to use, no special boot requirements"
      }
    }
  ],
  "notes": "ESP32 is the most common and well-supported board. GPIO6-11 are used for flash memory and should not be used. Some pins have special boot requirements."
};

const esp32s2Data = {
  "id": "esp32-s2",
  "name": "ESP32-S2",
  "description": "ESP32-S2 development board with WiFi and enhanced security features",
  "version": "1.0",
  "manufacturer": "Espressif",
  "capabilities": {
    "uart_channels": 2,
    "spi_channels": 4,
    "i2c_channels": 2,
    "adc_channels": 20,
    "dac_channels": 2,
    "pwm_channels": 8,
    "touch_pins": 14,
    "flash_size": "4MB",
    "ram_size": "320KB",
    "cpu_frequency": "240MHz",
    "wifi": true,
    "bluetooth": false,
    "ethernet": false,
    "notes": "Single-core ESP32-S2 with enhanced security and USB OTG support"
  },
  "pins": [
    {
      "name": "GPIO1",
      "gpio": 1,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "ADC1_CH0, safe to use"
      }
    },
    {
      "name": "GPIO2",
      "gpio": 2,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "ADC1_CH1, safe to use"
      }
    }
  ],
  "notes": "ESP32-S2 is a single-core variant with enhanced security features and USB OTG support. No Bluetooth capability but includes native USB interface."
};

const esp32s3Data = {
  "id": "esp32-s3",
  "name": "ESP32-S3",
  "description": "ESP32-S3 development board with WiFi, Bluetooth LE, and AI acceleration",
  "version": "1.0",
  "manufacturer": "Espressif",
  "capabilities": {
    "uart_channels": 3,
    "spi_channels": 4,
    "i2c_channels": 2,
    "adc_channels": 20,
    "dac_channels": 0,
    "pwm_channels": 8,
    "touch_pins": 14,
    "flash_size": "8MB",
    "ram_size": "512KB",
    "cpu_frequency": "240MHz",
    "wifi": true,
    "bluetooth": true,
    "ethernet": false,
    "notes": "Dual-core ESP32-S3 with AI acceleration, enhanced security, and USB OTG support"
  },
  "pins": [
    {
      "name": "GPIO1",
      "gpio": 1,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "ADC1_CH0, safe to use"
      }
    },
    {
      "name": "GPIO2",
      "gpio": 2,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "ADC1_CH1, safe to use"
      }
    }
  ],
  "notes": "ESP32-S3 is a dual-core variant with AI acceleration, enhanced security features, and USB OTG support. Includes both WiFi and Bluetooth LE."
};

const esp32c3Data = {
  "id": "esp32-c3",
  "name": "ESP32-C3",
  "description": "ESP32-C3 RISC-V development board with WiFi and Bluetooth LE",
  "version": "1.0",
  "manufacturer": "Espressif",
  "capabilities": {
    "uart_channels": 2,
    "spi_channels": 3,
    "i2c_channels": 1,
    "adc_channels": 6,
    "dac_channels": 0,
    "pwm_channels": 6,
    "touch_pins": 0,
    "flash_size": "4MB",
    "ram_size": "400KB",
    "cpu_frequency": "160MHz",
    "wifi": true,
    "bluetooth": true,
    "ethernet": false,
    "notes": "Single-core RISC-V ESP32-C3 with WiFi and Bluetooth LE, cost-effective solution"
  },
  "pins": [
    {
      "name": "GPIO1",
      "gpio": 1,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "ADC1_CH1, safe to use"
      }
    },
    {
      "name": "GPIO2",
      "gpio": 2,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "ADC1_CH2, boot strapping pin"
      }
    }
  ],
  "notes": "ESP32-C3 is a cost-effective RISC-V single-core solution with WiFi and Bluetooth LE. Limited number of GPIO pins compared to other ESP32 variants."
};

// Create validated board descriptors
function createBoardDescriptor(data: unknown): BoardDescriptor {
  const result = loadBoardDescriptorFromObject(data);
  if (!result.success) {
    throw new Error(`Invalid board descriptor: ${result.errors.message}`);
  }
  return result.data as BoardDescriptor;
}

// Export individual board descriptors
export const ESP32_BOARD: BoardDescriptor = createBoardDescriptor(esp32Data);
export const ESP32_S2_BOARD: BoardDescriptor = createBoardDescriptor(esp32s2Data);
export const ESP32_S3_BOARD: BoardDescriptor = createBoardDescriptor(esp32s3Data);
export const ESP32_C3_BOARD: BoardDescriptor = createBoardDescriptor(esp32c3Data);

// Export collection of all boards
export const BOARD_DESCRIPTORS: Record<string, BoardDescriptor> = {
  'esp32': ESP32_BOARD,
  'esp32-s2': ESP32_S2_BOARD,
  'esp32-s3': ESP32_S3_BOARD,
  'esp32-c3': ESP32_C3_BOARD,
};

// Utility functions
export function getBoardDescriptor(id: string): BoardDescriptor | undefined {
  return BOARD_DESCRIPTORS[id];
}

export function getAllBoardDescriptors(): BoardDescriptor[] {
  return Object.values(BOARD_DESCRIPTORS);
}

export function getBoardIds(): string[] {
  return Object.keys(BOARD_DESCRIPTORS);
}

export function findBoardByName(name: string): BoardDescriptor | undefined {
  return getAllBoardDescriptors().find(board => 
    board.name.toLowerCase() === name.toLowerCase()
  );
}