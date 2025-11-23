#!/bin/bash

# Vercel build script for Attenda DApp
echo "🚀 Starting Attenda DApp build on Vercel..."

# Install dependencies with fallback for native modules
echo "📦 Installing dependencies..."
yarn install --ignore-optional --network-timeout 600000

# If yarn install fails, try npm as fallback
if [ $? -ne 0 ]; then
    echo "⚠️ Yarn install failed, trying npm..."
    npm install --ignore-optional
fi

# Build the application
echo "🔨 Building Next.js application..."
yarn build

echo "✅ Build completed successfully!"


