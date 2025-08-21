---
sidebar_position: 5
---

# Custom Board Setup

Configuration guidance for specialized or custom ESP32 boards not covered by standard presets. Learn how to adapt FluidNC GUI for any ESP32-based controller.

## When You Need Custom Setup

### Specialized Controllers
- **Custom CNC controllers** with unique pin layouts
- **Development boards** not in standard presets
- **Modified ESP32 boards** with additional features
- **Integrated motor drivers** with specific pin requirements

### Unique Requirements
- **Non-standard pin counts** or arrangements
- **Built-in features** like displays or WiFi antennas
- **Special voltage levels** or current capabilities
- **Custom breakout boards** with fixed routing

## Preparation Steps

### Gather Board Information
Before configuring, collect:
1. **Schematic or pinout diagram**
2. **Pin capability documentation**
3. **Electrical specifications** (voltage, current)
4. **Special pin restrictions** or reservations
5. **Manufacturer recommendations**

### Identify Pin Categories
Categorize available pins:
- **Digital I/O**: General purpose pins
- **Input-only**: ADC pins (34, 35, 36, 39 on standard ESP32)
- **Reserved**: Flash memory, boot strapping
- **Special function**: UART, SPI, I2C, PWM

## Configuration Process

### Step 1: Board Selection
In FluidNC GUI:
1. **Select "Generic ESP32"** as starting point
2. **Use Expert Editor** for detailed customization
3. **Reference pin capabilities** during assignment

### Step 2: Pin Mapping Strategy
Plan your pin assignments:

```yaml
# Example custom board pin mapping
# Grouping related functions together
axes:
  x:
    motor0:
      step_pin: "gpio.2"      # Digital output
      direction_pin: "gpio.4" # Digital output  
      disable_pin: "gpio.16"  # Shared enable
  y:
    motor0:
      step_pin: "gpio.17"     # Digital output
      direction_pin: "gpio.5" # Digital output
      disable_pin: "gpio.16"  # Shared enable
```

### Step 3: Validation and Testing
- **Use Pin Mapper** to visualize assignments
- **Check for conflicts** before proceeding
- **Test critical functions** first
- **Document working configuration**

## Common Custom Board Types

### Development Boards

#### ESP32-DevKit Variants
```yaml
# Standard DevKit with 30 pins
# Avoid pins: 6-11 (flash), 0 (boot), 2 (LED)
# Input-only: 34, 35, 36, 39

# Recommended motor pins
x_step_pin: "gpio.13"
x_dir_pin: "gpio.12"
y_step_pin: "gpio.14"
y_dir_pin: "gpio.27"
z_step_pin: "gpio.26"
z_dir_pin: "gpio.25"
enable_pin: "gpio.33"  # Shared enable
```

#### ESP32-S3 Boards
```yaml
# ESP32-S3 with more pins available
# Check specific variant for pin count

# Example S3 configuration
x_step_pin: "gpio.1"
x_dir_pin: "gpio.2"
y_step_pin: "gpio.3"
y_dir_pin: "gpio.4"
# More pins available than standard ESP32
```

### Integrated Driver Boards

#### All-in-One Controllers
```yaml
# Boards with integrated stepper drivers
# Often have fixed pin assignments

# Example integrated board
axes:
  x:
    motor0:
      step_pin: "gpio.2"    # Fixed by board design
      direction_pin: "gpio.5"
      # No disable pin (integrated drivers)
```

#### TMC Driver Integration
```yaml
# Boards with built-in TMC drivers
axes:
  x:
    motor0:
      step_pin: "gpio.2"
      direction_pin: "gpio.5"
      tmc_2208:
        uart:
          txd_pin: "gpio.17"  # Board-specific UART pins
          rxd_pin: "gpio.16"
          addr: 0
        run_amps: 1.2
        microsteps: 16
```

## Special Considerations

### Voltage Level Compatibility
Ensure voltage compatibility:
- **3.3V logic**: Standard ESP32 output
- **5V tolerant**: Some pins can handle 5V input
- **Level shifters**: May be needed for 5V peripherals

### Current Limitations
Consider current capacity:
- **ESP32 pins**: ~40mA maximum per pin
- **Stepper drivers**: Usually need separate power
- **Relays/solenoids**: Require driver circuits

### Electrical Isolation
For industrial environments:
- **Optoisolators**: Protect sensitive inputs
- **Separate power supplies**: Isolate logic and motor power
- **Grounding**: Proper ground plane design

## Pin Assignment Best Practices

### Grouping Strategy
Group related pins logically:
```yaml
# Group motor pins by axis
# X-axis: pins 2, 5, 8
# Y-axis: pins 3, 6, 8  
# Z-axis: pins 4, 7, 8

# Group I/O by function
# Limits: pins 9, 10, 11
# Spindle: pins 12, 13, 14
# Probe/Safety: pins 15, 16
```

### Future Expansion
Leave room for growth:
- **Reserve pins** for additional features
- **Plan upgrade paths** for more axes
- **Consider analog inputs** for sensors
- **WiFi compatibility** (avoid ADC2 pins if using WiFi)

### Signal Integrity
Minimize interference:
- **Separate high-frequency** signals (step pulses)
- **Keep sensitive inputs** away from power switching
- **Use shortest possible** wire runs
- **Consider shielding** for noisy environments

## Testing Custom Configurations

### Incremental Testing
Test functionality step by step:
1. **Basic connectivity** - Board communication
2. **One motor** - Single axis movement
3. **All motors** - Multi-axis coordination
4. **I/O functions** - Limits, probe, spindle
5. **Advanced features** - TMC drivers, macros

### Validation Checklist
✅ **Pin assignments** unique (no conflicts)
✅ **Pin capabilities** match usage (input/output)
✅ **Electrical limits** within specifications
✅ **Board restrictions** respected
✅ **Mechanical operation** verified

### Troubleshooting Process
If issues arise:
1. **Check pin assignments** against board documentation
2. **Verify electrical connections** with multimeter
3. **Test with simple configuration** first
4. **Compare with working examples**
5. **Consult board manufacturer** documentation

## Documentation and Sharing

### Document Your Setup
Create documentation including:
- **Board identification** and source
- **Pin assignment table** with functions
- **Wiring diagrams** or photos
- **Configuration file** (YAML)
- **Testing notes** and quirks

### Share with Community
Help others by sharing:
- **Working configurations** for specific boards
- **Pin assignment strategies** that work well
- **Troubleshooting tips** for common issues
- **Board-specific gotchas** to avoid

## Advanced Customization

### Custom Pin Mappings
For specialized needs:
```yaml
# Custom pin functions not in standard schema
io:
  custom_output_1: "gpio.32"
  custom_input_1: "gpio.35"
  analog_sensor_1: "gpio.36"
```

### Multiple Board Support
If supporting multiple board variants:
- **Create separate** configuration files
- **Use consistent** pin naming schemes
- **Document differences** between variants
- **Test on all** supported boards

### Board Descriptor Creation
For frequently used custom boards:
1. **Create board descriptor** JSON file
2. **Define pin capabilities** and restrictions
3. **Submit to community** for inclusion
4. **Maintain compatibility** with updates

## Safety Considerations

### Custom Board Risks
Be aware of potential issues:
- **Untested pin combinations** may cause conflicts
- **Electrical specifications** may differ from documentation
- **Heat dissipation** considerations for enclosed boards
- **EMI/RFI** susceptibility in industrial environments

### Validation Requirements
Before production use:
- **Thorough testing** of all functions
- **Stress testing** under load conditions
- **Temperature testing** in operating environment
- **Reliability testing** over extended periods

## Support Resources

### Community Help
- **FluidNC Discussions** for board-specific questions
- **ESP32 Forums** for hardware-level issues
- **GitHub Issues** for software-related problems
- **Discord Communities** for real-time help

### Manufacturer Support
- **Board manufacturer** documentation and support
- **ESP32 official** documentation from Espressif
- **Driver manufacturer** documentation for integrated drivers

## Next Steps

Master custom configurations:
- **[Expert Editor](../features/expert-editor.md)** - Advanced configuration editing
- **[Pin Mapper](../features/pin-mapper.md)** - Visual pin management
- **[Troubleshooting](../troubleshooting/pin-conflicts.md)** - Resolve complex issues

Custom board setup requires patience and methodical testing, but opens up unlimited possibilities for specialized CNC applications! 🔧