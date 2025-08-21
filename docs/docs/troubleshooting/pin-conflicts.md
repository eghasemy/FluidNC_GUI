---
sidebar_position: 3
---

# Pin Conflicts

Understanding and resolving pin assignment conflicts in FluidNC GUI.

## What Are Pin Conflicts?

Pin conflicts occur when you try to assign the same GPIO pin to multiple functions. Since each pin can only perform one function at a time, conflicts must be resolved before your configuration will work.

## How FluidNC GUI Helps

### Visual Indicators
The GUI provides real-time feedback:
- 🟢 **Green**: Pin is available
- 🟡 **Yellow**: Pin is in use (but valid)
- 🔴 **Red**: Pin conflict detected
- ❌ **Disabled**: Pin cannot be used for this function

### Conflict Detection
The system automatically detects:
- **Duplicate assignments**: Same pin used twice
- **Board limitations**: Using invalid pins for specific functions
- **Hardware restrictions**: Input-only pins assigned as outputs

## Common Pin Conflicts

### Motor Pin Conflicts
Most common conflict with motor pins:

```yaml
# WRONG - Same pin used for two motors
axes:
  x:
    motor0:
      step_pin: "gpio.2"  # ❌ Conflict
  y:
    motor0:
      step_pin: "gpio.2"  # ❌ Same pin
```

```yaml
# CORRECT - Different pins for each motor
axes:
  x:
    motor0:
      step_pin: "gpio.2"  # ✅ Unique
  y:
    motor0:
      step_pin: "gpio.3"  # ✅ Unique
```

### Enable Pin Sharing
Enable pins CAN be shared (this is normal):

```yaml
# CORRECT - Shared enable pin is OK
axes:
  x:
    motor0:
      disable_pin: "gpio.8"  # ✅ Shared enable
  y:
    motor0:
      disable_pin: "gpio.8"  # ✅ Same enable OK
```

### I/O Pin Conflicts
Watch for conflicts between different I/O functions:

```yaml
# WRONG - Same pin for probe and limit switch
probe:
  pin: "gpio.15"        # ❌ Conflict

axes:
  x:
    limit_neg_pin: "gpio.15"  # ❌ Same pin
```

## ESP32 Pin Limitations

### Input-Only Pins
These pins cannot be outputs:
- **GPIO 34, 35, 36, 39** (ADC1 channels)

```yaml
# WRONG - GPIO 34 cannot be output
motor0:
  step_pin: "gpio.34"   # ❌ Input-only pin
```

```yaml
# CORRECT - Use for inputs only
limit_neg_pin: "gpio.34"  # ✅ Input OK
```

### Flash Memory Pins
Avoid these pins (connected to flash memory):
- **GPIO 6, 7, 8, 9, 10, 11**

### Strapping Pins
Be careful with these pins (used during boot):
- **GPIO 0**: Boot mode selection
- **GPIO 2**: Boot mode selection
- **GPIO 5**: JTAG
- **GPIO 12**: Flash voltage selection
- **GPIO 15**: JTAG

These can be used but may cause boot issues if pulled incorrectly.

## Resolving Conflicts

### Step 1: Identify All Conflicts
1. **Use Pin Mapper** in FluidNC GUI
2. **Check all red indicators**
3. **Note which pins are conflicted**

### Step 2: Plan Pin Assignments
Create a pin assignment table:

| Function | Current Pin | New Pin | Notes |
|----------|-------------|---------|--------|
| X Step | gpio.2 | gpio.2 | ✅ Keep |
| Y Step | gpio.2 | gpio.3 | ❌ Was conflict |
| Z Step | - | gpio.4 | ✅ New assignment |

### Step 3: Update Configuration
Work through conflicts systematically:
1. **Fix most critical** functions first (motors, safety)
2. **Leave optional** functions for last (coolant, extra I/O)
3. **Test incrementally** after major changes

### Step 4: Validate
1. **Check GUI indicators** all green
2. **Export configuration** to verify
3. **Test on hardware** if possible

## Pin Assignment Strategies

### Group Related Functions
Keep related pins together:
```yaml
# Motor pins grouped together
x_step_pin: "gpio.2"
x_dir_pin: "gpio.5" 
y_step_pin: "gpio.3"
y_dir_pin: "gpio.6"
z_step_pin: "gpio.4"
z_dir_pin: "gpio.7"
```

### Leave Room for Expansion
Don't use every available pin:
- Reserve some pins for future features
- Keep some spare I/O pins available
- Plan for additional motors or sensors

### Use Board Documentation
Always reference your board's pinout:
- Check manufacturer's pin diagrams
- Note any special pin functions
- Verify current capabilities for motor drivers

## Advanced Conflict Resolution

### TMC Driver Conflicts
TMC drivers with UART need additional pins:

```yaml
# WRONG - UART pins conflict with other functions
motor0:
  tmc_2208:
    uart:
      txd_pin: "gpio.12"  # ❌ Conflicts with spindle
      rxd_pin: "gpio.13"  # ❌ Conflicts with spindle
```

```yaml
# CORRECT - Separate pins for UART
motor0:
  tmc_2208:
    uart:
      txd_pin: "gpio.21"  # ✅ Dedicated UART pins
      rxd_pin: "gpio.22"  # ✅ Dedicated UART pins
```

### Multi-Driver Conflicts
When using multiple stepper drivers per axis:

```yaml
# Dual Y motors - need separate pins
axes:
  y:
    motor0:
      step_pin: "gpio.3"
      direction_pin: "gpio.6"
    motor1:
      step_pin: "gpio.25"    # ✅ Different step pin
      direction_pin: "gpio.26"  # ✅ Different direction pin
      disable_pin: "gpio.8"     # ✅ Enable can be shared
```

## Troubleshooting Pin Issues

### Configuration Won't Save
If GUI won't save your config:
1. **Check for red indicators**
2. **Resolve all conflicts**
3. **Validate pin numbers** exist on your board

### Hardware Doesn't Work
If configuration loads but hardware doesn't respond:
1. **Verify wiring** matches pin assignments
2. **Check pin capabilities** (input vs. output)
3. **Test with multimeter** for signal presence

### Intermittent Issues
If problems come and go:
1. **Check for loose connections**
2. **Verify power supply** stability
3. **Check for electrical interference**

## Pin Assignment Tools

### FluidNC GUI Pin Mapper
- **Visual conflict detection**
- **Board-specific validation**
- **Real-time feedback**

### External Resources
- **ESP32 pinout diagrams**
- **Board manufacturer documentation**
- **Community pin assignment sheets**

## Prevention Tips

### Before You Start
1. **Study your board layout**
2. **Plan on paper first**
3. **Check existing projects** with similar boards

### During Configuration
1. **Work systematically** through each function
2. **Test small sections** before building large configs
3. **Document your assignments**

### Before Deployment
1. **Double-check critical functions**
2. **Verify with multimeter** if possible
3. **Test emergency stops** and safety features

## Getting Help

If you're still having pin conflict issues:

1. **Check board documentation** thoroughly
2. **Ask in community forums** with your specific board model
3. **Share your pin assignment table** when asking for help

Need more help? Check our other troubleshooting guides or ask in the community! 🤝