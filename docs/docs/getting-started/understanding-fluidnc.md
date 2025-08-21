---
sidebar_position: 4
---

# Understanding FluidNC

Before diving deeper into configuration, it's helpful to understand the key concepts behind FluidNC and how this GUI helps you work with them.

## What is FluidNC?

FluidNC is a modern CNC firmware for ESP32 microcontrollers that provides:

- **Grbl compatibility** - Works with existing G-code senders
- **WiFi & Bluetooth** - Wireless operation and setup
- **Flexible I/O** - Configure any GPIO pin for any function
- **Multiple machine types** - Routers, lasers, plasma cutters, and more
- **Advanced features** - Probe cycles, tool changes, macros

## Key Configuration Concepts

### Board Descriptors
FluidNC GUI includes board descriptors that define:
- **Available pins** and their capabilities
- **Hardware limitations** (analog, PWM, input-only pins)
- **Common pin assignments** for popular boards

This prevents you from assigning incompatible pins and provides helpful suggestions.

### Pin Assignments
Every function in FluidNC needs a GPIO pin:
- **Motors**: Step, direction, and enable pins
- **Limits**: Homing and safety switches
- **Spindle**: Speed (PWM), enable, and direction
- **I/O**: Probe, coolant, user outputs

The GUI validates all pin assignments to prevent conflicts.

### Coordinate Systems
FluidNC uses standard CNC coordinate systems:
- **Machine coordinates**: Absolute position from machine zero
- **Work coordinates**: Relative to your workpiece zero
- **Homing**: Process of finding machine zero reference

### Configuration Structure
FluidNC configs are organized hierarchically:

```yaml
name: "My Machine"
board: "ESP32"
axes:
  x:
    steps_per_mm: 80
    max_rate_mm_per_min: 5000
    motor0:
      step_pin: gpio.2
      direction_pin: gpio.5
```

## FluidNC GUI Modes

### Wizard Mode
Perfect for beginners:
- **Guided process** through each configuration step
- **Built-in validation** prevents common mistakes
- **Sensible defaults** for most machine types
- **Pin conflict detection** as you assign pins

### Expert Mode
For advanced users:
- **Tree-based editor** shows full configuration structure
- **Direct editing** of any configuration property
- **Schema validation** ensures correctness
- **Import/export** in YAML and JSON formats

## Common Configuration Patterns

### Basic Machine Setup
1. **Machine properties**: Name, board type, version
2. **Axes configuration**: Steps, speeds, acceleration
3. **Motor assignments**: Step, direction, enable pins
4. **Homing setup**: Limit switches and homing sequence
5. **Spindle/laser**: Speed control and enable pins
6. **I/O configuration**: Probe, coolant, emergency stop

### Pin Assignment Strategy
- **Group related pins**: Keep motor pins together
- **Avoid conflicts**: Each pin used only once
- **Use capabilities**: PWM pins for spindle speed, etc.
- **Plan for expansion**: Leave pins available for future features

## Configuration Validation

The GUI provides multiple layers of validation:

### Real-time Validation
- **Pin conflicts**: Immediate feedback when pins conflict
- **Board compatibility**: Warnings for incompatible pin assignments
- **Value ranges**: Ensures reasonable values for speeds, accelerations

### Schema Validation
- **Required fields**: Ensures all necessary settings are present
- **Data types**: Validates numbers, strings, booleans
- **Enum values**: Restricts choices to valid options

### Hardware Validation
- **Pin capabilities**: Prevents using input-only pins for outputs
- **Electrical limits**: Warns about current/voltage limitations
- **Board-specific rules**: ESP32-specific pin restrictions

## Best Practices

### Starting Configuration
1. **Begin simple**: Start with basic 3-axis setup
2. **Test incrementally**: Verify each axis before adding complexity
3. **Document changes**: Keep notes on what you modify
4. **Backup configs**: Export working configurations

### Pin Planning
1. **Read your board docs**: Understand pin limitations
2. **Plan the layout**: Sketch pin assignments before configuring
3. **Group functions**: Keep related pins physically close
4. **Reserve pins**: Leave some available for future additions

### Testing Strategy
1. **Check basics first**: Power, communication, basic movement
2. **One axis at a time**: Verify each axis individually
3. **Slow and careful**: Start with low speeds and accelerations
4. **Safety first**: Always test emergency stop

## Next Steps

Now that you understand the fundamentals:

- **[Try the Recipes](../recipes/index.md)** for example configurations
- **[Explore the Expert Editor](../features/expert-editor.md)** for advanced editing
- **[Learn about Pin Mapping](../features/pin-mapper.md)** for complex setups

## Resources

- **[FluidNC Wiki](https://github.com/bdring/FluidNC/wiki)** - Official documentation
- **[FluidNC Discussions](https://github.com/bdring/FluidNC/discussions)** - Community support
- **[ESP32 Pin Reference](https://randomnerdtutorials.com/esp32-pinout-reference-gpios/)** - Hardware details