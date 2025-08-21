# Playwright E2E Testing for FluidNC GUI

This document describes the comprehensive Playwright E2E test suite implemented for the FluidNC GUI application as part of [P8] requirements.

## Overview

The E2E test suite covers three main scenarios:
1. **Wizard → Export**: Complete wizard flow ending with configuration export
2. **Import → Expert → Export**: Configuration import, editing in expert mode, and re-export
3. **Device Validation Mock**: Mocked device connection and configuration validation

## Test Structure

### Test Files
- `wizard.spec.ts` - Wizard flow tests including navigation, validation, and export
- `expert-editor.spec.ts` - Expert editor functionality with import/export capabilities
- `device-validation.spec.ts` - Device connection and validation with comprehensive mocking
- `basic-app.spec.ts` - Basic application smoke tests

### Supporting Files
- `utils/helpers.ts` - Reusable test utilities and page object patterns
- `fixtures/test-configs.ts` - Test data, mock configurations, and sample responses

## Running Tests

### Prerequisites
```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install chromium

# Build packages (required before running E2E tests)
pnpm run build
```

### Running Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e wizard.spec.ts

# Run with UI (interactive mode)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug
```

### Environment Variables
```bash
# Skip specific browsers in CI
SKIP_FIREFOX=1 pnpm test:e2e
SKIP_WEBKIT=1 pnpm test:e2e

# CI mode (affects retries and parallelization)
CI=true pnpm test:e2e
```

## Test Coverage

### Wizard Flow Tests (`wizard.spec.ts`)
- ✅ Complete wizard navigation through all steps
- ✅ Form validation and error handling
- ✅ Step-by-step configuration building
- ✅ Export functionality verification
- ✅ Navigation between wizard steps
- ✅ Live YAML preview validation

### Expert Editor Tests (`expert-editor.spec.ts`)
- ✅ YAML configuration import
- ✅ Legacy configuration transformation
- ✅ Tree-based configuration editing
- ✅ Real-time validation
- ✅ YAML and JSON export
- ✅ Configuration diff viewing
- ✅ Dynamic key management

### Device Validation Tests (`device-validation.spec.ts`)
- ✅ Serial port connection mocking
- ✅ WiFi connection interface
- ✅ Configuration upload simulation
- ✅ Validation result parsing
- ✅ Error handling and recovery
- ✅ Connection state management

## Mock System

The test suite includes a comprehensive mocking system for device interactions:

### Serial Communication Mocks
```typescript
// Mock Tauri commands for device communication
await page.addInitScript(() => {
  (window as any).__TAURI__ = {
    invoke: async (command: string, args: any) => {
      switch (command) {
        case 'get_available_ports':
          return mockPorts;
        case 'connect_serial_port':
          return 'Connected';
        case 'send_serial_command':
          return mockDeviceResponse(args.command);
      }
    }
  };
});
```

### Device Response Simulation
The mock system simulates various device responses:
- Connection success/failure
- Configuration validation messages
- Error conditions
- Status updates

## Configuration Testing

### Test Configurations
The test suite includes several predefined configurations:
- Basic 3-axis CNC router
- Legacy configuration format
- Invalid configuration examples
- Simple test configurations

### Validation Testing
- ✅ Schema validation
- ✅ Cross-field validation
- ✅ Pin conflict detection
- ✅ Required field enforcement

## CI Integration

### GitHub Actions
The E2E tests are integrated into the CI pipeline:
```yaml
e2e-tests:
  runs-on: ubuntu-latest
  steps:
    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium
    - name: Run E2E tests
      run: pnpm test:e2e
    - name: Upload test results
      uses: actions/upload-artifact@v4
      with:
        name: e2e-test-results
        path: |
          test-results/
          playwright-report/
```

### Test Artifacts
- Test results (JSON/XML)
- HTML report
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging

## Best Practices

### Test Design
1. **Page Object Pattern**: Encapsulated in utility classes
2. **Flexible Selectors**: Tests adapt to UI changes
3. **Mock-First Approach**: External dependencies are mocked
4. **Retry Logic**: Built-in retry for flaky tests
5. **Parallel Execution**: Tests run in parallel where possible

### Maintenance
1. **Modular Utilities**: Reusable helpers for common operations
2. **Configuration-Driven**: Test data separated from test logic
3. **Environment Awareness**: Tests adapt to CI vs local environments
4. **Error Recovery**: Tests handle various application states

## Debugging

### Local Debugging
```bash
# Run with browser visible
pnpm test:e2e:headed

# Debug specific test
npx playwright test wizard.spec.ts --debug

# Generate test report
npx playwright show-report
```

### CI Debugging
1. Download test artifacts from GitHub Actions
2. View HTML report with screenshots and traces
3. Use trace viewer for step-by-step debugging

## Future Enhancements

### Potential Improvements
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Cross-platform testing (Windows, macOS)
- [ ] Mobile viewport testing
- [ ] API-level testing integration

### Test Coverage Expansion
- [ ] Advanced wizard scenarios
- [ ] Multi-spindle configurations
- [ ] Complex pin mapping scenarios
- [ ] Preset loading and modification
- [ ] Configuration sharing workflows

## Troubleshooting

### Common Issues
1. **Browser Installation**: Use `npx playwright install chromium`
2. **Dev Server Issues**: Ensure application builds successfully
3. **Port Conflicts**: Check if port 1420 is available
4. **Timeout Issues**: Increase timeouts in `playwright.config.ts`

### Environment Setup
Run the setup script to verify environment:
```bash
./scripts/test-setup.sh
```

This comprehensive E2E test suite ensures the FluidNC GUI application meets quality standards and provides confidence in releases.