# Expert Editor Documentation

## Overview

The Expert Editor provides a comprehensive tree-based interface for editing FluidNC configurations with schema-driven forms. It allows users to edit any configuration key, including those not explicitly defined in the Zod schemas through the `catchall(z.unknown())` functionality.

## Features

### 🌳 Tree Navigation
- **Hierarchical View**: Display configuration structure in an expandable tree format
- **Path Selection**: Click any node to select and edit its properties
- **Visual Indicators**: Selected nodes are highlighted with distinct styling
- **Expand/Collapse**: Toggle visibility of nested structures

### 📝 Schema-Driven Forms
- **Type Detection**: Automatically detect field types (string, number, boolean, objects)
- **Smart Fields**: Context-aware input types for common FluidNC fields:
  - GPIO pins (e.g., `gpio.1`, `gpio.2`)
  - Rates in mm/min
  - Accelerations in mm/sec²
  - TMC driver modes (StealthChop, CoolStep, StallGuard)
  - Boolean toggles for direction and enable settings

### ➕ Dynamic Key Management
- **Add Properties**: Create new configuration keys at any level
- **Delete Keys**: Remove unwanted configuration properties
- **Unknown Keys**: Support for arbitrary key-value pairs beyond the schema
- **JSON Values**: Parse complex values as JSON when possible

### 🔄 Import/Export
- **YAML Export**: Download configuration as YAML file
- **JSON Export**: Download configuration as JSON file
- **YAML Import**: Load configuration from YAML file
- **Sample Config**: Load a pre-configured example for testing

### ✅ Real-time Validation
- **Zod Integration**: Uses existing FluidNC schemas for validation
- **Error Display**: Shows validation errors in real-time
- **Type Safety**: Maintains TypeScript type safety throughout

## Usage

### Accessing Expert Mode
1. Start the FluidNC GUI application
2. Click "Go to Expert Editor" from the main navigation
3. Or click "Switch to Expert Editor" from the Wizard mode

### Navigating the Tree
1. **Root Level**: Shows top-level configuration keys (name, board, axes, etc.)
2. **Expand Nodes**: Click the ▶ triangle to expand nested objects
3. **Select for Editing**: Click any node label to select it for editing
4. **Add Root Keys**: Use the "+ Add Root Key" button in the tree header

### Editing Values
1. **Simple Values**: Select a leaf node to edit its value directly
2. **Objects**: Select an object node to add/remove properties
3. **Type Detection**: Fields automatically adapt based on the key name and current value type
4. **Validation**: See real-time validation feedback

### Managing Configuration
1. **Sample Config**: Load a complete example configuration
2. **Export**: Save your configuration as YAML or JSON
3. **Import**: Load an existing YAML configuration
4. **Add Properties**: Create custom configuration keys

## Component Architecture

### `ExpertEditor` (Main Container)
```tsx
<ExpertEditor 
  config={config}
  onConfigChange={handleConfigChange}
  onValidationChange={handleValidation}
/>
```

### `ConfigTree` (Navigation)
- Renders hierarchical tree structure
- Handles node expansion/collapse
- Manages path selection
- Supports adding new root keys

### `ConfigForm` (Editing)
- Dynamic form generation based on selected path
- Handles value updates with type conversion
- Supports adding/removing object properties
- Shows validation errors

### `SchemaField` (Smart Fields)
- Context-aware input rendering
- Type detection and conversion
- Field-specific help text and validation
- Support for enums and boolean toggles

### `ConfigActions` (Import/Export)
- YAML/JSON export functionality
- File import with error handling
- Sample configuration loading
- Download file generation

## Styling and Responsiveness

### Desktop Layout
- **Two-column grid**: Tree navigation (1fr) + Form editing (2fr)
- **Action bar**: Configuration management buttons at the top
- **Consistent spacing**: 20-30px gaps between major sections

### Mobile Layout
- **Single column**: Stacked tree and form vertically
- **Full-width buttons**: Action buttons stack vertically
- **Touch-friendly**: Larger tap targets for mobile devices

### Dark Mode Support
- **Automatic detection**: Uses `prefers-color-scheme: dark`
- **Complete coverage**: All components support dark theme
- **Consistent colors**: Maintains visual hierarchy in both modes

## Integration with Existing Code

The Expert Editor seamlessly integrates with the existing FluidNC GUI:

1. **Shared Schemas**: Uses the same Zod schemas from `@fluidnc-gui/core`
2. **Type Safety**: Maintains full TypeScript compatibility
3. **Validation**: Leverages existing validation functions
4. **Configuration Format**: Works with the same `FluidNCConfig` interface

## Examples

### Adding a Custom Motor Setting
1. Navigate to `axes → x → motor0`
2. Click "+ Add Property"
3. Enter key: `custom_current_limit`
4. Enter value: `2.5`
5. The field automatically detects this as a number

### Importing a Configuration
1. Click "Import YAML" in the action bar
2. Select your `.yaml` configuration file
3. The tree automatically updates with the loaded configuration
4. Edit any values using the tree navigation

### Exporting Your Work
1. Click "Export YAML" to download your configuration
2. Use this file with FluidNC firmware
3. Or share configurations with other users

## Technical Implementation

### Path Navigation
The editor uses string arrays to represent paths through the configuration:
```typescript
// Editing axes.x.motor0.step_pin
selectedPath = ['axes', 'x', 'motor0', 'step_pin']
```

### Type Detection
Smart field detection based on key names:
```typescript
if (fieldName.includes('pin')) return 'GPIO pin (e.g., gpio.1)';
if (fieldName.includes('rate')) return 'Rate in mm/min';
// ... etc
```

### Value Updates
Immutable updates using path-based value setting:
```typescript
const newConfig = setValueAtPath(config, selectedPath, newValue);
onConfigChange(newConfig);
```

This ensures React state updates properly trigger re-renders and maintain data consistency.