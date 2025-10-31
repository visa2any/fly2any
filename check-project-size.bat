@echo off
REM ========================================
REM Check Project Size and File Counts
REM ========================================
REM Use this to monitor what's taking up space
REM ========================================

echo.
echo ========================================
echo    Project Size Analysis
echo ========================================
echo.

cd /d C:\Users\Power\fly2any-fresh

echo Current directory: %CD%
echo.

echo [Checking directory sizes...]
echo.

REM Use PowerShell to calculate directory sizes
powershell -Command "& { Get-ChildItem -Directory -ErrorAction SilentlyContinue | ForEach-Object { $size = (Get-ChildItem $_.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB; Write-Output ('{0,-25} {1,10:N2} MB' -f $_.Name, $size) } | Sort-Object { [regex]::Match($_, '(\d+\.\d+)').Value -as [double] } -Descending }"

echo.
echo ========================================
echo    File Count Analysis
echo ========================================
echo.

echo Markdown files (documentation):
powershell -Command "(Get-ChildItem -Filter *.md -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count"

echo Image files (screenshots):
powershell -Command "(Get-ChildItem -Include *.png,*.jpg,*.jpeg,*.gif -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count"

echo TypeScript/JavaScript files:
powershell -Command "(Get-ChildItem -Include *.ts,*.tsx,*.js,*.jsx -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count"

echo.
pause
