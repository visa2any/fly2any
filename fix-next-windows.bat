@echo off
echo ===============================================
echo FLY2ANY NEXT.JS WINDOWS ENVIRONMENT FIX
echo ===============================================
echo.

REM Navigate to project directory
cd /d D:\Users\vilma\fly2any

echo [1] Cleaning existing installations...
if exist "node_modules" (
    echo Removing node_modules...
    rmdir /s /q node_modules 2>nul
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del /f /q package-lock.json 2>nul
)

if exist ".next" (
    echo Removing .next build directory...
    rmdir /s /q .next 2>nul
)

echo.
echo [2] Clearing npm cache...
call npm cache clean --force

echo.
echo [3] Installing dependencies with Windows compatibility...
call npm install --force

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed! Trying alternative method...
    call npm install --legacy-peer-deps
)

echo.
echo [4] Verifying Next.js installation...
if exist "node_modules\next\dist\bin\next" (
    echo [SUCCESS] Next.js installed correctly!
) else (
    echo [ERROR] Next.js not found! Installing explicitly...
    call npm install next@15.4.7 --save
)

echo.
echo [5] Creating Windows-compatible run script...
echo @echo off > run.bat
echo echo Starting Fly2Any Development Server... >> run.bat
echo node node_modules\next\dist\bin\next dev >> run.bat

echo.
echo [6] Testing installation...
node -e "console.log('Node.js version:', process.version)"
call npm --version

echo.
echo ===============================================
echo INSTALLATION COMPLETE!
echo ===============================================
echo.
echo To start the development server, run:
echo   run.bat
echo OR
echo   start-dev.bat
echo.
pause