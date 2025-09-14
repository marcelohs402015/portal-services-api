#!/bin/bash

echo "🚀 Starting build process..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -f "dist/server.js" ]; then
    echo "✅ Server.js compiled successfully"
else
    echo "❌ Server.js not found!"
    exit 1
fi

if [ -f "dist/utils/mockData.js" ]; then
    echo "✅ mockData.js compiled successfully"
else
    echo "❌ mockData.js not found!"
    exit 1
fi

if [ -f "dist/services/ChatService.js" ]; then
    echo "✅ ChatService.js compiled successfully"
else
    echo "❌ ChatService.js not found!"
    exit 1
fi

# List all compiled files
echo "📋 Compiled files:"
ls -la dist/
echo "📋 Utils directory:"
ls -la dist/utils/
echo "📋 Services directory:"
ls -la dist/services/

echo "🎉 Build completed successfully!"
