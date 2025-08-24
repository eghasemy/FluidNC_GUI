---
sidebar_position: 3
---

# Pin Mapper

The Pin Mapper provides visual pin conflict detection and management, making it easy to assign GPIO pins without conflicts and understand your board's capabilities.

## Overview

The Pin Mapper offers:
- **Visual pin status** - See all pin assignments at a glance
- **Conflict detection** - Real-time validation of pin assignments
- **Board awareness** - Understands pin capabilities and limitations  
- **Interactive assignment** - Click to assign or change pins
- **Status indicators** - Color-coded pin availability

## Key Features

### 🎯 **Visual Pin Status**
- 🟢 **Available**: Pin is free and can be assigned
- 🟡 **In Use**: Pin is assigned to a function
- 🔴 **Conflict**: Pin is assigned to multiple functions
- ❌ **Invalid**: Pin cannot be used for this function

### 🔍 **Smart Validation**
- Board-specific pin capabilities
- Input-only pin detection
- Reserved pin warnings
- Current capacity checking

### 📌 **Interactive Management**
- Click pins to assign/reassign
- Drag-and-drop pin assignments
- Bulk pin operations
- Conflict resolution suggestions

## How It Works

### Pin Status Detection
The Pin Mapper automatically analyzes your configuration:

1. **Scans all sections** for pin assignments
2. **Identifies conflicts** between functions
3. **Checks board compatibility** for each assignment
4. **Provides visual feedback** through color coding

### Board Integration
Understands board-specific limitations:
- **Input-only pins** (GPIO 34, 35, 36, 39 on ESP32)
- **Flash memory pins** (GPIO 6-11 on ESP32)
- **Strapping pins** with boot-time considerations
- **Current limitations** for motor drivers

## Using the Pin Mapper

![Pin Mapper Interface](/img/screenshots/pin-mapper-interface.png)

The Pin Mapper provides a visual representation of your ESP32 board with real-time pin status and conflict detection.

### Accessing Pin Mapper
1. **Open any configuration** in FluidNC GUI
2. **Navigate to Pin Mapper** from main menu
3. **View current pin assignments** in visual layout

### Reading Pin Status
- **Pin numbers** clearly labeled on board diagram
- **Color indicators** show current status
- **Hover for details** about pin capabilities
- **Click for assignment** options

![Pin Status Legend](/img/screenshots/pin-mapper-interface.png)

The visual legend helps you quickly understand each pin's current state and availability.

### Resolving Conflicts
1. **Identify red pins** indicating conflicts
2. **Click conflicted pin** to see assignment details
3. **Choose which function** to reassign
4. **Select new pin** from available options

## Board Support

### ESP32 Standard
- **38 GPIO pins** with full capability mapping
- **Input-only detection** for ADC pins
- **Flash pin warnings** for GPIO 6-11
- **Strapping pin notices** for boot considerations

### ESP32-S2/S3
- **Extended pin count** with board-specific layouts
- **USB pins** marked as reserved when applicable
- **Built-in LED** pins identified
- **Board variant** specific capabilities

### Custom Boards
- **Generic ESP32** pin mapping as fallback
- **Customizable layouts** for specialized boards
- **Community-contributed** board definitions

## Advanced Features

### Pin Groups
Manage related pins together:
- **Motor pin groups** (step, direction, enable)
- **Axis limit groups** (min, max limits)
- **Communication groups** (UART, SPI, I2C)

### Assignment Suggestions
Smart recommendations for pin assignments:
- **Logical grouping** of related functions
- **Electrical considerations** for high-current pins
- **Interference avoidance** for sensitive signals
- **Future expansion** planning

### Conflict Resolution
Automated conflict resolution:
- **Alternative pin suggestions**
- **Function priority** recommendations
- **Batch reassignment** for multiple conflicts
- **Undo/redo** for assignment changes

## Best Practices

### Pin Planning Strategy
1. **Start with critical functions** (motors, safety)
2. **Group related pins** physically close
3. **Reserve pins** for future expansion
4. **Avoid sensitive pins** for high-frequency signals

### Using Pin Mapper Effectively
- **Review entire layout** before finalizing
- **Use suggestions** for optimal assignments
- **Test incrementally** after major changes
- **Document custom** pin choices

### Troubleshooting with Pin Mapper
- **Visual conflict identification**
- **Board limitation** understanding
- **Assignment validation** before hardware testing
- **Change tracking** for configuration debugging

## Integration with Other Features

### Wizard Mode
- **Automatic validation** during wizard steps
- **Real-time feedback** on pin selections
- **Conflict prevention** before completion

### Expert Editor
- **Visual representation** of configuration pins
- **Click-to-edit** pin assignments
- **Immediate validation** of changes

## Common Scenarios

### New Configuration
1. **Start with motor pins** - most critical
2. **Add limit switches** - safety functions
3. **Configure spindle** - tool control
4. **Add optional I/O** - convenience features

### Troubleshooting Existing
1. **Import configuration** to Pin Mapper
2. **Identify conflicts** visually
3. **Resolve systematically** starting with critical functions
4. **Validate** entire configuration

### Board Migration
1. **Load configuration** for old board
2. **Select new board type**
3. **Review pin compatibility** warnings
4. **Reassign incompatible** pins

## Error Prevention

### Common Mistakes
- **Using input-only pins** for outputs
- **Conflicting pin assignments**
- **Ignoring board limitations**
- **Poor pin grouping**

### Prevention Strategies
- **Use Pin Mapper validation** before deployment
- **Follow board documentation**
- **Test configurations** incrementally
- **Keep backup configurations**

## Performance Tips

### Large Configurations
- **Group pins efficiently** for better performance
- **Use search functionality** to find specific pins
- **Close unused sections** to improve responsiveness

### Real-time Updates
- **Immediate validation** during editing
- **Efficient conflict detection** algorithms
- **Minimal UI updates** for smooth experience

## Future Enhancements

### Planned Features
- **3D board visualization**
- **Advanced routing suggestions**
- **Pin capability** detailed views
- **Export pin diagrams**

### Community Contributions
- **Additional board support**
- **Pin assignment templates**
- **Best practice guides**
- **Troubleshooting scenarios**

## Next Steps

Master pin management with:
- **[Wizard Mode](./wizard.md)** - Guided pin assignment
- **[Expert Editor](./expert-editor.md)** - Advanced configuration
- **[Troubleshooting](../troubleshooting/pin-conflicts.md)** - Conflict resolution

The Pin Mapper makes pin assignment visual and error-free. Never worry about pin conflicts again! 📌