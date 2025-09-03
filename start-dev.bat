@echo off
echo ========================================
echo FLY2ANY ENTERPRISE DEVELOPMENT SERVER
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [ERROR] node_modules not found!
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)

REM Check if Next.js is installed
if not exist "node_modules\next\dist\bin\next" (
    echo [ERROR] Next.js not installed properly!
    echo Reinstalling Next.js...
    call npm uninstall next
    call npm install next@15.4.7
    if errorlevel 1 (
        echo [ERROR] Next.js installation failed!
        pause
        exit /b 1
    )
)

REM Kill any existing processes on port 3000
echo Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process %%a
    taskkill /F /PID %%a 2>nul
)

REM Start the development server using direct path
echo.
echo Starting development server...
echo.
node node_modules\next\dist\bin\next dev

REM If that fails, try with npx
if errorlevel 1 (
    echo.
    echo Trying alternative method...
    npx next dev
)

pause