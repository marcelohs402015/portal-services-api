#!/usr/bin/env bash
# Production build script for Render.com

set -o errexit
set -o pipefail

echo "🚀 Starting production build..."

# Navigate to appserver directory
cd appserver

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔨 Building TypeScript..."
npm run build

echo "🧹 Cleaning up..."
# Remove dev files to reduce size
rm -rf src/ tsconfig*.json *.md docs/ tests/ node_modules/@types

echo "✅ Build completed successfully!"

# Verify build
if [ -f "dist/server.js" ]; then
    echo "✅ Server.js compiled successfully"
    echo "📊 Build size:"
    du -sh dist/
else
    echo "❌ Build failed - server.js not found"
    exit 1
fi

echo "🎉 Production build ready for deployment!"
