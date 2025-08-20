// Enhanced test for macro round-trip preservation
// Testing that macro bodies are preserved correctly through YAML conversion

import { describe, it, expect } from 'vitest';
import { toYAML, fromYAML, MacrosConfig } from '../src/index.js';

describe('Macro Round-trip Preservation', () => {
  it('should preserve simple macro bodies', () => {
    const config = {
      name: 'Simple Macro Test',
      macros: {
        macro0: 'G0 X0 Y0',
        macro1: 'G28',
        startup_line0: '$H',
      },
    };

    const yamlString = toYAML(config);
    const result = fromYAML(yamlString);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.macros?.macro0).toBe(config.macros.macro0);
      expect(result.data.macros?.macro1).toBe(config.macros.macro1);
      expect(result.data.macros?.startup_line0).toBe(config.macros.startup_line0);
    }
  });

  it('should preserve multi-line macro bodies', () => {
    const config = {
      name: 'Multi-line Macro Test',
      macros: {
        macro0: 'G0 Z50\nG0 X0 Y0\nG0 Z0',
        macro1: '$H\nG92 X0 Y0 Z0\nG54',
        macro2: 'M3 S1000\nG4 P2\nM5',
        startup_line0: '$H\nG92 X0 Y0 Z0',
        startup_line1: 'G1 F1000\nG0 Z10',
      },
    };

    const yamlString = toYAML(config);
    const result = fromYAML(yamlString);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.macros?.macro0).toBe(config.macros.macro0);
      expect(result.data.macros?.macro1).toBe(config.macros.macro1);
      expect(result.data.macros?.macro2).toBe(config.macros.macro2);
      expect(result.data.macros?.startup_line0).toBe(config.macros.startup_line0);
      expect(result.data.macros?.startup_line1).toBe(config.macros.startup_line1);
    }
  });

  it('should preserve macros with special characters and comments', () => {
    const config = {
      name: 'Special Characters Macro Test',
      macros: {
        macro0: 'G0 X0 Y0; Go to origin',
        macro1: 'M3 S1000 ; Start spindle at 1000 RPM\nG4 P5 ; Wait 5 seconds\nM5 ; Stop spindle',
        macro2: 'G38.2 Z-10 F100 ; Probe down\nG92 Z0 ; Set Z zero\nG0 Z5 ; Retract',
        macro3: 'G0 X100 F3000\nG1 Y50 F1000\nG2 X50 Y100 I-25 J0 F500',
      },
    };

    const yamlString = toYAML(config);
    const result = fromYAML(yamlString);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.macros?.macro0).toBe(config.macros.macro0);
      expect(result.data.macros?.macro1).toBe(config.macros.macro1);
      expect(result.data.macros?.macro2).toBe(config.macros.macro2);
      expect(result.data.macros?.macro3).toBe(config.macros.macro3);
    }
  });

  it('should preserve complex macro sequences', () => {
    const complexMacro = `; Tool change sequence
G0 Z50                    ; Retract to safe height
G0 X0 Y0                  ; Go to tool change position
M5                        ; Stop spindle
M0                        ; Pause for manual tool change
M3 S1000                  ; Start spindle
G4 P3                     ; Wait for spindle to reach speed
G0 Z10                    ; Lower to working height`;

    const config = {
      name: 'Complex Macro Test',
      macros: {
        macro0: complexMacro,
        startup_line0: '$H ; Home all axes\nG92 X0 Y0 Z0 ; Reset work coordinates',
      },
    };

    const yamlString = toYAML(config);
    const result = fromYAML(yamlString);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.macros?.macro0).toBe(complexMacro);
      expect(result.data.macros?.startup_line0).toBe(config.macros.startup_line0);
    }
  });

  it('should handle empty and undefined macros correctly', () => {
    const config = {
      name: 'Empty Macro Test',
      macros: {
        macro0: '',  // Empty string
        macro1: 'G28',  // Valid macro
        // macro2 is undefined
        startup_line0: '',  // Empty startup line
        startup_line1: 'G54',  // Valid startup line
      },
    };

    const yamlString = toYAML(config);
    const result = fromYAML(yamlString);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.macros?.macro0).toBe('');
      expect(result.data.macros?.macro1).toBe('G28');
      expect(result.data.macros?.macro2).toBeUndefined();
      expect(result.data.macros?.startup_line0).toBe('');
      expect(result.data.macros?.startup_line1).toBe('G54');
    }
  });

  it('should preserve exact whitespace and formatting', () => {
    const config = {
      name: 'Whitespace Preservation Test',
      macros: {
        macro0: '  G0 X0 Y0  \n  G0 Z10  ',  // Leading/trailing spaces
        macro1: 'G28\n\nG92 X0 Y0 Z0',  // Double newline
        macro2: 'G0\tX10\tY20',  // Tab characters
      },
    };

    const yamlString = toYAML(config);
    const result = fromYAML(yamlString);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.macros?.macro0).toBe(config.macros.macro0);
      expect(result.data.macros?.macro1).toBe(config.macros.macro1);
      expect(result.data.macros?.macro2).toBe(config.macros.macro2);
    }
  });

  it('should handle complete configuration with macros and other sections', () => {
    const config = {
      name: 'Complete Configuration Test',
      board: 'ESP32',
      axes: {
        x: { steps_per_mm: 80 },
        y: { steps_per_mm: 80 },
      },
      uart: {
        uart0: {
          txd_pin: 'gpio.1',
          rxd_pin: 'gpio.3',
          baud: 115200,
        },
      },
      macros: {
        macro0: 'G28 ; Home all\nG54 ; Work coordinate system',
        macro1: 'M3 S1000\nG4 P5\nM5',
        startup_line0: '$H',
        startup_line1: 'G92 X0 Y0 Z0',
      },
      sd: {
        miso_pin: 'gpio.19',
        mosi_pin: 'gpio.23',
        sck_pin: 'gpio.18',
        cs_pin: 'gpio.5',
      },
    };

    const yamlString = toYAML(config);
    const result = fromYAML(yamlString);

    expect(result.success).toBe(true);
    if (result.success) {
      // Verify macros are preserved
      expect(result.data.macros?.macro0).toBe(config.macros.macro0);
      expect(result.data.macros?.macro1).toBe(config.macros.macro1);
      expect(result.data.macros?.startup_line0).toBe(config.macros.startup_line0);
      expect(result.data.macros?.startup_line1).toBe(config.macros.startup_line1);
      
      // Verify other sections are preserved
      expect(result.data.name).toBe(config.name);
      expect(result.data.board).toBe(config.board);
      expect(result.data.uart?.uart0?.baud).toBe(config.uart.uart0.baud);
      expect(result.data.sd?.miso_pin).toBe(config.sd.miso_pin);
    }
  });
});