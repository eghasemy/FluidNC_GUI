---
sidebar_position: 4
---

# Legacy Configurations

Solutions for importing and converting older FluidNC configuration files. This guide helps you migrate from legacy formats to the modern FluidNC configuration structure.

## What Are Legacy Configurations?

Legacy configurations are older FluidNC files that use:
- **Flat structure** instead of hierarchical organization
- **Old field names** that have been renamed or reorganized
- **Different syntax** for certain features
- **Missing fields** now required in modern versions

## Common Legacy Patterns

### Flat Axis Configuration
Old format used flat structure:
```yaml
# Legacy flat format
x_steps_per_mm: 80
x_max_rate: 5000  
x_acceleration: 500
x_step_pin: gpio.2
x_dir_pin: gpio.5
x_en_pin: gpio.8
```

Modern hierarchical format:
```yaml
# Modern nested format
axes:
  x:
    steps_per_mm: 80
    max_rate_mm_per_min: 5000
    acceleration_mm_per_sec2: 500
    motor0:
      step_pin: "gpio.2"
      direction_pin: "gpio.5"
      disable_pin: "gpio.8"
```

### Old Driver Configuration
Legacy driver format:
```yaml
# Legacy driver configuration
x_driver: TMC2208
x_run_amps: 1.0
x_hold_amps: 0.5
x_microsteps: 16
```

Modern driver format:
```yaml
# Modern driver configuration
axes:
  x:
    motor0:
      tmc_2208:
        run_amps: 1.0
        hold_amps: 0.5
        microsteps: 16
```

### Spindle Configuration Changes
Legacy spindle:
```yaml
# Legacy spindle format
spindle_pwm_pin: gpio.12
spindle_enable_pin: gpio.13
spindle_dir_pin: gpio.14
max_rpm: 24000
min_rpm: 1000
```

Modern spindle:
```yaml
# Modern spindle format
spindle:
  pwm:
    output_pin: "gpio.12"
    enable_pin: "gpio.13"
    direction_pin: "gpio.14"
    speed_map: "1000=10% 24000=100%"
```

## Automatic Conversion

### FluidNC GUI Import Process
When you import a legacy file:

1. **Detection**: System recognizes legacy patterns
2. **Conversion**: Automatic transformation to modern format
3. **Validation**: Checks for completeness and correctness
4. **Report**: Shows what was changed
5. **Review**: Allows manual adjustment before acceptance

### Conversion Report Example
```
Legacy Configuration Import Report
==================================

Converted Fields:
- x_steps_per_mm → axes.x.steps_per_mm
- x_max_rate → axes.x.max_rate_mm_per_min  
- x_step_pin → axes.x.motor0.step_pin
- spindle_pwm_pin → spindle.pwm.output_pin

Added Default Values:
- axes.x.soft_limits: true
- axes.x.homing.cycle: 1

Recommendations:
- Review spindle speed mapping
- Verify pin assignments for your board
- Test homing sequence configuration
```

## Manual Conversion Steps

### Step 1: Backup Original
Always keep a copy of your original configuration:
```bash
cp my_old_config.yaml my_old_config_backup.yaml
```

### Step 2: Import and Review
1. **Import legacy file** using FluidNC GUI
2. **Review conversion report** carefully
3. **Note any warnings** or recommendations
4. **Check critical settings** like pin assignments

### Step 3: Validate and Test
1. **Use Pin Mapper** to check for conflicts
2. **Validate configuration** in Expert Editor
3. **Export updated file** for backup
4. **Test on hardware** if possible

## Common Conversion Issues

### Pin Name Changes
Old pin references need updating:
```yaml
# Legacy format
x_step_pin: 2          # Missing gpio prefix
x_dir_pin: "gpio.5"    # Inconsistent quoting

# Modern format
step_pin: "gpio.2"     # Consistent format
direction_pin: "gpio.5" # Standardized names
```

### Unit Clarifications
Modern format is explicit about units:
```yaml
# Legacy (ambiguous units)
x_max_rate: 5000

# Modern (explicit units)
max_rate_mm_per_min: 5000
```

### Missing Required Fields
Legacy configs may lack required modern fields:
```yaml
# Modern configs require explicit homing settings
homing:
  cycle: 1
  positive_direction: false
  mpos_mm: 0.0
  feed_mm_per_min: 1000.0
```

### Spindle Speed Mapping
Legacy configs used min/max RPM:
```yaml
# Legacy
max_rpm: 24000
min_rpm: 1000

# Modern requires explicit mapping
speed_map: "0=0% 1000=4% 24000=100%"
```

## Troubleshooting Legacy Import

### Import Fails Completely

#### Syntax Errors
Check for YAML syntax issues:
```yaml
# Bad syntax
name: My Machine
  board: ESP32    # ❌ Wrong indentation

# Fixed syntax  
name: "My Machine"
board: "ESP32"    # ✅ Proper indentation
```

#### File Encoding
Ensure file is UTF-8 encoded:
```bash
# Check encoding
file -bi config.yaml

# Convert if needed
iconv -f ISO-8859-1 -t UTF-8 config.yaml > config_utf8.yaml
```

### Partial Import Success

#### Missing Sections
Some legacy configs may be incomplete:
- **Add missing axes** if only some are defined
- **Include required safety** settings
- **Set up basic I/O** if missing

#### Field Value Issues
Legacy values may need adjustment:
```yaml
# Legacy negative values (now invalid)
x_max_rate: -5000     # ❌ Negative not allowed

# Fixed positive values
max_rate_mm_per_min: 5000  # ✅ Positive value
```

### Hardware Compatibility

#### Pin Assignment Changes
Legacy pin assignments may not work:
- **Check board compatibility** for pin numbers
- **Verify pin capabilities** (input/output)
- **Update for new board** if hardware changed

#### Driver Updates
Driver configurations may need updating:
```yaml
# Legacy driver config
x_driver: A4988

# Modern driver config (more explicit)
motor0:
  step_pin: "gpio.2"
  direction_pin: "gpio.5"
  disable_pin: "gpio.8"
  # A4988 needs no special config beyond pins
```

## Advanced Legacy Scenarios

### Multiple File Merge
If you have multiple legacy files to combine:
1. **Import each file** separately
2. **Export modern format** for each
3. **Manually merge** using Expert Editor
4. **Resolve any conflicts** between configurations

### Custom Legacy Fields
For non-standard legacy fields:
```yaml
# Legacy custom fields
custom_output_pin: gpio.32
user_macro_1: "G0 X0 Y0"

# Modern equivalent (using catchall)
io:
  custom_output_pin: "gpio.32"
macros:
  macro0: "G0 X0 Y0"
```

### Version-Specific Issues
Different FluidNC versions had different formats:
- **v3.0-3.4**: Early hierarchical format
- **v3.5-3.6**: Refined structure
- **v3.7+**: Current stable format

Check your source version and conversion path.

## Prevention for Future

### Modern Configuration Practices
To avoid future conversion issues:
1. **Use current format** for new configurations
2. **Export regularly** as backup
3. **Document custom** modifications
4. **Test with latest** FluidNC GUI version

### Version Control
Consider using version control:
```bash
git init my_cnc_configs
git add *.yaml
git commit -m "Initial configuration"
```

### Migration Planning
For organizations with many machines:
1. **Inventory existing** configurations
2. **Test conversion** process on samples
3. **Plan migration** timeline
4. **Train users** on new format

## Testing Converted Configurations

### Validation Checklist
After conversion, verify:
- ✅ **All axes** move correctly
- ✅ **Homing** works as expected  
- ✅ **Spindle/laser** responds to commands
- ✅ **I/O functions** operate properly
- ✅ **Safety systems** (e-stop, limits) function

### Incremental Testing
Test systematically:
1. **Basic movement** commands (G0, G1)
2. **Homing sequence** ($H)
3. **Spindle control** (M3, M5)
4. **I/O testing** (probe, coolant)
5. **Complex operations** (actual programs)

### Performance Comparison
Compare with legacy system:
- **Movement accuracy** and repeatability
- **Speed and acceleration** limits
- **Feature availability** and functionality
- **User interface** improvements

## Getting Help

### Documentation Resources
- **[FluidNC Wiki](https://github.com/bdring/FluidNC/wiki)** - Official documentation
- **[Configuration Examples](../recipes/index.md)** - Modern format examples
- **[Version Release Notes](https://github.com/bdring/FluidNC/releases)** - Change logs

### Community Support
- **[FluidNC Discussions](https://github.com/bdring/FluidNC/discussions)** - Community help
- **[Discord Channels](https://discord.gg/fluidnc)** - Real-time assistance
- **[GitHub Issues](https://github.com/eghasemy/FluidNC_GUI/issues)** - GUI-specific problems

### Professional Services
For complex migrations:
- **Configuration consulting** services
- **Custom conversion** tools
- **Training and support** programs

## Success Stories

### Typical Migration Benefits
Users report after successful migration:
- **Improved reliability** with modern validation
- **Better performance** with optimized settings
- **Enhanced features** not available in legacy format
- **Easier maintenance** with clearer organization

### Common Lessons Learned
- **Take time** to understand new format
- **Test thoroughly** before production use
- **Document changes** made during conversion
- **Keep legacy backup** until confident in new setup

Legacy configuration migration can seem daunting, but the modern format provides significant benefits in reliability, maintainability, and features. Take it step by step and don't hesitate to ask for help! 🔄