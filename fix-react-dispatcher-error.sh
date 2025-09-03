#!/bin/bash

# ReactCurrentDispatcher Error Fix Script
# Addresses critical version incompatibilities and SSR issues

echo "🚨 FIXING REACTCURRENTDISPATCHER ERROR - ULTRATHINK SOLUTION"
echo "=================================================="

echo "📦 Step 1: Backing up current configuration..."
cp package.json package.json.backup-dispatcher-fix
cp package-lock.json package-lock.json.backup-dispatcher-fix
echo "✅ Backup completed"

echo "🗑️ Step 2: Cleaning node_modules and lock file..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ Cleanup completed"

echo "📋 Step 3: Installing compatible versions..."
npm install

echo "🔍 Step 4: Verifying React versions..."
echo "React version: $(npm list react --depth=0)"
echo "React-DOM version: $(npm list react-dom --depth=0)"
echo "Next.js version: $(npm list next --depth=0)"
echo "NextAuth version: $(npm list next-auth --depth=0)"

echo "🔧 Step 5: Checking for multiple React instances..."
REACT_INSTANCES=$(find node_modules -name "react" -type d | grep -v "@" | wc -l)
if [ $REACT_INSTANCES -gt 1 ]; then
  echo "⚠️ WARNING: Multiple React instances detected ($REACT_INSTANCES)"
  find node_modules -name "react" -type d | grep -v "@"
else
  echo "✅ Single React instance confirmed"
fi

echo "🏗️ Step 6: Running type check..."
npm run type-check
if [ $? -eq 0 ]; then
  echo "✅ TypeScript compilation successful"
else
  echo "❌ TypeScript errors detected - check output above"
fi

echo "🚀 Step 7: Testing development server..."
echo "Run: npm run dev"
echo "Monitor for ReactCurrentDispatcher errors in console"

echo "=================================================="
echo "✅ REACTCURRENTDISPATCHER FIX COMPLETED"
echo "📖 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Check browser console for errors"
echo "   3. Test SSR pages: /, /not-found"
echo "   4. Verify admin login functionality"
echo "=================================================="