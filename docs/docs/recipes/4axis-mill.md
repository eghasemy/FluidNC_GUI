---
sidebar_position: 4
---

# 4-Axis Mill

Configuration for a 4-axis CNC mill with rotary axis. Ideal for machining complex parts that require rotation around a cylindrical workpiece.

## Machine Specifications

This recipe is designed for:
- **4 stepper motors** (X, Y, Z linear + A rotary)
- **Homing on linear axes** (X, Y, Z)
- **Rotary axis without homing** (A-axis)
- **Spindle with speed control**
- **Standard ESP32** board

## Complete Configuration

```yaml
name: "4-Axis Mill"
board: "ESP32"
version: "3.7"

axes:
  x:
    steps_per_mm: 80.0
    max_rate_mm_per_min: 4000.0
    acceleration_mm_per_sec2: 400.0
    max_travel_mm: 200.0
    soft_limits: true
    homing:
      cycle: 1
      positive_direction: false
      mpos_mm: 0.0
      feed_mm_per_min: 1000.0
      seek_mm_per_min: 2000.0
    motor0:
      step_pin: "gpio.2"
      direction_pin: "gpio.5"
      disable_pin: "gpio.8"
    limit_neg_pin: "gpio.9"

  y:
    steps_per_mm: 80.0
    max_rate_mm_per_min: 4000.0
    acceleration_mm_per_sec2: 400.0
    max_travel_mm: 150.0
    soft_limits: true
    homing:
      cycle: 1
      positive_direction: false
      mpos_mm: 0.0
      feed_mm_per_min: 1000.0
      seek_mm_per_min: 2000.0
    motor0:
      step_pin: "gpio.3"
      direction_pin: "gpio.6"
      disable_pin: "gpio.8"
    limit_neg_pin: "gpio.10"

  z:
    steps_per_mm: 400.0
    max_rate_mm_per_min: 1500.0
    acceleration_mm_per_sec2: 150.0
    max_travel_mm: 100.0
    soft_limits: true
    homing:
      cycle: 2
      positive_direction: true
      mpos_mm: 100.0
      feed_mm_per_min: 500.0
      seek_mm_per_min: 1000.0
    motor0:
      step_pin: "gpio.4"
      direction_pin: "gpio.7"
      disable_pin: "gpio.8"
    limit_pos_pin: "gpio.11"

  a:
    steps_per_mm: 8.888889  # 360°/40.5 = 8.888889 steps per degree
    max_rate_mm_per_min: 3600.0  # 360°/min = 6 RPM
    acceleration_mm_per_sec2: 600.0
    max_travel_mm: 360000.0  # Effectively unlimited rotation
    soft_limits: false  # No soft limits for rotary
    motor0:
      step_pin: "gpio.25"
      direction_pin: "gpio.26"
      disable_pin: "gpio.8"
    # No homing switch for rotary axis

spindle:
  pwm:
    pwm_hz: 5000
    output_pin: "gpio.12"
    enable_pin: "gpio.13"
    direction_pin: "gpio.14"
    spinup_ms: 2000
    spindown_ms: 2000
    tool_num: 0
    speed_map: "0=0% 1000=10% 18000=100%"

probe:
  pin: "gpio.15"
  check_mode_start: true

control:
  safety_door_pin: "gpio.16"
  reset_pin: "gpio.17"
  feed_hold_pin: "gpio.18"

coolant:
  flood_pin: "gpio.19"
```

## Pin Assignment Summary

| Function | GPIO Pin | Notes |
|----------|----------|-------|
| X Step | 2 | X-axis linear movement |
| Y Step | 3 | Y-axis linear movement |
| Z Step | 4 | Z-axis linear movement |
| A Step | 25 | A-axis rotary movement |
| X Direction | 5 | X-axis direction control |
| Y Direction | 6 | Y-axis direction control |
| Z Direction | 7 | Z-axis direction control |
| A Direction | 26 | A-axis direction control |
| Motor Enable | 8 | Shared enable for all motors |
| X Limit | 9 | X-axis homing switch |
| Y Limit | 10 | Y-axis homing switch |
| Z Limit | 11 | Z-axis homing switch |
| Spindle PWM | 12 | Spindle speed control |
| Spindle Enable | 13 | Spindle on/off |
| Spindle Direction | 14 | CW/CCW rotation |
| Probe | 15 | Touch probe input |
| Safety Door | 16 | Emergency stop |
| Reset | 17 | Reset button |
| Feed Hold | 18 | Feed hold button |
| Coolant | 19 | Coolant pump |

## Rotary Axis Configuration

### Steps per Degree Calculation
For rotary axis, steps_per_mm represents steps per degree:

```
steps_per_degree = (motor_steps × microsteps × gear_ratio) / 360°

Example with 1.8° stepper, 16 microsteps, 40:1 gearbox:
steps_per_degree = (200 × 16 × 40) / 360 = 8.888889
```

### Speed Settings
Rotary axis speeds are in degrees per minute:
- **max_rate_mm_per_min: 3600** = 360°/min = 6 RPM
- **acceleration_mm_per_sec2: 600** = 600°/sec² acceleration

### No Homing for Rotary
Rotary axes typically don't home:
- **No limit switches** on A-axis
- **No homing cycle** configured
- **Soft limits disabled** for continuous rotation

## Customization Guide

### Linear Axes Adjustment
Same as 3-axis machines:
- Adjust **steps_per_mm** for your mechanical setup
- Set **travel limits** to match your machine
- Tune **speeds** for your motors and drivers

### Rotary Axis Tuning

#### Gear Ratio Calculation
Most rotary axes use reduction gearing:
```yaml
# For different gear ratios:
# 10:1 ratio: steps_per_mm: 2.222222
# 20:1 ratio: steps_per_mm: 4.444444  
# 50:1 ratio: steps_per_mm: 11.111111
# 90:1 ratio: steps_per_mm: 20.0
```

#### Speed Considerations
Rotary axes are usually slower:
- **Conservative speeds** prevent workpiece damage
- **Lower acceleration** for heavy workpieces
- **Consider workpiece inertia** when setting limits

### Spindle for Milling
Configured for variable speed milling:
```yaml
spindle:
  pwm:
    speed_map: "0=0% 1000=10% 18000=100%"  # Typical mill speeds
    spinup_ms: 2000   # Longer spinup for heavy spindles
    spindown_ms: 2000 # Longer spindown for safety
```

## 4-Axis G-code Usage

### Basic 4-Axis Commands
```gcode
G90           ; Absolute positioning
G0 X10 Y10 Z5 A45  ; Position all 4 axes
G1 X20 A90 F500    ; Simultaneous linear and rotary move
A360          ; Full rotation (360 degrees)
```

### Typical 4-Axis Operations

#### Cylinder Machining
```gcode
; Machine around cylinder circumference
G0 Z10 A0     ; Start position
G1 Z0 F200    ; Plunge to depth
G1 A360 F300  ; Machine full rotation
G0 Z10        ; Retract
```

#### Helical Milling
```gcode
; Helical thread cutting
G0 X0 Y0 Z10 A0   ; Start position
G1 Z0 F100        ; Plunge start
G1 X0 Y0 Z-10 A360 F200  ; Helical move
```

#### Index Operations
```gcode
; Machine multiple features around circumference
G0 A0         ; Index to 0°
; ... machining operations ...
G0 A90        ; Index to 90°
; ... machining operations ...
G0 A180       ; Index to 180°
; ... machining operations ...
```

## Workholding Considerations

### Chuck vs. Centers
- **Chuck holding**: Good for short, rigid parts
- **Between centers**: Better for long, slender parts
- **Tailstock support**: Reduces deflection and chatter

### Workpiece Balance
- **Dynamic balancing** important at higher speeds
- **Counterweights** may be needed for irregular shapes
- **Speed limitations** based on workpiece geometry

## Safety Considerations

### Rotary Axis Safety
- **No soft limits** means potential for wrap-around
- **Manual positioning** before starting programs
- **Chuck/workpiece clearance** critical
- **Emergency stop** easily accessible

### Tool Clearance
- **Longer tools** may be needed for deep features
- **Tool path planning** must consider rotary motion
- **Collision detection** more complex with 4 axes

## Troubleshooting 4-Axis Issues

### A-Axis Not Moving
1. **Check motor connections** and driver settings
2. **Verify step/direction** pin assignments
3. **Test with manual commands** (G1 A10)
4. **Check gear backlash** and mechanical binding

### Positioning Accuracy
1. **Calibrate steps per degree** with test cuts
2. **Check gear backlash** compensation
3. **Verify motor torque** adequate for workpiece
4. **Test repeatability** with index positioning

### Synchronization Issues
1. **Tune acceleration** for all axes
2. **Balance speeds** between linear and rotary
3. **Check mechanical** rigidity of rotary axis
4. **Verify timing** in multi-axis moves

## Advanced Features

### Tool Length Compensation
```gcode
G43 H1        ; Tool length offset
G0 Z10 A45    ; Position with offset active
```

### Coordinate System Rotation
Some CAM software supports:
- **G68**: Coordinate system rotation
- **Compound angles** with A-axis positioning
- **3D surface** machining on cylinders

## Maintenance

### Regular Checks
- **Rotary axis backlash** measurement
- **Chuck/collet** condition
- **Gear lubrication** as needed
- **Encoder feedback** (if equipped)

### Calibration
- **Periodic steps/degree** verification
- **Index repeatability** testing
- **Runout measurement** of workholding
- **Tool setter** calibration for 4-axis

## Next Steps

- **[Custom Board Setup](./custom-board.md)** - Advanced board configurations
- **[Expert Editor](../features/expert-editor.md)** - Fine-tune advanced settings
- **[Pin Mapper](../features/pin-mapper.md)** - Manage complex pin layouts

4-axis machining opens up new possibilities for complex part manufacturing. Take time to understand the rotary axis behavior before attempting complex programs! 🔄