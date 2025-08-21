---
sidebar_position: 2
---

# Basic 3-Axis Router

A complete configuration for a standard 3-axis CNC router. This is the most common machine type and works great for woodworking, plastic, and soft metals.

## Machine Specifications

This recipe is designed for:
- **3 stepper motors** (X, Y, Z axes)
- **Limit switches** on all axes for homing
- **PWM spindle** with speed and direction control
- **Standard ESP32** development board
- **Compatible stepper drivers** (A4988, DRV8825, TMC2208, etc.)

## Complete Configuration

```yaml
name: "Basic 3-Axis Router"
board: "ESP32"
version: "3.7"

axes:
  x:
    steps_per_mm: 80.0
    max_rate_mm_per_min: 5000.0
    acceleration_mm_per_sec2: 500.0
    max_travel_mm: 300.0
    soft_limits: true
    homing:
      cycle: 1
      positive_direction: false
      mpos_mm: 0.0
      feed_mm_per_min: 1000.0
      seek_mm_per_min: 2000.0
      debounce_ms: 500
      seek_scaler: 1.1
      feed_scaler: 1.1
    motor0:
      step_pin: "gpio.2"
      direction_pin: "gpio.5"
      disable_pin: "gpio.8"
    limit_neg_pin: "gpio.9"

  y:
    steps_per_mm: 80.0
    max_rate_mm_per_min: 5000.0
    acceleration_mm_per_sec2: 500.0
    max_travel_mm: 200.0
    soft_limits: true
    homing:
      cycle: 1
      positive_direction: false
      mpos_mm: 0.0
      feed_mm_per_min: 1000.0
      seek_mm_per_min: 2000.0
      debounce_ms: 500
      seek_scaler: 1.1
      feed_scaler: 1.1
    motor0:
      step_pin: "gpio.3"
      direction_pin: "gpio.6"
      disable_pin: "gpio.8"
    limit_neg_pin: "gpio.10"

  z:
    steps_per_mm: 400.0
    max_rate_mm_per_min: 2000.0
    acceleration_mm_per_sec2: 200.0
    max_travel_mm: 100.0
    soft_limits: true
    homing:
      cycle: 2
      positive_direction: true
      mpos_mm: 100.0
      feed_mm_per_min: 500.0
      seek_mm_per_min: 1000.0
      debounce_ms: 500
      seek_scaler: 1.1
      feed_scaler: 1.1
    motor0:
      step_pin: "gpio.4"
      direction_pin: "gpio.7"
      disable_pin: "gpio.8"
    limit_pos_pin: "gpio.11"

spindle:
  pwm:
    pwm_hz: 5000
    output_pin: "gpio.12"
    enable_pin: "gpio.13"
    direction_pin: "gpio.14"
    spinup_ms: 1000
    spindown_ms: 1000
    tool_num: 0
    speed_map: "0=0% 1000=10% 24000=100%"

probe:
  pin: "gpio.15"
  check_mode_start: true

control:
  safety_door_pin: "gpio.16"
  reset_pin: "gpio.17"
  feed_hold_pin: "gpio.18"
  cycle_start_pin: "gpio.19"

coolant:
  flood_pin: "gpio.20"
```

## Pin Assignment Summary

| Function | GPIO Pin | Notes |
|----------|----------|-------|
| X Step | 2 | Step pulse for X motor |
| Y Step | 3 | Step pulse for Y motor |
| Z Step | 4 | Step pulse for Z motor |
| X Direction | 5 | Direction control for X motor |
| Y Direction | 6 | Direction control for Y motor |
| Z Direction | 7 | Direction control for Z motor |
| Motor Enable | 8 | Shared enable for all motors |
| X Limit | 9 | X-axis limit/homing switch |
| Y Limit | 10 | Y-axis limit/homing switch |
| Z Limit | 11 | Z-axis limit/homing switch |
| Spindle PWM | 12 | Speed control (0-3.3V PWM) |
| Spindle Enable | 13 | Spindle on/off control |
| Spindle Direction | 14 | Clockwise/counterclockwise |
| Probe | 15 | Touch probe input |
| Safety Door | 16 | Emergency stop/safety door |
| Reset | 17 | Emergency reset button |
| Feed Hold | 18 | Feed hold button |
| Cycle Start | 19 | Cycle start button |
| Coolant | 20 | Coolant pump control |

## Customization Guide

### Mechanical Settings

#### Steps per mm
Adjust based on your mechanical setup:
- **Belt drive (GT2)**: Usually 80-160 steps/mm
- **Lead screw (5mm pitch)**: Usually 400 steps/mm
- **Ball screw (5mm pitch)**: Usually 400 steps/mm

Calculate: `steps_per_mm = (motor_steps × microsteps) / (pulley_teeth × belt_pitch)`

#### Travel Limits
Set to match your machine's physical limits:
```yaml
max_travel_mm: 300.0  # X-axis travel in mm
```

#### Speeds and Acceleration
Start conservative and increase gradually:
- **max_rate_mm_per_min**: Maximum speed for rapids
- **acceleration_mm_per_sec2**: How quickly to reach max speed

### Spindle Configuration

#### PWM Frequency
Most spindles work well with 5kHz:
```yaml
pwm_hz: 5000
```

#### Speed Mapping
Configure for your spindle's speed range:
```yaml
speed_map: "0=0% 1000=10% 24000=100%"
```
This maps G-code `S1000` to 10% PWM and `S24000` to 100% PWM.

### Pin Modifications

#### Different Board Layout
If using a different ESP32 board, adjust pins accordingly:
- Check your board's pinout diagram
- Avoid pins 6-11 (usually connected to flash)
- Use input-only pins (34, 35, 36, 39) only for inputs

#### Driver-Specific Settings
For TMC drivers with UART control, you can add:
```yaml
motor0:
  step_pin: "gpio.2"
  direction_pin: "gpio.5"
  disable_pin: "gpio.8"
  tmc_2208:
    uart:
      txd_pin: "gpio.21"
      rxd_pin: "gpio.22"
      baud: 115200
      addr: 0
    run_amps: 1.0
    hold_amps: 0.5
    microsteps: 16
    stallguard_threshold: 75
```

## Wiring Notes

### Power Supply
- **24V recommended** for most stepper drivers
- **Separate supplies**: Use different supplies for motors and ESP32
- **Common ground**: Connect all grounds together

### Stepper Drivers
- **Enable pin**: Active low (pulled low to enable)
- **Step pin**: Rising edge triggered
- **Direction pin**: High/low for direction

### Limit Switches
- **Normally open**: Configure as normally open switches
- **Pull-up resistors**: Enabled in software (no external resistors needed)
- **Wiring**: One side to pin, other to ground

## Testing Procedure

### 1. Basic Connectivity
```gcode
$I        ; Check board info
$$        ; Show all settings
$X        ; Clear any alarms
```

### 2. Motor Testing
Test each axis individually:
```gcode
G91       ; Relative positioning
G0 X10    ; Move X axis 10mm
G0 Y10    ; Move Y axis 10mm
G0 Z5     ; Move Z axis 5mm
```

### 3. Homing Test
```gcode
$H        ; Home all axes
$?        ; Check status
```

### 4. Spindle Test
```gcode
M3 S1000  ; Start spindle at low speed
M5        ; Stop spindle
```

## Common Issues

### Motors Running Backward
Swap the direction pin logic:
```yaml
direction_pin: "!gpio.5"  # Add ! to invert
```

### Wrong Homing Direction
Change the homing direction:
```yaml
homing:
  positive_direction: true  # Change to false or vice versa
```

### Incorrect Steps per mm
Measure actual movement and adjust:
1. Command 100mm movement
2. Measure actual distance
3. Calculate: `new_steps = old_steps × (commanded / actual)`

## Next Steps

- **[4-Axis Mill](./4axis-mill.md)** - Add a rotary axis
- **[Expert Editor](../features/expert-editor.md)** - Fine-tune your configuration
- **[Troubleshooting](../troubleshooting/index.md)** - Solve common problems

This configuration provides a solid foundation for most 3-axis CNC routers. Adjust the mechanical settings and pin assignments to match your specific setup! 🚀