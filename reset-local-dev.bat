@echo off
echo ========================================
echo Fly2Any - Local Development Reset
echo ========================================
echo.

echo [1/5] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/5] Cleaning .next directory...
if exist .next rmdir /s /q .next
timeout /t 1 /nobreak >nul

echo [3/5] Cleaning node_modules cache...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
timeout /t 1 /nobreak >nul

echo [4/5] Building application...
call npm run build

echo.
echo [5/5] Starting development server...
echo.
echo ========================================
echo   Development server will start now
echo   Open: http://localhost:3000
echo ========================================
echo.

call npm run dev
