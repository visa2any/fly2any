@echo off
REM ========================================
REM Clean Build Cache and Test Artifacts
REM ========================================
REM Run this if Claude Code is still slow
REM ========================================

echo.
echo ========================================
echo    Cleaning Build Cache and Artifacts
echo ========================================
echo.

cd /d C:\Users\Power\fly2any-fresh

echo [1/5] Cleaning Next.js build cache...
if exist .next (
    rmdir /s /q .next
    echo    - Removed .next directory
) else (
    echo    - .next directory not found
)

echo.
echo [2/5] Cleaning test results...
if exist test-results (
    rmdir /s /q test-results
    echo    - Removed test-results directory
) else (
    echo    - test-results directory not found
)

echo.
echo [3/5] Cleaning Playwright reports...
if exist playwright-report (
    rmdir /s /q playwright-report
    echo    - Removed playwright-report directory
) else (
    echo    - playwright-report directory not found
)

echo.
echo [4/5] Cleaning TypeScript build info...
if exist *.tsbuildinfo (
    del /q *.tsbuildinfo
    echo    - Removed TypeScript build info files
) else (
    echo    - No TypeScript build info files found
)

echo.
echo [5/5] Cleaning Vercel cache...
if exist .vercel\.output (
    rmdir /s /q .vercel\.output
    echo    - Removed Vercel output cache
) else (
    echo    - Vercel cache not found
)

echo.
echo ========================================
echo    Cache Cleaning Complete!
echo ========================================
echo.
echo You can now run start-claude.bat
echo.
pause
