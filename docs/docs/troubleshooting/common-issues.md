---
sidebar_position: 2
---

# Common Issues

Solutions to the most frequently encountered problems when using FluidNC GUI.

## Configuration Issues

### "Steps per mm is too high/low"

#### Problem
Your machine moves the wrong distance when commanded.

#### Symptoms
- Commanded 10mm, but moved 20mm (steps too high)
- Commanded 10mm, but moved 5mm (steps too low)
- Circles come out as ovals
- Dimensions are consistently wrong

#### Solution
Calculate correct steps per mm:

1. **Test current setting**:
   ```gcode
   G91          ; Relative mode
   G0 X100      ; Command 100mm movement
   ```

2. **Measure actual distance** moved

3. **Calculate new value**:
   ```
   new_steps_per_mm = current_steps_per_mm × (commanded_distance / actual_distance)
   ```

4. **Example calculation**:
   - Current setting: 80 steps/mm
   - Commanded: 100mm
   - Actual movement: 125mm
   - New setting: 80 × (100/125) = 64 steps/mm

#### Common Values
| Drive Type | Typical Steps/mm |
|------------|------------------|
| GT2 Belt (20T pulley) | 80 |
| GT2 Belt (16T pulley) | 100 |
| 5mm Lead Screw | 400 |
| 8mm Lead Screw | 250 |
| Rack & Pinion | Varies widely |

### Motors Running Backwards

#### Problem
Motors move in opposite direction to what's expected.

#### Symptoms
- X+ command moves machine left instead of right
- Homing moves away from switches
- Coordinate system is mirrored

#### Solution
Invert the direction pin:

```yaml
# Before (normal)
direction_pin: "gpio.5"

# After (inverted)
direction_pin: "!gpio.5"
```

#### Alternative
Swap motor wiring (any two wires on stepper motor).

### Homing Goes Wrong Direction

#### Problem
Homing moves away from limit switches instead of toward them.

#### Symptoms
- Motors move away from switches during `$H` command
- Machine crashes into opposite end
- Homing fails with timeout

#### Solution
Change homing direction:

```yaml
homing:
  positive_direction: false  # Change to true, or vice versa
```

#### Test Process
1. **Note switch positions** (which end of travel)
2. **Try homing** with current settings
3. **If wrong direction**, toggle `positive_direction`
4. **Test again** at slow speed

### Soft Limits Triggered Immediately

#### Problem
Machine shows "Soft limit exceeded" error without moving.

#### Symptoms
- Can't move any axis
- Error appears immediately after homing
- All commands rejected

#### Causes
- `max_travel_mm` set incorrectly
- Homing position (`mpos_mm`) wrong
- Machine coordinates not properly set

#### Solution
Check and fix travel settings:

```yaml
axes:
  x:
    max_travel_mm: 300.0    # Set to actual machine travel
    homing:
      mpos_mm: 0.0          # Position after homing (usually 0 or max_travel)
```

#### Quick Fix
Disable soft limits temporarily:
```gcode
$20=0   ; Disable soft limits
```

## Hardware Issues

### Motors Won't Move at All

#### Checklist
1. **Power supply** connected and turned on
2. **Voltage** correct for your drivers (12V/24V)
3. **Motor enable** pin working (usually active low)
4. **Wiring** correct between controller and drivers
5. **Driver configuration** (current limiting, microstepping)

#### Test Enable Pin
```yaml
# Try inverting enable pin
disable_pin: "!gpio.8"  # Add ! if motors still don't work
```

#### Quick Test
```gcode
$X        ; Clear alarms
$I        ; Check board info
G91       ; Relative mode
G0 X0.1   ; Tiny movement
```

### Motors Stall or Skip Steps

#### Causes
- **Current too low**: Insufficient torque
- **Speed too high**: Exceeding motor capability
- **Acceleration too high**: Can't reach speed quickly enough
- **Mechanical binding**: Friction or interference

#### Solutions

1. **Reduce speed**:
   ```yaml
   max_rate_mm_per_min: 2000.0  # Start lower, increase gradually
   ```

2. **Reduce acceleration**:
   ```yaml
   acceleration_mm_per_sec2: 200.0  # Start conservative
   ```

3. **Check current settings** on stepper drivers
4. **Verify mechanical** freedom of movement

### Spindle Won't Start

#### PWM Spindle Issues
1. **Check PWM signal** with multimeter or oscilloscope
2. **Verify frequency** matches spindle requirements
3. **Test enable pin** functionality

#### Common Solutions
```yaml
spindle:
  pwm:
    pwm_hz: 1000      # Try different frequencies (1k-25k)
    output_pin: "gpio.12"
    enable_pin: "gpio.13"
    direction_pin: "gpio.14"
```

#### Test Commands
```gcode
M3 S100   ; Start at low speed
M5        ; Stop spindle
```

### Limit Switches Not Working

#### Symptoms
- Homing fails with "Hard limit" error
- Switches don't trigger when pressed
- Inconsistent switch behavior

#### Checklist
1. **Wiring** correct (one side to pin, other to ground)
2. **Switch type** (normally open vs. normally closed)
3. **Pull-up resistors** enabled in software
4. **Debounce** settings appropriate

#### Test Switch States
```gcode
$?        ; Check status - should show switch states
```

#### Configuration
```yaml
# Standard switch configuration
limit_neg_pin: "gpio.9"    # One switch per axis
homing:
  debounce_ms: 500         # Increase if switches are noisy
```

## Software Issues

### Can't Connect to Board

#### USB Connection
1. **Driver installed** for USB-to-serial chip
2. **Correct baud rate** (usually 115200)
3. **Board powered** and not in bootloader mode
4. **Cable working** (try different cable)

#### WiFi Connection
1. **Board configured** for WiFi mode
2. **Network settings** correct
3. **IP address** accessible
4. **Firewall** not blocking connection

### Configuration Upload Fails

#### Common Causes
- **File format** wrong (need YAML for FluidNC)
- **Syntax errors** in configuration
- **Board storage** full or corrupted
- **Connection** interrupted during upload

#### Solutions
1. **Validate YAML** before uploading
2. **Use simple config** to test connection
3. **Factory reset** board if needed
4. **Check board documentation** for upload procedure

### G-code Commands Don't Work

#### Symptoms
- Commands ignored or rejected
- "Unknown command" errors
- Unexpected behavior

#### Common Issues
1. **Machine not homed** (some commands require homing)
2. **Wrong coordinate mode** (G90 vs G91)
3. **Alarm state** active
4. **Invalid parameters** for command

#### Debug Process
```gcode
$?        ; Check machine state
$$        ; Check all parameters
$G        ; Check active modes
```

## Performance Issues

### Interface Slow or Unresponsive

#### Browser Issues
1. **Too many tabs** open
2. **Browser extensions** interfering
3. **Insufficient memory** on device
4. **Outdated browser** version

#### Solutions
1. **Close other tabs**
2. **Disable extensions**
3. **Use desktop browser** (not mobile)
4. **Clear browser cache**

### Large Configurations Cause Problems

#### Symptoms
- GUI becomes slow
- Export takes very long time
- Browser crashes or freezes

#### Solutions
1. **Simplify configuration** while editing
2. **Remove unnecessary comments**
3. **Use Expert mode** for large configs
4. **Export smaller sections** at a time

## Error Message Reference

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Pin already in use" | Duplicate pin assignment | Check all pin assignments |
| "Invalid pin number" | Pin doesn't exist on board | Use valid GPIO numbers |
| "Steps per mm must be positive" | Negative or zero value | Enter positive number |
| "Soft limit exceeded" | Movement beyond travel limit | Check travel settings |
| "Hard limit triggered" | Hit physical limit switch | Clear alarm, check setup |
| "Alarm state" | Safety system active | Identify and clear alarm cause |

### Validation Messages

The GUI provides helpful validation:
- 🟢 **Green**: Valid configuration
- 🟡 **Yellow**: Warnings (still valid)
- 🔴 **Red**: Errors (must fix)

## Prevention Tips

### Before You Start
1. **Read your board documentation**
2. **Plan pin assignments** on paper first
3. **Start with simple configuration**
4. **Test one feature at a time**

### During Configuration
1. **Save frequently** (export backups)
2. **Test incrementally** after each major change
3. **Document your changes**
4. **Keep notes** on what works

### Before Going Live
1. **Double-check all pins**
2. **Verify directions** with low speeds
3. **Test emergency stop**
4. **Check homing carefully**

Still having issues? Check the other troubleshooting guides or ask for help in the community! 🤝