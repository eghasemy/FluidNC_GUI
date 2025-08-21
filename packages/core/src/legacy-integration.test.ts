/**
 * Integration test for legacy import using the testing framework
 */
import { describe, it, expect } from 'vitest';
import { fromYAMLWithLegacySupport } from './index';

describe('Legacy Import Integration Test', () => {
  it('should successfully transform the example legacy configuration', () => {
    const legacyYaml = `
name: Legacy CNC Router

x:
  steps_per_mm: 80
  max_rate_mm_per_min: 5000
  step_pin: gpio.2
  direction_pin: gpio.5
  disable_pin: gpio.13
  tmc2209:
    current_ma: 800
    microsteps: 16
  homing_cycle: 1
  positive_direction: false

y:
  steps_per_mm: 80
  max_rate_mm_per_min: 5000
  step_pin: gpio.12
  direction_pin: gpio.14
  disable_pin: gpio.13
  tmc2209:
    current_ma: 800
    microsteps: 16
  homing_cycle: 1
  positive_direction: false

pwm_pin: gpio.25
spindle_enable_pin: gpio.4
driver_notes: "Using A4988 stepper drivers"
`;

    const result = fromYAMLWithLegacySupport(legacyYaml);
    
    // Verify successful import
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    
    // Verify transformations were applied
    expect(result.mappings.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
    
    // Verify specific transformations
    expect(result.data.name).toBe('Legacy CNC Router');
    
    // Check axes structure was created
    expect(result.data.axes).toBeDefined();
    expect(result.data.axes.x).toBeDefined();
    expect(result.data.axes.y).toBeDefined();
    
    // Check motor0 configuration was created from legacy fields
    expect(result.data.axes.x.motor0).toBeDefined();
    expect(result.data.axes.x.motor0.step_pin).toBe('gpio.2');
    expect(result.data.axes.x.motor0.direction_pin).toBe('gpio.5');
    expect(result.data.axes.x.motor0.disable_pin).toBe('gpio.13');
    
    // Check TMC configuration was moved properly
    expect(result.data.axes.x.motor0.tmc_2209).toBeDefined();
    expect(result.data.axes.x.motor0.tmc_2209.current_ma).toBe(800);
    expect(result.data.axes.x.motor0.tmc_2209.microsteps).toBe(16);
    
    // Check spindle configuration was created
    expect(result.data.spindle).toBeDefined();
    expect(result.data.spindle.output_pin).toBe('gpio.25');
    expect(result.data.spindle.enable_pin).toBe('gpio.4');
    
    // Check legacy fields were removed
    expect(result.data.x).toBeUndefined();
    expect(result.data.y).toBeUndefined();
    expect(result.data.pwm_pin).toBeUndefined();
    expect(result.data.spindle_enable_pin).toBeUndefined();
    
    // Verify suggestions were generated
    const infoSuggestions = result.suggestions.filter(s => s.type === 'info');
    const warningSuggestions = result.suggestions.filter(s => s.type === 'warning');
    
    expect(infoSuggestions.length).toBeGreaterThan(0);
    expect(warningSuggestions.length).toBeGreaterThan(0);
    
    // Check for specific suggestions
    const flatAxisSuggestion = result.suggestions.find(s => 
      s.message.includes('flat axis configuration')
    );
    expect(flatAxisSuggestion).toBeDefined();
    
    const boardSuggestion = result.suggestions.find(s => 
      s.message.includes('board type')
    );
    expect(boardSuggestion).toBeDefined();
    
    const driverSuggestion = result.suggestions.find(s => 
      s.message.includes('A4988')
    );
    expect(driverSuggestion).toBeDefined();
    
    // Verify mappings were recorded
    const stepPinMapping = result.mappings.find(m => 
      m.oldPath === 'step_pin' && m.newPath === 'motor0.step_pin'
    );
    expect(stepPinMapping).toBeDefined();
    
    const tmcMapping = result.mappings.find(m => 
      m.oldPath === 'tmc2209' && m.newPath === 'motor0.tmc_2209'
    );
    expect(tmcMapping).toBeDefined();
    
    const spindleMapping = result.mappings.find(m => 
      m.oldPath === 'pwm_pin' && m.newPath === 'spindle.output_pin'
    );
    expect(spindleMapping).toBeDefined();
    
    console.log('\n🎉 Legacy import integration test passed!');
    console.log(`📝 Transformations applied: ${result.mappings.length}`);
    console.log(`💡 Suggestions generated: ${result.suggestions.length}`);
    
    result.mappings.forEach((mapping, index) => {
      console.log(`  ${index + 1}. ${mapping.oldPath} → ${mapping.newPath}`);
    });
    
    console.log('\nSuggestions:');
    result.suggestions.forEach((suggestion, index) => {
      const icon = suggestion.type === 'error' ? '❌' : suggestion.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${index + 1}. ${icon} ${suggestion.message}`);
    });
  });
});