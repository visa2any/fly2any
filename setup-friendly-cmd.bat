@echo off
:: Setup script to make CMD more user-friendly
:: Run this once to install all configurations

echo ========================================
echo    Setting up User-Friendly CMD/Terminal
echo ========================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Running with Administrator privileges
) else (
    echo ⚠ Please run this script as Administrator for full setup
    echo   Right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Create directories if they don't exist
echo Creating necessary directories...
if not exist "%USERPROFILE%\Documents\WindowsPowerShell" (
    mkdir "%USERPROFILE%\Documents\WindowsPowerShell"
)
if not exist "%USERPROFILE%\Documents\PowerShell" (
    mkdir "%USERPROFILE%\Documents\PowerShell"
)

:: Copy PowerShell profile
echo.
echo Installing PowerShell profile...
copy /Y "powershell-profile.ps1" "%USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" >nul
copy /Y "powershell-profile.ps1" "%USERPROFILE%\Documents\PowerShell\Microsoft.PowerShell_profile.ps1" >nul
echo ✓ PowerShell profile installed

:: Set execution policy for PowerShell scripts
echo.
echo Setting PowerShell execution policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force" 2>nul
echo ✓ PowerShell execution policy configured

:: Add CMD aliases to registry for auto-load
echo.
echo Setting up CMD auto-load aliases...
reg add "HKEY_CURRENT_USER\Software\Microsoft\Command Processor" /v "AutoRun" /t REG_SZ /d "D:\Users\vilma\fly2any\cmd-aliases.bat" /f >nul
echo ✓ CMD aliases will auto-load

:: Install Windows Terminal if not present
echo.
echo Checking for Windows Terminal...
where wt >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Windows Terminal is installed
    
    :: Copy Windows Terminal settings
    echo.
    echo Would you like to apply custom Windows Terminal settings? (y/n)
    set /p response=
    if /i "%response%"=="y" (
        echo Note: This will backup and replace your current settings
        
        :: Backup existing settings
        if exist "%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json" (
            copy "%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json" "%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.backup.json" >nul
            echo ✓ Existing settings backed up to settings.backup.json
        )
        
        :: Copy new settings
        copy /Y "windows-terminal-settings.json" "%LOCALAPPDATA%\Packages\Microsoft.WindowsTerminal_8wekyb3d8bbwe\LocalState\settings.json" >nul
        echo ✓ Windows Terminal settings applied
    )
) else (
    echo ⚠ Windows Terminal not found
    echo   Install it from Microsoft Store or:
    echo   winget install Microsoft.WindowsTerminal
)

:: Create desktop shortcuts
echo.
echo Creating desktop shortcuts...

:: PowerShell Enhanced shortcut
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%USERPROFILE%\Desktop\PowerShell Enhanced.lnk'); $SC.TargetPath = 'pwsh.exe'; $SC.Arguments = '-NoLogo -NoExit -File D:\Users\vilma\fly2any\powershell-profile.ps1'; $SC.WorkingDirectory = 'D:\Users\vilma\fly2any'; $SC.IconLocation = 'pwsh.exe'; $SC.Save()" 2>nul
if %errorLevel% == 0 (
    echo ✓ PowerShell Enhanced shortcut created
) else (
    powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%USERPROFILE%\Desktop\PowerShell Enhanced.lnk'); $SC.TargetPath = 'powershell.exe'; $SC.Arguments = '-NoLogo -NoExit -File D:\Users\vilma\fly2any\powershell-profile.ps1'; $SC.WorkingDirectory = 'D:\Users\vilma\fly2any'; $SC.IconLocation = 'powershell.exe'; $SC.Save()"
    echo ✓ Windows PowerShell Enhanced shortcut created
)

:: CMD Enhanced shortcut
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%USERPROFILE%\Desktop\CMD Enhanced.lnk'); $SC.TargetPath = 'cmd.exe'; $SC.Arguments = '/k D:\Users\vilma\fly2any\cmd-aliases.bat'; $SC.WorkingDirectory = 'D:\Users\vilma\fly2any'; $SC.IconLocation = 'cmd.exe'; $SC.Save()"
echo ✓ CMD Enhanced shortcut created

:: Add to PATH (optional)
echo.
echo Would you like to add this directory to your PATH for global access? (y/n)
set /p addpath=
if /i "%addpath%"=="y" (
    setx PATH "%PATH%;D:\Users\vilma\fly2any" >nul 2>&1
    echo ✓ Directory added to PATH
)

:: Create quick launcher script
echo @echo off > "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo echo Choose your terminal: >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo echo 1. PowerShell Enhanced >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo echo 2. CMD Enhanced >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo echo 3. Windows Terminal >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo set /p choice=Enter choice (1-3): >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo if "%%choice%%"=="1" start pwsh.exe -NoLogo -NoExit -File "D:\Users\vilma\fly2any\powershell-profile.ps1" >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo if "%%choice%%"=="2" start cmd.exe /k "D:\Users\vilma\fly2any\cmd-aliases.bat" >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo if "%%choice%%"=="3" start wt >> "%USERPROFILE%\Desktop\Terminal Launcher.bat"
echo ✓ Terminal Launcher created on desktop

echo.
echo ========================================
echo    ✅ Setup Complete!
echo ========================================
echo.
echo What's been configured:
echo   • Unix-like aliases (ls, grep, etc.)
echo   • Git shortcuts (gs, gc, gp, etc.)
echo   • NPM shortcuts (ni, nr, nrd, etc.)
echo   • Better navigation (.., ..., ~)
echo   • Enhanced prompt with colors
echo   • Auto-completion and history search
echo   • Custom functions and utilities
echo.
echo How to use:
echo   1. Use desktop shortcuts to launch enhanced terminals
echo   2. Or run these commands:
echo      - PowerShell: pwsh -NoExit -File powershell-profile.ps1
echo      - CMD: cmd /k cmd-aliases.bat
echo   3. Type 'alias' in CMD or 'h' in PowerShell to see commands
echo.
echo 💡 Tips:
echo   • Press Tab for auto-completion
echo   • Use arrow keys to search command history
echo   • Type 'sysinfo' for system information
echo   • Type 'myip' to see your IP addresses
echo.
pause