#!/bin/bash

echo "🔧 WSL Next.js Fix Script Starting..."

# Set environment variables for WSL
export NODE_ENV=development
export FORCE_COLOR=1

# Clean up first
echo "🧹 Cleaning up previous installations..."
rm -rf node_modules 2>/dev/null || true
rm -f package-lock.json yarn.lock 2>/dev/null || true

# Create temporary directory in Linux filesystem for better performance
TEMP_DIR="/tmp/fly2any-install"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "📦 Copying package.json to temp location..."
cp package.json "$TEMP_DIR/"
cd "$TEMP_DIR"

echo "🚀 Installing in Linux filesystem (faster)..."
npm install --cache /tmp/npm-cache --prefer-online --no-audit --legacy-peer-deps --timeout=300000

if [ $? -eq 0 ]; then
    echo "✅ Installation successful in temp location"
    
    echo "📂 Moving node_modules back to project..."
    cd /mnt/d/Users/vilma/fly2any
    
    # Move instead of copy to avoid WSL filesystem issues
    mv "$TEMP_DIR/node_modules" . 2>/dev/null
    cp "$TEMP_DIR/package-lock.json" . 2>/dev/null || true
    
    echo "🎯 Testing Next.js binary..."
    if [ -f "node_modules/.bin/next" ]; then
        echo "✅ Next.js binary found at node_modules/.bin/next"
        
        echo "🌐 Starting development server..."
        NODE_ENV=development PORT=3000 node_modules/.bin/next dev --port 3000 &
        
        echo "🎉 Development server started!"
        echo "📍 URL: http://localhost:3000"
        echo "⏹️  Press Ctrl+C to stop"
        
        # Keep the script running
        wait
        
    else
        echo "❌ Next.js binary not found, trying direct method..."
        # Try direct node execution
        find node_modules/next -name "next" -executable -type f | head -1 | xargs -I {} node {} dev --port 3000
    fi
    
else
    echo "❌ Installation failed in temp location"
    
    echo "🔄 Trying fallback installation in original location..."
    cd /mnt/d/Users/vilma/fly2any
    
    # Use npm with specific flags for WSL
    npm install --cache /tmp/npm-cache --prefer-online --no-audit --no-fund --legacy-peer-deps --maxsockets 1
    
    if [ $? -eq 0 ]; then
        echo "✅ Fallback installation successful"
        
        if [ -f "node_modules/.bin/next" ]; then
            echo "🌐 Starting development server with fallback..."
            NODE_ENV=development PORT=3000 node_modules/.bin/next dev --port 3000
        else
            echo "❌ Still no Next.js binary found"
            echo "📋 Manual steps:"
            echo "1. cd /mnt/d/Users/vilma/fly2any"
            echo "2. npm run dev"
            echo "3. or yarn dev"
        fi
    else
        echo "❌ All installation attempts failed"
        echo "📋 Please try manually:"
        echo "1. npm cache clean --force"
        echo "2. rm -rf node_modules"
        echo "3. npm install"
        echo "4. npm run dev"
    fi
fi

# Cleanup temp directory
rm -rf "$TEMP_DIR" 2>/dev/null || true