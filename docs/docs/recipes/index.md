---
sidebar_position: 1
---

# Configuration Recipes

Ready-to-use FluidNC configurations for common machine types. These recipes provide working starting points that you can customize for your specific setup.

## Quick Recipe Guide

Each recipe includes:
- **Complete YAML configuration**
- **Pin assignments** for common boards
- **Recommended settings** for motors and speeds
- **Customization tips** for your specific needs

## Popular Recipes

### 🔧 CNC Routers
Perfect for woodworking, aluminum cutting, and general machining:

- **[Basic 3-Axis Router](./basic-3axis-router.md)** - Most common setup
- **[4-Axis Mill](./4axis-mill.md)** - With rotary axis
- **[Custom Board Setup](./custom-board.md)** - For specialized boards

### ⚡ Laser Engravers
Configured for laser cutting and engraving:

- **[Laser Engraver](./laser-engraver.md)** - CO2 or diode laser setup

## How to Use Recipes

### Method 1: Copy Configuration
1. **Choose a recipe** that matches your machine type
2. **Copy the YAML** configuration from the recipe
3. **Import in FluidNC GUI** using the Expert Editor
4. **Customize pins** and settings for your board

### Method 2: Follow the Guide
1. **Start the Wizard** in FluidNC GUI
2. **Use recipe values** as you go through each step
3. **Reference pin assignments** from the recipe
4. **Adjust for your specific hardware**

## Customization Tips

### Pin Assignments
- **Check your board pinout** before using any recipe
- **Modify pin numbers** to match your wiring
- **Avoid pin conflicts** - the GUI will warn you

### Motor Settings
- **Steps per mm**: Depends on your mechanical setup
- **Max speeds**: Start conservative, increase gradually
- **Acceleration**: Tune for smooth movement without stalling

### Speeds and Feeds
- **Start slow**: Begin with lower speeds for testing
- **Increase gradually**: Find the limits of your machine
- **Document changes**: Keep notes on what works

## Contributing Recipes

Have a working configuration for a unique setup? We'd love to add it!

1. **Test thoroughly** - Ensure your config works reliably
2. **Document clearly** - Include board type, wiring notes
3. **Submit via GitHub** - Create a pull request or issue

## Board-Specific Notes

### ESP32 Standard Boards
- **Pins 6-11**: Usually connected to flash memory (avoid)
- **Input-only pins**: 34, 35, 36, 39 (can't be outputs)
- **ADC2 pins**: May conflict with WiFi

### ESP32-S2/S3 Boards
- **Different pinout**: Check your specific board datasheet
- **More available pins**: Generally more I/O options
- **Built-in features**: Some have built-in displays or WiFi antennas

## Safety Reminders

⚠️ **Always verify configurations before use:**

- **Double-check pin assignments** against your board
- **Test at low speeds** initially
- **Verify emergency stop** works before operation
- **Check homing direction** to avoid crashes

## Need Help?

- **[Troubleshooting](../troubleshooting/index.md)** - Common configuration issues
- **[Pin Conflicts](../troubleshooting/pin-conflicts.md)** - Resolving pin assignment problems
- **[GitHub Issues](https://github.com/eghasemy/FluidNC_GUI/issues)** - Report problems or request new recipes

Ready to build your configuration? Choose a recipe below! 🚀