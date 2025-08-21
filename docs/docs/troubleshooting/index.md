---
sidebar_position: 1
---

# Troubleshooting

Having issues with FluidNC GUI or your configuration? This section covers the most common problems and their solutions.

## Quick Diagnosis

### Problem Categories

#### 🌐 **GUI Issues**
- Page won't load
- Interface not responding
- Browser compatibility problems

#### ⚙️ **Configuration Issues**  
- Validation errors
- Pin conflicts
- Import/export problems

#### 🔌 **Hardware Issues**
- Motors not moving
- Homing problems
- I/O not working

## Common Solutions

### GUI Not Loading

#### Symptoms
- Blank page or loading errors
- JavaScript errors in browser console
- "This site can't be reached" message

#### Solutions
1. **Check internet connection** (for online version)
2. **Try a different browser** (Chrome recommended)
3. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E
4. **Disable browser extensions** temporarily
5. **Update browser** to latest version

### Configuration Won't Save

#### Symptoms
- Changes don't persist after refresh
- "Failed to save" error messages
- Configuration resets to defaults

#### Solutions
1. **Check browser storage permissions**
2. **Clear browser data** and try again
3. **Export configuration** as backup before making changes
4. **Try incognito/private browsing** mode

### Pin Conflict Errors

#### Symptoms
- Red warning indicators on pin inputs
- "Pin already in use" messages
- Validation fails on export

#### Solutions
1. **Review all pin assignments** systematically
2. **Use Pin Mapper** feature to visualize conflicts
3. **Check for duplicate pins** across different functions
4. **Consult board pinout** documentation

See detailed guide: **[Pin Conflicts](./pin-conflicts.md)**

## Validation Errors

### Invalid Pin Assignments

#### Common Issues
- Using input-only pins for outputs
- Assigning pins that don't exist on your board
- Using pins reserved for flash memory

#### Solutions
```yaml
# Bad - GPIO 34 is input-only
step_pin: "gpio.34"

# Good - GPIO 2 can be output
step_pin: "gpio.2"
```

### Missing Required Fields

#### Common Issues
- Empty machine name
- Missing motor pin assignments
- Undefined axis properties

#### Solutions
1. **Use Wizard mode** for guided setup
2. **Check schema validation** messages
3. **Compare with working examples** from recipes

### Value Range Errors

#### Common Issues
- Negative speeds or accelerations
- Steps per mm too high/low
- Invalid PWM frequencies

#### Solutions
```yaml
# Bad values
steps_per_mm: -80     # Negative not allowed
max_rate_mm_per_min: 999999  # Unreasonably high

# Good values  
steps_per_mm: 80      # Positive value
max_rate_mm_per_min: 5000    # Reasonable speed
```

## Import/Export Issues

### YAML Import Fails

#### Symptoms
- "Invalid YAML format" errors
- Parsing errors on import
- Configuration imports but values missing

#### Solutions
1. **Validate YAML syntax** using online validator
2. **Check for special characters** in strings
3. **Use quotes for pin names**: `"gpio.2"` not `gpio.2`
4. **Verify indentation** (YAML is indent-sensitive)

### Legacy Configuration Problems

#### Symptoms
- Old configs won't import
- Missing properties after import
- Deprecated field warnings

#### Solutions
1. **Use Legacy Import feature** for automatic conversion
2. **Update old field names** manually
3. **Check conversion logs** for transformation details

See detailed guide: **[Legacy Configs](./legacy-configs.md)**

## Hardware Testing

### Motors Not Moving

#### Check List
1. **Power supply** connected and adequate voltage
2. **Stepper drivers** properly configured
3. **Wiring** correct between drivers and motors
4. **Enable pin** configured and working
5. **Step/direction pins** assigned correctly

#### Testing Commands
```gcode
$X        ; Clear any alarms
$I        ; Check board identification
G91       ; Relative positioning mode
G0 X1     ; Try small movement
```

### Homing Fails

#### Common Causes
- Limit switches not connected or faulty
- Homing direction wrong
- Speed too fast for switches
- Pull-up resistors not enabled

#### Testing
```gcode
?         ; Check current state
$H        ; Attempt homing
$$        ; Check homing settings
```

## Performance Issues

### Slow Interface Response

#### Causes
- Large configurations (many axes/motors)
- Older devices or browsers
- Too many browser tabs open

#### Solutions
1. **Close unnecessary browser tabs**
2. **Use desktop browser** instead of mobile
3. **Simplify configuration** for editing
4. **Consider local development** version

### Export Takes Long Time

#### Causes
- Complex configurations with many properties
- Large comment blocks or descriptions
- Browser performance limitations

#### Solutions
1. **Be patient** - large configs take time
2. **Simplify configuration** if possible
3. **Use JSON export** if faster than YAML

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide** thoroughly
2. **Try the solutions** listed for your specific issue
3. **Test with a simple configuration** first
4. **Note your browser and version**

### Where to Get Help

#### GitHub Issues
**[FluidNC GUI Issues](https://github.com/eghasemy/FluidNC_GUI/issues)**
- Bug reports
- Feature requests
- GUI-specific problems

#### FluidNC Community
**[FluidNC Discussions](https://github.com/bdring/FluidNC/discussions)**
- Hardware questions
- Firmware issues
- General CNC help

### Information to Include

When reporting issues, please include:

1. **Browser and version** (Chrome 91, Firefox 89, etc.)
2. **Operating system** (Windows 10, macOS Big Sur, etc.)
3. **Steps to reproduce** the problem
4. **Error messages** (exact text or screenshots)
5. **Configuration file** (if relevant)
6. **Expected vs. actual behavior**

## Specific Issue Guides

For detailed help with specific problems:

- **[Common Issues](./common-issues.md)** - Frequently encountered problems
- **[Pin Conflicts](./pin-conflicts.md)** - Resolving pin assignment conflicts  
- **[Legacy Configs](./legacy-configs.md)** - Importing old configurations

Still having trouble? Don't hesitate to ask for help in the community! 🤝