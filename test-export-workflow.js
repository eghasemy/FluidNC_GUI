// Test preset to export workflow
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Import presets
const presetsPath = path.join(__dirname, 'packages/presets/dist/index.js');
const presets = require(presetsPath);

console.log('Testing Preset → Export workflow\n');

// Test all preset categories
const categories = ['router', 'laser', 'plasma', 'rotary', 'mill'];

categories.forEach(category => {
  const categoryPresets = presets.getPresetsByCategory(category);
  
  if (categoryPresets.length > 0) {
    const preset = categoryPresets[0];
    console.log(`Testing ${category.toUpperCase()} preset: ${preset.name}`);
    
    // Test JSON export
    try {
      const jsonConfig = JSON.stringify(preset.config, null, 2);
      console.log(`✓ JSON export successful (${jsonConfig.length} characters)`);
    } catch (error) {
      console.log(`✗ JSON export failed: ${error.message}`);
    }
    
    // Test YAML export  
    try {
      const yamlConfig = yaml.dump(preset.config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true
      });
      console.log(`✓ YAML export successful (${yamlConfig.length} characters)`);
    } catch (error) {
      console.log(`✗ YAML export failed: ${error.message}`);
    }
    
    console.log('');
  }
});

console.log('All preset → export tests completed!');