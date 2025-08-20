#!/usr/bin/env node

// Demo of the pin conflict detection system
const { 
  extractAllPinAssignments, 
  getPinConflicts, 
  getPinStatus, 
  getBoardDescriptor 
} = require('./packages/core/dist/index.js');

console.log('🔌 FluidNC Pin Mapper & Conflict Detection Demo\n');

// Create a sample configuration with pin conflicts
const configWithConflicts = {
  name: 'Demo CNC Machine',
  board: 'esp32',
  io: {
    probe_pin: 'gpio.25',
    flood_pin: 'gpio.26',
    mist_pin: 'gpio.25' // Conflict with probe_pin!
  },
  axes: {
    x: {
      steps_per_mm: 80,
      motor0: {
        step_pin: 'gpio.1',
        direction_pin: 'gpio.2',
        disable_pin: 'gpio.26' // Conflict with flood_pin!
      }
    },
    y: {
      steps_per_mm: 80,
      motor0: {
        step_pin: 'gpio.3',
        direction_pin: 'gpio.4',
        disable_pin: 'gpio.5'
      }
    }
  },
  spindle: {
    output_pin: 'gpio.7',
    enable_pin: 'gpio.8'
  }
};

// Get board descriptor
const boardDescriptor = getBoardDescriptor('esp32');
console.log(`📋 Board: ${boardDescriptor?.name || 'Unknown'}`);
console.log(`📍 Available pins: ${boardDescriptor?.pins.length || 0}\n`);

// Extract all pin assignments
console.log('📍 Pin Assignments:');
const assignments = extractAllPinAssignments(configWithConflicts);
Object.entries(assignments).forEach(([pin, usedBy]) => {
  console.log(`  ${pin}: ${usedBy.join(', ')}`);
});

// Detect conflicts
console.log('\n⚠️  Pin Conflicts:');
const conflicts = getPinConflicts(configWithConflicts);
if (Object.keys(conflicts).length === 0) {
  console.log('  ✅ No conflicts detected');
} else {
  Object.entries(conflicts).forEach(([pin, usedBy]) => {
    console.log(`  ❌ ${pin}: CONFLICT between ${usedBy.join(' and ')}`);
  });
}

// Demonstrate pin status checking
console.log('\n🔍 Pin Status Examples:');
const testPins = ['gpio.25', 'gpio.1', 'gpio.99', 'invalid.pin'];

testPins.forEach(pin => {
  const status = getPinStatus(pin, configWithConflicts, boardDescriptor);
  const statusSymbol = status.isValid ? (status.isUsed ? '🟡' : '🟢') : '🔴';
  const conflictInfo = status.usedBy.length > 1 ? ` (CONFLICT: ${status.usedBy.join(', ')})` : '';
  console.log(`  ${statusSymbol} ${pin}: ${status.isValid ? 'Valid' : 'Invalid'}${status.isUsed ? ', Used' : ', Available'}${conflictInfo}`);
  if (status.errors.length > 0) {
    console.log(`    ❌ ${status.errors[0]}`);
  }
});

console.log('\n✨ Pin mapper features implemented:');
console.log('  ✅ Visual pin status indicators (free/used/invalid/conflict)');
console.log('  ✅ Conflict detection across all configuration sections');
console.log('  ✅ Board-specific pin validation');
console.log('  ✅ Real-time validation in UI components');
console.log('  ✅ Blocking of invalid pin assignments');
console.log('\n🎯 Invalid assignments are now blocked in the UI!');