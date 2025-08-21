---
sidebar_position: 4
---

# Import & Export

FluidNC GUI provides comprehensive import and export functionality, supporting both modern and legacy FluidNC configurations with automatic conversion capabilities.

## Supported Formats

### YAML (Recommended)
- **Primary format** for FluidNC configurations
- **Human-readable** with comments and structure
- **Full feature support** including advanced settings
- **Legacy compatibility** with automatic conversion

### JSON
- **Programmatic use** and API integration  
- **Compact format** without comments
- **Full configuration** preservation
- **Cross-platform** compatibility

## Export Features

### YAML Export
```yaml
# Generated configuration with comments
name: "My CNC Router"
board: "ESP32"
version: "3.7"

# Motor configuration with inline documentation
axes:
  x:
    steps_per_mm: 80.0    # GT2 belt, 20-tooth pulley
    max_rate_mm_per_min: 5000.0
    # ... more settings
```

### JSON Export
```json
{
  "name": "My CNC Router",
  "board": "ESP32", 
  "version": "3.7",
  "axes": {
    "x": {
      "steps_per_mm": 80.0,
      "max_rate_mm_per_min": 5000.0
    }
  }
}
```

### Export Options
- **Include comments** in YAML (optional)
- **Minimize output** for compact files
- **Validate before export** to catch errors
- **Custom filename** generation

![Export Interface](/img/screenshots/expert-editor-interface.png)

The export functionality is accessible from the Expert Editor toolbar with validation status clearly indicated.

## Import Features

### Modern Configuration Import
- **Direct YAML parsing** for current format
- **Validation** against FluidNC schemas
- **Error reporting** with specific line numbers
- **Partial import** recovery for malformed files

### Legacy Configuration Support
Automatic conversion of legacy patterns:

```yaml
# Legacy format (automatically converted)
x_step_pin: gpio.2
x_dir_pin: gpio.5
x_en_pin: gpio.8

# Converts to modern format
axes:
  x:
    motor0:
      step_pin: "gpio.2"
      direction_pin: "gpio.5" 
      disable_pin: "gpio.8"
```

### Conversion Features
- **Automatic field mapping** from old to new names
- **Structure transformation** for hierarchical organization
- **Default value insertion** for missing required fields
- **Conversion report** showing all changes made

## Import Process

### Step 1: File Selection
1. **Click Import** button in GUI
2. **Select YAML file** from your computer
3. **File validation** begins automatically

### Step 2: Parsing and Validation
- **Syntax checking** for valid YAML/JSON
- **Schema validation** against FluidNC requirements
- **Legacy detection** and conversion triggering
- **Error identification** with helpful messages

### Step 3: Review and Accept
- **Review conversion report** (if legacy file)
- **Check validation warnings**
- **Accept or modify** imported configuration
- **Proceed to editing** or export

## Legacy Configuration Conversion

### Common Legacy Patterns

#### Flat Axis Structure
```yaml
# Legacy flat structure
x_steps_per_mm: 80
y_steps_per_mm: 80
z_steps_per_mm: 400

# Converts to hierarchical
axes:
  x:
    steps_per_mm: 80
  y: 
    steps_per_mm: 80
  z:
    steps_per_mm: 400
```

#### Old Driver Configuration
```yaml
# Legacy driver format
x_step_pin: gpio.2
x_dir_pin: gpio.5
x_driver: TMC2208

# Converts to modern motor format
axes:
  x:
    motor0:
      step_pin: "gpio.2"
      direction_pin: "gpio.5"
      tmc_2208:
        # Driver-specific settings
```

#### Spindle Format Changes
```yaml
# Legacy spindle
spindle_pwm_pin: gpio.12
spindle_enable_pin: gpio.13
max_rpm: 24000

# Modern spindle format
spindle:
  pwm:
    output_pin: "gpio.12"
    enable_pin: "gpio.13" 
    speed_map: "0=0% 24000=100%"
```

### Conversion Report
After legacy import, you'll see:
- **Fields mapped** from old to new names
- **Structure changes** made
- **Default values** added
- **Manual review** recommendations

## Error Handling

### Common Import Errors

#### Syntax Errors
```yaml
# Invalid YAML syntax
name: My Machine
  board: ESP32    # ❌ Incorrect indentation
```
**Solution**: Fix YAML formatting and try again

#### Schema Validation Errors  
```yaml
# Invalid field values
steps_per_mm: -80    # ❌ Negative value not allowed
```
**Solution**: Correct field values to valid ranges

#### Pin Conflicts
```yaml
# Conflicting pin assignments
x_step_pin: gpio.2
y_step_pin: gpio.2   # ❌ Pin already used
```
**Solution**: Resolve pin conflicts before import

### Error Recovery
- **Partial import** of valid sections
- **Error highlighting** for specific issues
- **Suggested fixes** based on common problems
- **Manual editing** tools for correction

## Best Practices

### Before Import
1. **Backup original** configuration files
2. **Validate YAML syntax** using online tools
3. **Review pin assignments** for obvious conflicts
4. **Check file encoding** (UTF-8 recommended)

### During Import
1. **Read conversion reports** carefully
2. **Address validation warnings** before proceeding
3. **Test critical functions** after import
4. **Document any manual changes** needed

### After Import
1. **Export immediately** as backup
2. **Test configuration** on hardware if possible
3. **Keep notes** on any required adjustments
4. **Update documentation** with new format

## Batch Operations

### Multiple File Import
- **Process multiple** legacy files
- **Batch conversion** with reports
- **Combined validation** across files
- **Merge configurations** capability

### Export Variations
- **Multiple format** simultaneous export
- **Version-specific** export options
- **Custom template** application
- **Automated filename** generation

## API Integration

### Programmatic Export
```javascript
// Export configuration programmatically
const config = getCurrentConfig();
const yamlString = exportToYAML(config);
const jsonString = exportToJSON(config);
```

### Import Validation
```javascript
// Validate before import
const result = validateConfiguration(fileContent);
if (result.valid) {
  importConfiguration(result.config);
} else {
  handleErrors(result.errors);
}
```

## Troubleshooting

### Import Fails Completely
1. **Check file format** - must be valid YAML/JSON
2. **Verify encoding** - use UTF-8 encoding
3. **Test with simple** configuration first
4. **Check browser console** for detailed errors

### Partial Import Success
1. **Review error messages** for specific issues
2. **Fix identified problems** manually
3. **Re-import corrected** file
4. **Use Expert Editor** for fine-tuning

### Conversion Issues
1. **Review conversion report** for unexpected changes
2. **Compare with original** configuration
3. **Manual adjustment** of critical settings
4. **Test thoroughly** before deployment

## Next Steps

Master configuration management:
- **[Expert Editor](./expert-editor.md)** - Advanced editing tools
- **[Recipes](../recipes/index.md)** - Example configurations to import
- **[Troubleshooting](../troubleshooting/legacy-configs.md)** - Legacy import issues

Import/Export makes configuration management seamless across different FluidNC versions and formats! 📁