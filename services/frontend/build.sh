#!/bin/bash

echo "🚀 Starting build process for Portal Services..."

# Set environment variables for production build
export NODE_ENV=production
export CI=false
export REACT_APP_API_URL=mock
export REACT_APP_VERSION=2.0.0
export REACT_APP_ENVIRONMENT=production

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --production=false

echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Build directory contents:"
ls -la build/

echo "🎉 Ready for deployment!"
