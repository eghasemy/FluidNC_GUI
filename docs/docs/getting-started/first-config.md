---
sidebar_position: 3
---

# Create Your First Config (Under 10 Minutes!)

This guide will walk you through creating a complete FluidNC configuration in under 10 minutes using the Wizard mode.

## What We'll Build

A basic 3-axis CNC router configuration with:
- **3 stepper motors** (X, Y, Z axes)
- **Homing switches** on all axes
- **Spindle control** (PWM speed + direction)
- **Emergency stop** and **probe** inputs

## Step 1: Start the Wizard (30 seconds)

1. **Open FluidNC GUI** in your browser
2. **Click "Start Wizard"** on the main page
3. **Enter basic information**:
   - Machine name: `"My CNC Router"`
   - Board: Select `"ESP32"` (or your specific board)
   - Version: Keep default `"3.7"`

## Step 2: Configure Machine Type (1 minute)

1. **Select machine type**: Choose `"CNC Router"`
2. **Set workspace size**:
   - X: `300mm` (adjust for your machine)
   - Y: `200mm`
   - Z: `100mm`
3. **Units**: Select `"mm"` (or inches if preferred)

## Step 3: Motor Configuration (3 minutes)

For each axis (X, Y, Z):

### X-Axis Motor:
- **Steps per mm**: `80` (common for GT2 belts with 1.8° steppers)
- **Max speed**: `5000 mm/min`
- **Acceleration**: `500 mm/sec²`
- **Step pin**: `gpio.2`
- **Direction pin**: `gpio.5`
- **Enable pin**: `gpio.8` (shared for all motors)

### Y-Axis Motor:
- **Steps per mm**: `80`
- **Max speed**: `5000 mm/min`
- **Acceleration**: `500 mm/sec²`
- **Step pin**: `gpio.3`
- **Direction pin**: `gpio.6`
- **Enable pin**: `gpio.8`

### Z-Axis Motor:
- **Steps per mm**: `400` (common for leadscrew)
- **Max speed**: `2000 mm/min`
- **Acceleration**: `200 mm/sec²`
- **Step pin**: `gpio.4`
- **Direction pin**: `gpio.7`
- **Enable pin**: `gpio.8`

:::tip Pin Validation
The GUI will automatically warn you if you try to use the same pin twice! Look for the colored indicators:
- 🟢 Green: Pin available
- 🟡 Yellow: Pin in use
- 🔴 Red: Pin conflict
:::

## Step 4: Homing Setup (2 minutes)

Configure limit switches for homing:

- **X-axis limit**: `gpio.9`
- **Y-axis limit**: `gpio.10`
- **Z-axis limit**: `gpio.11`
- **Homing sequence**: `1, 1, 2` (X&Y together, then Z)
- **Pull-up resistors**: ✅ Enabled

## Step 5: Spindle Configuration (1 minute)

Set up spindle control:

- **Type**: `PWM Spindle`
- **Output pin**: `gpio.12`
- **Enable pin**: `gpio.13`
- **Direction pin**: `gpio.14`
- **Max RPM**: `24000`
- **Min RPM**: `1000`

## Step 6: I/O and Safety (1 minute)

Configure essential I/O:

- **Probe pin**: `gpio.15`
- **Emergency stop**: `gpio.16`
- **Coolant flood**: `gpio.17` (optional)

## Step 7: Review and Export (1 minute)

1. **Review summary**: Check all your settings
2. **Validate configuration**: Look for any warnings or errors
3. **Export YAML**: Click "Export YAML" to download your config
4. **Save to file**: Name it something like `my-cnc-router.yaml`

## Step 8: Upload to FluidNC (30 seconds)

1. **Connect to your board** via USB or WiFi
2. **Upload the config file** using FluidNC's web interface or SD card
3. **Restart your board**
4. **Test basic movement** with simple G-code commands

## Congratulations! 🎉

You've just created a complete FluidNC configuration in under 10 minutes!

## What's Next?

### Fine-tune Your Configuration
- **Test each axis** individually
- **Adjust steps/mm** for accuracy
- **Tune acceleration** for smooth movement
- **Set soft limits** for safety

### Explore Advanced Features
- **[Expert Editor](../features/expert-editor.md)** for detailed tweaking
- **[Recipes](../recipes/index.md)** for other machine types
- **[Pin Mapper](../features/pin-mapper.md)** for complex pin layouts

### Common Adjustments
- **Steps per mm too high/low**: Measure actual movement vs. commanded
- **Motors running backward**: Swap direction pin logic or wiring
- **Homing in wrong direction**: Adjust homing direction settings

## Need Help?

- **[Common Issues](../troubleshooting/common-issues.md)** - Solutions to frequent problems
- **[Pin Conflicts](../troubleshooting/pin-conflicts.md)** - Resolving pin assignment issues
- **[FluidNC Docs](https://github.com/bdring/FluidNC/wiki)** - Official FluidNC documentation

Your machine should now be ready for basic operation! 🚀