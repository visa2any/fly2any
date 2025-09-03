@echo off
echo ========================================
echo  FLY2ANY DEVELOPMENT SERVER LAUNCHER
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Detected Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ERROR: Failed to install dependencies
        echo Trying alternative method...
        call npx next@15.4.7 dev
        pause
        exit /b %ERRORLEVEL%
    )
)

REM Try to run dev server
echo Starting development server...
echo.

REM Method 1: npm run dev
call npm run dev:legacy
if %ERRORLEVEL% EQU 0 goto :success

REM Method 2: Direct npx
echo Trying alternative method...
call npx next@15.4.7 dev
if %ERRORLEVEL% EQU 0 goto :success

REM Method 3: Direct node
echo Trying direct node method...
call node node_modules\next\dist\bin\next dev
if %ERRORLEVEL% EQU 0 goto :success

REM All methods failed
echo.
echo ========================================
echo  ERROR: Could not start dev server
echo ========================================
echo.
echo Please try:
echo 1. Delete node_modules folder
echo 2. Run: npm cache clean --force
echo 3. Run: npm install
echo 4. Try this script again
echo.
pause
exit /b 1

:success
echo.
echo ========================================
echo  Development server started successfully!
echo  Open http://localhost:3000 in your browser
echo ========================================
pause