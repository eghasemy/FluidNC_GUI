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

const bdring6xData = {
  "id": "bdring-6x",
  "name": "BDRing 6-Pack TMC2209",
  "description": "6-axis CNC controller board with TMC2209 stepper drivers",
  "version": "1.0",
  "manufacturer": "Bart Dring",
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
    "notes": "6-axis CNC controller with ESP32 and TMC2209 stepper drivers, designed by Bart Dring"
  },
  "pins": [
    {
      "name": "X_STEP",
      "gpio": 12,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "X-axis step pin"
      }
    },
    {
      "name": "X_DIR",
      "gpio": 14,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "X-axis direction pin"
      }
    },
    {
      "name": "Y_STEP",
      "gpio": 27,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Y-axis step pin"
      }
    },
    {
      "name": "Y_DIR",
      "gpio": 26,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Y-axis direction pin"
      }
    },
    {
      "name": "Z_STEP",
      "gpio": 33,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Z-axis step pin"
      }
    },
    {
      "name": "Z_DIR",
      "gpio": 32,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Z-axis direction pin"
      }
    },
    {
      "name": "A_STEP",
      "gpio": 15,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "A-axis step pin"
      }
    },
    {
      "name": "A_DIR",
      "gpio": 2,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "A-axis direction pin"
      }
    },
    {
      "name": "B_STEP",
      "gpio": 0,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "B-axis step pin"
      }
    },
    {
      "name": "B_DIR",
      "gpio": 4,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "B-axis direction pin"
      }
    },
    {
      "name": "C_STEP",
      "gpio": 16,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "C-axis step pin"
      }
    },
    {
      "name": "C_DIR",
      "gpio": 17,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "C-axis direction pin"
      }
    },
    {
      "name": "SPINDLE_PWM",
      "gpio": 25,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "Spindle PWM control, DAC output"
      }
    },
    {
      "name": "SPINDLE_DIR",
      "gpio": 26,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Spindle direction control"
      }
    },
    {
      "name": "X_LIMIT",
      "gpio": 21,
      "capabilities": {
        "digital": true,
        "input": true,
        "pullup": true,
        "notes": "X-axis limit switch input"
      }
    },
    {
      "name": "Y_LIMIT",
      "gpio": 22,
      "capabilities": {
        "digital": true,
        "input": true,
        "pullup": true,
        "notes": "Y-axis limit switch input"
      }
    },
    {
      "name": "Z_LIMIT",
      "gpio": 23,
      "capabilities": {
        "digital": true,
        "input": true,
        "pullup": true,
        "notes": "Z-axis limit switch input"
      }
    }
  ],
  "notes": "BDRing 6-Pack is a 6-axis CNC controller designed by Bart Dring. Features TMC2209 stepper drivers with UART control, ESP32 WiFi connectivity, and support for up to 6 stepper motors. Perfect for multi-axis CNC machines and robots."
};

const v1JackpotData = {
  "id": "v1-jackpot",
  "name": "V1 Engineering Jackpot",
  "description": "CNC controller board designed for V1 Engineering machines",
  "version": "1.0", 
  "manufacturer": "V1 Engineering",
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
    "notes": "ESP32-based CNC controller designed specifically for V1 Engineering machines like MPCNC and LowRider"
  },
  "pins": [
    {
      "name": "X_STEP",
      "gpio": 12,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "X-axis step pin"
      }
    },
    {
      "name": "X_DIR",
      "gpio": 14,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "X-axis direction pin"
      }
    },
    {
      "name": "Y_STEP",
      "gpio": 27,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Y-axis step pin"
      }
    },
    {
      "name": "Y_DIR",
      "gpio": 26,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Y-axis direction pin"
      }
    },
    {
      "name": "Z_STEP",
      "gpio": 33,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Z-axis step pin"
      }
    },
    {
      "name": "Z_DIR",
      "gpio": 32,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Z-axis direction pin"
      }
    },
    {
      "name": "E0_STEP",
      "gpio": 15,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "E0-axis step pin (4th axis)"
      }
    },
    {
      "name": "E0_DIR",
      "gpio": 2,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "E0-axis direction pin (4th axis)"
      }
    },
    {
      "name": "E1_STEP",
      "gpio": 0,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "E1-axis step pin (5th axis)"
      }
    },
    {
      "name": "E1_DIR",
      "gpio": 4,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "E1-axis direction pin (5th axis)"
      }
    },
    {
      "name": "SPINDLE_PWM",
      "gpio": 25,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "Spindle/Laser PWM control, DAC output"
      }
    },
    {
      "name": "SPINDLE_DIR",
      "gpio": 26,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Spindle direction control"
      }
    },
    {
      "name": "X_LIMIT",
      "gpio": 21,
      "capabilities": {
        "digital": true,
        "input": true,
        "pullup": true,
        "notes": "X-axis limit/endstop switch"
      }
    },
    {
      "name": "Y_LIMIT",
      "gpio": 22,
      "capabilities": {
        "digital": true,
        "input": true,
        "pullup": true,
        "notes": "Y-axis limit/endstop switch"
      }
    },
    {
      "name": "Z_LIMIT",
      "gpio": 23,
      "capabilities": {
        "digital": true,
        "input": true,
        "pullup": true,
        "notes": "Z-axis limit/endstop switch"
      }
    },
    {
      "name": "PROBE",
      "gpio": 35,
      "capabilities": {
        "digital": true,
        "input": true,
        "analog": true,
        "notes": "Touch probe input, input only pin"
      }
    }
  ],
  "notes": "V1 Engineering Jackpot controller is designed specifically for V1 machines like MPCNC and LowRider CNC. Features integrated stepper drivers, WiFi connectivity, and optimized pin layout for V1 machine wiring."
};

const pibot49bPlusData = {
  "id": "pibot-49b-plus",
  "name": "PiBot 4.9b Plus",
  "description": "Advanced CNC controller board with enhanced features",
  "version": "4.9b",
  "manufacturer": "PiBot",
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
    "notes": "Advanced ESP32-based CNC controller with enhanced I/O and precision control features"
  },
  "pins": [
    {
      "name": "X_STEP",
      "gpio": 2,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "X-axis step pin"
      }
    },
    {
      "name": "X_DIR",
      "gpio": 5,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "X-axis direction pin"
      }
    },
    {
      "name": "Y_STEP",
      "gpio": 17,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Y-axis step pin"
      }
    },
    {
      "name": "Y_DIR",
      "gpio": 16,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Y-axis direction pin"
      }
    },
    {
      "name": "Z_STEP",
      "gpio": 14,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Z-axis step pin"
      }
    },
    {
      "name": "Z_DIR",
      "gpio": 15,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Z-axis direction pin"
      }
    },
    {
      "name": "A_STEP",
      "gpio": 12,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "A-axis step pin (4th axis)"
      }
    },
    {
      "name": "A_DIR",
      "gpio": 13,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "A-axis direction pin (4th axis)"
      }
    },
    {
      "name": "SPINDLE_PWM",
      "gpio": 25,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "analog": true,
        "notes": "Spindle PWM control, DAC output"
      }
    },
    {
      "name": "SPINDLE_ENABLE",
      "gpio": 4,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Spindle enable/disable control"
      }
    },
    {
      "name": "SPINDLE_DIR",
      "gpio": 26,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Spindle direction control"
      }
    },
    {
      "name": "X_LIMIT",
      "gpio": 36,
      "capabilities": {
        "digital": true,
        "input": true,
        "analog": true,
        "notes": "X-axis limit switch, input only"
      }
    },
    {
      "name": "Y_LIMIT",
      "gpio": 39,
      "capabilities": {
        "digital": true,
        "input": true,
        "analog": true,
        "notes": "Y-axis limit switch, input only"
      }
    },
    {
      "name": "Z_LIMIT",
      "gpio": 34,
      "capabilities": {
        "digital": true,
        "input": true,
        "analog": true,
        "notes": "Z-axis limit switch, input only"
      }
    },
    {
      "name": "PROBE",
      "gpio": 35,
      "capabilities": {
        "digital": true,
        "input": true,
        "analog": true,
        "notes": "Touch probe input, input only"
      }
    },
    {
      "name": "COOLANT",
      "gpio": 27,
      "capabilities": {
        "digital": true,
        "input": true,
        "output": true,
        "pullup": true,
        "pulldown": true,
        "pwm": true,
        "notes": "Coolant control output"
      }
    }
  ],
  "notes": "PiBot 4.9b Plus is an advanced CNC controller featuring precision motor control, extensive I/O options, and enhanced connectivity. Designed for professional CNC applications requiring high precision and reliability."
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
export const BDRING_6X_BOARD: BoardDescriptor = createBoardDescriptor(bdring6xData);
export const V1_JACKPOT_BOARD: BoardDescriptor = createBoardDescriptor(v1JackpotData);
export const PIBOT_49B_PLUS_BOARD: BoardDescriptor = createBoardDescriptor(pibot49bPlusData);

// Export collection of all boards
export const BOARD_DESCRIPTORS: Record<string, BoardDescriptor> = {
  'esp32': ESP32_BOARD,
  'esp32-s2': ESP32_S2_BOARD,
  'esp32-s3': ESP32_S3_BOARD,
  'esp32-c3': ESP32_C3_BOARD,
  'bdring-6x': BDRING_6X_BOARD,
  'v1-jackpot': V1_JACKPOT_BOARD,
  'pibot-49b-plus': PIBOT_49B_PLUS_BOARD,
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