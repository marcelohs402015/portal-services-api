#!/usr/bin/env bash
# Build script for Render.com deployment

set -o errexit

echo "🚀 Starting Render build process..."

# Navigate to backend directory
cd appserver

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🔨 Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"

# Verificar se os arquivos foram compilados
if [ -f "dist/server.js" ]; then
    echo "✅ Server.js found in dist/"
else
    echo "❌ Server.js not found in dist/"
    exit 1
fi

echo "📋 Build artifacts:"
ls -la dist/

echo "🎉 Render build completed!"
