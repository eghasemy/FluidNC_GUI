---
sidebar_position: 3
---

# Laser Engraver

A complete configuration for laser engraving and cutting machines. Optimized for both CO2 and diode laser setups with safety features.

## Machine Specifications

This recipe is designed for:
- **2-axis laser engraver** (X, Y movement)
- **Laser power control** via PWM
- **Homing switches** for accurate positioning
- **Safety features** for laser operation
- **ESP32** development board

## Complete Configuration

```yaml
name: "Laser Engraver"
board: "ESP32"
version: "3.7"

axes:
  x:
    steps_per_mm: 80.0
    max_rate_mm_per_min: 8000.0
    acceleration_mm_per_sec2: 800.0
    max_travel_mm: 400.0
    soft_limits: true
    homing:
      cycle: 1
      positive_direction: false
      mpos_mm: 0.0
      feed_mm_per_min: 2000.0
      seek_mm_per_min: 4000.0
    motor0:
      step_pin: "gpio.2"
      direction_pin: "gpio.5"
      disable_pin: "gpio.8"
    limit_neg_pin: "gpio.9"

  y:
    steps_per_mm: 80.0
    max_rate_mm_per_min: 8000.0
    acceleration_mm_per_sec2: 800.0
    max_travel_mm: 300.0
    soft_limits: true
    homing:
      cycle: 1
      positive_direction: false
      mpos_mm: 0.0
      feed_mm_per_min: 2000.0
      seek_mm_per_min: 4000.0
    motor0:
      step_pin: "gpio.3"
      direction_pin: "gpio.6"
      disable_pin: "gpio.8"
    limit_neg_pin: "gpio.10"

# Laser configured as spindle
spindle:
  laser:
    output_pin: "gpio.12"
    enable_pin: "gpio.13"
    disable_with_s0: true
    s0_with_disable: true
    tool_num: 0
    speed_map: "0=0% 1000=100%"
    pwm_hz: 5000

# Safety inputs
control:
  safety_door_pin: "gpio.16"
  reset_pin: "gpio.17"
  feed_hold_pin: "gpio.18"

# Air assist
coolant:
  flood_pin: "gpio.20"
```

## Pin Assignment Summary

| Function | GPIO Pin | Notes |
|----------|----------|-------|
| X Step | 2 | Step pulse for X motor |
| Y Step | 3 | Step pulse for Y motor |
| X Direction | 5 | Direction control for X motor |
| Y Direction | 6 | Direction control for Y motor |
| Motor Enable | 8 | Shared enable for both motors |
| X Limit | 9 | X-axis homing switch |
| Y Limit | 10 | Y-axis homing switch |
| Laser PWM | 12 | Laser power control (0-100%) |
| Laser Enable | 13 | Laser enable/safety |
| Safety Door | 16 | Lid interlock/emergency |
| Reset | 17 | Emergency reset |
| Feed Hold | 18 | Pause operation |
| Air Assist | 20 | Air pump for cutting |

## Laser Safety Features

### Software Safety
- **disable_with_s0**: Laser turns off when speed is 0
- **s0_with_disable**: Speed set to 0 when laser disabled
- **Safety door**: Immediately stops laser on lid open

### Hardware Safety
- **Enable pin**: Hardware laser disable
- **Interlock**: Safety door switch
- **Emergency stop**: Immediate shutdown

## Customization Guide

### Laser Power Control

#### PWM Frequency
Different lasers need different frequencies:
- **CO2 lasers**: 5-20 kHz
- **Diode lasers**: 1-5 kHz

```yaml
pwm_hz: 5000  # Adjust for your laser
```

#### Power Mapping
Configure power levels:
```yaml
speed_map: "0=0% 1000=100%"
```
This maps `S1000` in G-code to 100% laser power.

For more control:
```yaml
speed_map: "0=0% 100=10% 500=50% 1000=100%"
```

### Mechanical Settings

#### High-Speed Settings
Lasers can move faster than routers:
- **Max rate**: 8000+ mm/min typical
- **Acceleration**: 800+ mm/sec² typical
- **Jerk**: Often higher than milling machines

#### Belt-Driven Systems
Most laser engravers use belts:
```yaml
steps_per_mm: 80.0  # GT2 belt with 20-tooth pulley
```

### Different Laser Types

#### CO2 Laser Configuration
```yaml
spindle:
  laser:
    output_pin: "gpio.12"
    enable_pin: "gpio.13"
    disable_with_s0: true
    tool_num: 0
    speed_map: "0=0% 1000=100%"
    pwm_hz: 20000  # Higher frequency for CO2
```

#### Diode Laser Configuration
```yaml
spindle:
  laser:
    output_pin: "gpio.12"
    enable_pin: "gpio.13"
    disable_with_s0: true
    tool_num: 0
    speed_map: "0=0% 255=100%"  # Often use 0-255 range
    pwm_hz: 1000  # Lower frequency for diode
```

## G-code Usage

### Basic Laser Commands
```gcode
M3 S500   ; Turn on laser at 50% power
G1 X10 Y10 F1000  ; Cut/engrave move
M5        ; Turn off laser
```

### Engraving Example
```gcode
G90       ; Absolute positioning
G0 X0 Y0  ; Move to start position
M3 S200   ; Low power for engraving
G1 X50 Y0 F2000    ; Engrave line
G1 X50 Y10         ; Engrave line
G1 X0 Y10          ; Engrave line
G1 X0 Y0           ; Engrave line
M5        ; Turn off laser
```

### Cutting Example
```gcode
G90       ; Absolute positioning
G0 X5 Y5  ; Move to start position
M3 S800   ; High power for cutting
G1 X45 Y5 F500     ; Cut slow for thick material
G1 X45 Y25         ; Cut line
G1 X5 Y25          ; Cut line
G1 X5 Y5           ; Complete rectangle
M5        ; Turn off laser
```

## Safety Checklist

### Before Operation
- ✅ **Safety glasses**: Appropriate for your laser type
- ✅ **Ventilation**: Fume extraction working
- ✅ **Fire safety**: Fire extinguisher accessible
- ✅ **Material**: Non-toxic, laser-safe material
- ✅ **Focus**: Laser properly focused

### During Operation
- ✅ **Never leave unattended**: Always supervise operation
- ✅ **Monitor progress**: Watch for flare-ups or problems
- ✅ **Emergency stop**: Know how to quickly stop the laser

### Interlock Wiring
Wire safety door switch:
```
Safety Switch NO contacts:
  Pin 1 -> GPIO 16
  Pin 2 -> Ground
```

## Air Assist Setup

Air assist improves cut quality and safety:

### Configuration
```yaml
coolant:
  flood_pin: "gpio.20"  # Air pump control
```

### G-code Control
```gcode
M8    ; Turn on air assist
M3 S800  ; Start laser
; ... cutting moves ...
M5    ; Stop laser
M9    ; Turn off air assist
```

## Common Issues

### Laser Won't Fire
1. **Check enable pin**: Ensure laser enable is working
2. **Verify power**: Check PWM signal with multimeter
3. **Safety interlocks**: Ensure all safety switches closed

### Inconsistent Power
1. **PWM frequency**: Try different frequencies
2. **Speed mapping**: Verify power levels
3. **Power supply**: Check laser power supply stability

### Poor Cut Quality
1. **Focus**: Adjust laser focus
2. **Speed vs. power**: Balance cutting speed and power
3. **Air assist**: Ensure adequate airflow

## Material Guidelines

### Safe Materials
- ✅ **Wood**: Plywood, MDF, hardwoods
- ✅ **Acrylic**: Cast acrylic (not extruded)
- ✅ **Paper/Cardboard**: Most paper products
- ✅ **Fabric**: Cotton, leather (well-ventilated)

### NEVER Laser These Materials
- ❌ **PVC**: Produces toxic chlorine gas
- ❌ **Polycarbonate**: Produces toxic gases
- ❌ **ABS**: Produces toxic gases
- ❌ **Fiberglass**: Glass particles damage laser

## Next Steps

- **[Custom Board Setup](./custom-board.md)** - Advanced board configurations
- **[Expert Editor](../features/expert-editor.md)** - Fine-tune settings
- **[Pin Conflicts](../troubleshooting/pin-conflicts.md)** - Resolve wiring issues

This configuration provides a safe and effective setup for laser operations. Always prioritize safety when working with lasers! 🔥