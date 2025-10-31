@echo off
REM ========================================
REM Claude Code Launcher with Memory Optimization
REM ========================================
REM This script ensures Claude Code runs with:
REM - Correct working directory
REM - Increased Node.js heap size (4GB)
REM - Optimized performance settings
REM ========================================

echo.
echo ========================================
echo    Starting Claude Code (Optimized)
echo ========================================
echo.

REM Navigate to project directory
cd /d C:\Users\Power\fly2any-fresh

REM Set Node.js options for increased heap size
set NODE_OPTIONS=--max-old-space-size=4096

REM Display current directory
echo Current directory: %CD%
echo Node.js heap size: 4GB
echo.
echo Starting Claude Code...
echo.

REM Start Claude Code
claude

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo ========================================
    echo    Claude Code exited with an error
    echo ========================================
    echo.
    pause
)
