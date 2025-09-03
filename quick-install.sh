#!/bin/bash

echo "🚀 Quick Install Script for Fly2Any"
echo "=================================="

# Clean up previous attempts
rm -rf node_modules package-lock.json yarn.lock .next 2>/dev/null

# Create minimal package.json
cat > package-temp.json << 'EOF'
{
  "name": "fly2any",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "15.4.7",
    "react": "19.1.1",
    "react-dom": "19.1.1",
    "@radix-ui/react-slot": "^1.1.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.400.0",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/node": "^20.19.11",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "autoprefixer": "10.4.17",
    "postcss": "8.4.35",
    "tailwindcss": "3.4.1",
    "typescript": "^5.9.2"
  }
}
EOF

echo "📦 Installing minimal dependencies..."
npm install --package=package-temp.json --legacy-peer-deps --no-audit --no-fund --prefer-offline

# Copy back original package.json
if [ -f package-temp.json ]; then
    rm package-temp.json
fi

echo "✅ Installation complete! Run 'npm run dev' to start the server."