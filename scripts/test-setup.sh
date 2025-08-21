#!/bin/bash

# Simple E2E test setup and smoke test script
set -e

echo "🚀 Starting FluidNC GUI E2E test setup..."

# Check if dependencies are installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found, installing..."
    npm install -g pnpm
fi

# Install project dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build packages (core and presets)
echo "🔨 Building packages..."
pnpm run --filter @fluidnc-gui/core build
pnpm run --filter @fluidnc-gui/presets build

# Check if we can at least compile TypeScript
echo "🔍 Type checking..."
pnpm run --filter @fluidnc-gui/gui type-check

echo "✅ E2E test environment setup complete!"

# Try to start the dev server briefly to verify it works
echo "🧪 Testing dev server startup..."
timeout 10s pnpm run --filter @fluidnc-gui/gui dev &
DEV_PID=$!

sleep 5

# Check if the process is still running
if kill -0 $DEV_PID 2>/dev/null; then
    echo "✅ Dev server started successfully"
    kill $DEV_PID
else
    echo "❌ Dev server failed to start"
    exit 1
fi

echo "🎉 All checks passed! E2E tests should be ready to run."