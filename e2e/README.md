# Playwright End-to-End Tests

This directory contains Playwright E2E tests for the FluidNC GUI application.

## Test Coverage

### Wizard Flow Tests
- Complete wizard navigation
- Form validation
- Configuration export

### Import/Expert/Export Tests  
- Configuration import
- Expert editor functionality
- Export from expert mode

### Device Validation Tests
- Mock device connection
- Configuration upload
- Validation result parsing

## Running Tests

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test wizard.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

## Test Structure

Tests are organized by feature area:
- `wizard.spec.ts` - Wizard flow E2E tests
- `expert-editor.spec.ts` - Expert editor functionality tests
- `device-validation.spec.ts` - Device validation mock tests
- `fixtures/` - Test data and configuration files
- `utils/` - Shared test utilities