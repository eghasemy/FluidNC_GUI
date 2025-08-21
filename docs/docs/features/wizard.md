---
sidebar_position: 1
---

# Wizard Mode

The FluidNC GUI Wizard provides a step-by-step guided process for creating configurations. Perfect for beginners who want to get up and running quickly.

## Overview

The Wizard mode breaks down the complex process of FluidNC configuration into manageable steps:

1. **Machine Information** - Basic details about your machine
2. **Mechanics Setup** - Workspace and movement parameters  
3. **Motor Configuration** - Stepper motor settings and pin assignments
4. **Homing Setup** - Limit switches and homing sequences
5. **Spindle/Laser** - Tool control configuration
6. **I/O Configuration** - Additional inputs and outputs
7. **UART Setup** - Serial communication channels
8. **Macros** - Custom G-code macros and startup sequences
9. **SD Card** - External storage configuration
10. **Review & Export** - Final validation and file generation

## Key Features

### 🎯 **Guided Process**
- Clear instructions at each step
- Helpful tooltips and examples
- No need to understand YAML syntax

### ✅ **Built-in Validation**
- Real-time pin conflict detection
- Board-specific pin validation
- Range checking for speeds and accelerations

### 🔧 **Smart Defaults**
- Pre-filled common values
- Board-specific recommendations
- Industry-standard settings

### 📋 **Progress Tracking**
- Visual step indicator
- Ability to go back and modify earlier steps
- Save progress automatically

## Getting Started

1. **Access FluidNC GUI** in your browser
2. **Click "Start Wizard"** on the main page
3. **Follow the step-by-step process**
4. **Export your configuration** when complete

## Step Details

### Machine Information
- Machine name and description
- Board type selection
- FluidNC version compatibility

### Mechanics Setup  
- Machine type (router, laser, mill, etc.)
- Workspace dimensions
- Unit selection (mm or inches)
- Coordinate system orientation

### Motor Configuration
- Steps per mm calculation
- Speed and acceleration limits
- Pin assignments with conflict detection
- Enable pin configuration

### Advanced Features
The Wizard also supports advanced features when needed:
- Multiple motors per axis
- TMC driver configuration
- Custom speed mapping
- Complex homing sequences

## Tips for Success

### Before You Start
- Have your board pinout documentation ready
- Know your mechanical specifications
- Gather motor and driver specifications

### During Configuration
- Take your time at each step
- Use the help tooltips for guidance
- Test pin assignments as you go

### After Completion
- Export and save your configuration file
- Test with simple movements first
- Keep notes on any adjustments needed

## Next Steps

Once you've completed the Wizard:
- **[Expert Editor](./expert-editor.md)** - For advanced tweaking
- **[Pin Mapper](./pin-mapper.md)** - Visual pin management
- **[Recipes](../recipes/index.md)** - Example configurations

The Wizard mode is the fastest way to create a working FluidNC configuration. Most users can complete a basic setup in under 10 minutes! 🚀