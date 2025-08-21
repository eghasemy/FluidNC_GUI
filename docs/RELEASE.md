# Release Process for FluidNC GUI

This document outlines the release process for creating and publishing FluidNC GUI installers.

## Overview

FluidNC GUI uses automated release packaging that creates installers for Windows and Linux when a git tag is pushed to the repository.

## Supported Platforms

### Windows
- **Format**: `.msi` installer
- **Architecture**: x64
- **Installation**: Run the installer and follow the setup wizard

### Linux
- **Formats**: 
  - `.deb` package (Debian/Ubuntu)
  - `.rpm` package (RHEL/Fedora/SUSE)
- **Architecture**: x64 (amd64)
- **Installation**:
  - Debian/Ubuntu: `sudo dpkg -i FluidNC-GUI-Linux-x64.deb`
  - RPM-based: `sudo rpm -i FluidNC-GUI-Linux-x64.rpm`

## Creating a Release

### Automatic Release (Recommended)

1. **Create and push a git tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Monitor the release workflow**:
   - Go to Actions tab in GitHub
   - Watch the "Release" workflow complete
   - The workflow will create a draft release with installers

3. **Publish the release**:
   - Go to Releases page
   - Edit the draft release
   - Add release notes
   - Publish the release

### Manual Release (Alternative)

1. **Go to Actions tab in GitHub**
2. **Select "Release" workflow**
3. **Click "Run workflow"**
4. **Enter version** (e.g., v1.0.0)
5. **Click "Run workflow"**

## Release Workflow Details

The release process consists of three main jobs:

### 1. Create Release
- Creates a draft GitHub release
- Sets up upload URLs for artifacts

### 2. Build Windows
- Builds on Windows runner
- Installs dependencies (Node.js, pnpm, Rust)
- Builds the Tauri application
- Creates `.msi` installer
- Uploads to release

### 3. Build Linux  
- Builds on Ubuntu runner
- Installs system dependencies (WebKit, GTK, etc.)
- Builds the Tauri application
- Creates `.deb` and `.rpm` packages
- Uploads to release

### 4. Finalize Release
- Publishes the draft release
- Makes installers publicly available

## Build Dependencies

### Windows
- Node.js 20
- pnpm 10
- Rust (stable)
- Windows SDK (automatically available on GitHub runners)

### Linux (Ubuntu)
- Node.js 20
- pnpm 10  
- Rust (stable)
- System packages:
  - `libwebkit2gtk-4.1-dev`
  - `build-essential`
  - `curl`, `wget`, `file`
  - `libxdo-dev`
  - `libssl-dev`
  - `libayatana-appindicator3-dev`
  - `librsvg2-dev`
  - `libudev-dev`

## Version Management

The application version is controlled by:
- `apps/gui/src-tauri/tauri.conf.json` - Tauri configuration
- Git tags - Trigger releases and determine version numbers

To update the app version:
1. Update `version` in `apps/gui/src-tauri/tauri.conf.json`
2. Commit the change
3. Create a git tag with the new version
4. Push the tag to trigger release

## Troubleshooting

### Build Failures

**TypeScript compilation errors**: The release workflow bypasses TypeScript compilation for the frontend build using `build:frontend` instead of `build`. This allows releases even when there are strict TypeScript issues.

**Missing dependencies**: The workflow installs all required system dependencies. If builds fail, check that the dependency installation steps completed successfully.

**Rust compilation errors**: Ensure the Rust code compiles locally before creating a release. Run `pnpm --filter @fluidnc-gui/gui tauri build` locally to test.

### Release Issues

**Failed artifact upload**: Check that file paths in the workflow match the actual build output. File names may vary based on the version number.

**Permission errors**: Ensure the repository has proper access to create releases and upload artifacts.

## Manual Local Building

To test the build process locally:

```bash
# Install dependencies
pnpm install

# Build packages  
pnpm run --filter @fluidnc-gui/core build
pnpm run --filter @fluidnc-gui/presets build

# Build Tauri app
pnpm --filter @fluidnc-gui/gui tauri build
```

The built artifacts will be in `apps/gui/src-tauri/target/release/bundle/`.

## Distribution

Released installers are available on the GitHub Releases page:
https://github.com/eghasemy/FluidNC_GUI/releases

Users can download the appropriate installer for their platform and install FluidNC GUI locally.