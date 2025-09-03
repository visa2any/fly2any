@echo off
echo 🚨 EMERGENCY TAILWIND FIX - WINDOWS
echo ===================================
echo.

echo ⏹️  Stopping all Node processes...
taskkill /f /im node.exe /t 2>nul
timeout /t 2 /nobreak >nul

echo 🗑️  Removing ALL Tailwind packages...
call npm uninstall tailwindcss @tailwindcss/postcss @tailwindcss/typography @tailwindcss/forms @tailwindcss/aspect-ratio lightningcss

echo 🧹 Deep cleaning...
call npm cache clean --force
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo 📦 Installing WORKING versions...
call npm install tailwindcss@3.4.1 @tailwindcss/typography@0.5.10 @tailwindcss/forms@0.5.7 @tailwindcss/aspect-ratio@0.4.2 autoprefixer@10.4.17 postcss@8.4.35 --save-dev

echo 📦 Installing main dependencies...
call npm install

echo 🔧 Switching to working PostCSS config...
if exist postcss.config.mjs ren postcss.config.mjs postcss.config.mjs.backup
ren postcss.config.simple.js postcss.config.js

echo ✅ FIX COMPLETE!
echo.
echo 🚀 Now run: npm run dev
echo.
pause