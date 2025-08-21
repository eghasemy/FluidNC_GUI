---
sidebar_position: 2
---

# Expert Editor

The Expert Editor provides direct access to the complete FluidNC configuration structure through an intuitive tree-based interface. Perfect for advanced users who need full control over their configuration.

## Overview

The Expert Editor offers:
- **Complete configuration access** - Edit any FluidNC setting
- **Tree-based navigation** - Hierarchical view of configuration structure
- **Schema-driven forms** - Intelligent input types based on field context
- **Real-time validation** - Immediate feedback on configuration validity
- **Import/Export** - YAML and JSON file handling

## Key Features

### 🌳 **Tree Navigation**
- Expandable/collapsible configuration sections
- Click any node to edit its properties
- Visual indicators for selected paths
- Add/remove configuration keys dynamically

### 📝 **Smart Forms**
- Context-aware input types (GPIO pins, speeds, etc.)
- Automatic type detection and validation
- Dropdown selections for enumerated values
- Boolean toggles for true/false settings

### ✅ **Real-time Validation**
- Zod schema integration ensures correctness
- Immediate error highlighting
- Helpful error messages with suggestions
- Type safety throughout the editing process

### 🔄 **Import/Export Capabilities**
- YAML file import with legacy conversion
- JSON export for programmatic use
- Sample configuration loading
- Backup and restore functionality

## Getting Started

### Accessing Expert Mode
1. **Open FluidNC GUI** in your browser
2. **Click "Expert Editor"** on the main page
3. **Start with sample config** or import existing file

### Navigation Basics
- **Click tree nodes** to select configuration sections
- **Use + buttons** to add new properties
- **Use - buttons** to remove unwanted properties
- **Expand/collapse** sections with arrow icons

## Interface Layout

### Tree Panel (Left)
- Hierarchical configuration structure
- Expandable sections and subsections
- Visual selection indicators
- Add/remove key buttons

### Form Panel (Right)
- Dynamic forms based on selected tree node
- Context-appropriate input types
- Validation feedback and error messages
- Value modification controls

### Action Bar (Top)
- Import/Export buttons
- Sample configuration loader
- Validation status indicator
- Save/reset controls

## Advanced Features

### Schema-Driven Intelligence
The Expert Editor understands FluidNC configuration structure:

```yaml
# Automatically detects GPIO pin fields
step_pin: "gpio.2"    # Shows GPIO pin selector

# Recognizes speed/acceleration fields  
max_rate_mm_per_min: 5000    # Shows numeric input with units

# Provides dropdown for enums
run_mode: "StealthChop"      # Shows TMC mode selector
```

### Dynamic Key Management
- **Add custom properties** not defined in base schema
- **Support for unknown keys** via catchall validation
- **JSON value parsing** for complex custom data
- **Property deletion** with confirmation

### Import/Export Features
- **Legacy configuration import** with automatic conversion
- **YAML export** with proper formatting and comments
- **JSON export** for programmatic processing
- **Sample configurations** for quick starting points

## Common Use Cases

### Fine-Tuning Existing Configs
- Load configuration from Wizard
- Navigate to specific sections needing adjustment
- Make precise modifications to individual values
- Export updated configuration

### Advanced Feature Configuration
- TMC driver detailed settings
- Complex spindle speed mapping
- Multi-motor axis configuration
- Custom macro definitions

### Legacy Configuration Migration
- Import old FluidNC YAML files
- Review automatic conversions
- Make manual adjustments where needed
- Export in modern format

## Tips for Effective Use

### Organization Strategy
- **Start with major sections** (axes, spindle, etc.)
- **Work systematically** through each area
- **Use meaningful names** for custom properties
- **Group related settings** together

### Validation Workflow
- **Check validation status** frequently
- **Address errors immediately** before continuing
- **Use schema hints** for proper value formats
- **Test with sample values** when unsure

### Backup Strategy
- **Export frequently** during editing sessions
- **Keep backups** of working configurations
- **Use version control** for complex projects
- **Document changes** in configuration comments

## Error Handling

### Common Validation Errors
- **Type mismatches**: Wrong data type for field
- **Range violations**: Values outside acceptable limits
- **Required fields**: Missing mandatory configuration
- **Pin conflicts**: Duplicate GPIO assignments

### Resolution Strategies
- **Read error messages** carefully for specific guidance
- **Check field requirements** in schema tooltips
- **Refer to working examples** from recipes
- **Use Pin Mapper** for pin conflict resolution

## Best Practices

### Configuration Management
- **Start simple** and add complexity gradually
- **Test incrementally** after major changes
- **Document custom modifications**
- **Keep configuration organized** and well-structured

### Performance Optimization
- **Close unused tree sections** for large configurations
- **Use search functionality** to find specific settings
- **Export smaller sections** if performance issues occur
- **Clear browser cache** if interface becomes sluggish

## Integration with Other Features

### Wizard Mode Integration
- **Import Wizard results** for further refinement
- **Switch seamlessly** between modes
- **Preserve all Wizard settings** during transition

### Pin Mapper Integration
- **Visual pin conflict detection**
- **Click-to-edit** pin assignments
- **Board-specific validation**
- **Real-time conflict resolution**

## Next Steps

After mastering the Expert Editor:
- **[Pin Mapper](./pin-mapper.md)** - Visual pin management
- **[Import/Export](./import-export.md)** - File handling details  
- **[Troubleshooting](../troubleshooting/index.md)** - Common issues and solutions

The Expert Editor provides unlimited flexibility for FluidNC configuration. With practice, you can efficiently manage even the most complex machine setups! 🔧