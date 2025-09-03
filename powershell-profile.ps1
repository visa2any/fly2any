# PowerShell Profile - Unix-like aliases and better defaults
# Copy this to: $HOME\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1

# ========== Unix-like Aliases ==========
Set-Alias ls Get-ChildItem -Force
Set-Alias ll Get-ChildItem -Force
Set-Alias la Get-ChildItem -Force
Set-Alias grep Select-String
Set-Alias which Get-Command
Set-Alias clear Clear-Host
Set-Alias cls Clear-Host
Set-Alias pwd Get-Location
Set-Alias mv Move-Item
Set-Alias cp Copy-Item
Set-Alias rm Remove-Item
Set-Alias cat Get-Content
Set-Alias head Get-Content
Set-Alias tail Get-Content
Set-Alias touch New-Item
Set-Alias df Get-PSDrive
Set-Alias ps Get-Process
Set-Alias kill Stop-Process
Set-Alias wget Invoke-WebRequest
Set-Alias curl Invoke-WebRequest

# ========== Custom Functions ==========

# Better ls with colors
function l { Get-ChildItem -Force @args }
function la { Get-ChildItem -Force -Hidden @args }
function ll { 
    Get-ChildItem -Force @args | Format-Table Mode, LastWriteTime, Length, Name -AutoSize 
}

# mkdir with parent creation
function mkdirp { New-Item -ItemType Directory -Force @args }

# cd with history
function .. { Set-Location .. }
function ... { Set-Location ..\.. }
function .... { Set-Location ..\..\.. }
function ~ { Set-Location $HOME }

# Git shortcuts
function gs { git status }
function ga { git add @args }
function gc { git commit @args }
function gp { git push @args }
function gl { git pull @args }
function gco { git checkout @args }
function gb { git branch @args }
function gd { git diff @args }
function glog { git log --oneline --graph --decorate --all }

# NPM shortcuts
function ni { npm install @args }
function nr { npm run @args }
function nrd { npm run dev }
function nrb { npm run build }
function nrt { npm run test }
function ns { npm start }

# Quick navigation
function dev { Set-Location "D:\Users\vilma\fly2any" }
function docs { Set-Location "$HOME\Documents" }
function downloads { Set-Location "$HOME\Downloads" }
function desktop { Set-Location "$HOME\Desktop" }

# File operations
function extract {
    param($file)
    if (Test-Path $file) {
        $extension = [System.IO.Path]::GetExtension($file)
        switch ($extension) {
            ".zip" { Expand-Archive $file -DestinationPath "." }
            ".7z" { 7z x $file }
            ".tar" { tar -xf $file }
            ".gz" { tar -xzf $file }
            ".rar" { unrar x $file }
            default { Write-Host "Unknown archive format" }
        }
    }
}

# Search functions
function find-file {
    param($pattern)
    Get-ChildItem -Recurse -Filter $pattern 2>$null
}

function find-text {
    param($text, $path = ".")
    Get-ChildItem -Recurse -Path $path -File 2>$null | Select-String $text
}

# System info
function sysinfo {
    Write-Host "========== System Information ==========" -ForegroundColor Cyan
    Write-Host "Computer: $env:COMPUTERNAME"
    Write-Host "User: $env:USERNAME"
    Write-Host "OS: $(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption)"
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
    Write-Host "Uptime: $((Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime)"
    Write-Host "=======================================" -ForegroundColor Cyan
}

# Network utilities
function myip {
    $external = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
    $internal = (Get-NetIPAddress | Where-Object {$_.AddressFamily -eq 'IPv4' -and $_.IPAddress -ne '127.0.0.1'}).IPAddress
    Write-Host "External IP: $external" -ForegroundColor Green
    Write-Host "Internal IP: $internal" -ForegroundColor Yellow
}

function ports {
    Get-NetTCPConnection | Where-Object {$_.State -eq "Listen"} | 
    Select-Object LocalAddress, LocalPort, State | 
    Sort-Object LocalPort | 
    Format-Table -AutoSize
}

# Process management
function top {
    Get-Process | Sort-Object -Property CPU -Descending | Select-Object -First 10 |
    Format-Table Name, CPU, PM, NPM, Id -AutoSize
}

function killport {
    param($port)
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "Killed process on port $port" -ForegroundColor Green
    } else {
        Write-Host "No process found on port $port" -ForegroundColor Yellow
    }
}

# History search
function h {
    param($pattern)
    if ($pattern) {
        Get-History | Where-Object {$_.CommandLine -like "*$pattern*"}
    } else {
        Get-History
    }
}

# ========== Prompt Customization ==========
function prompt {
    $location = Get-Location
    $folderName = Split-Path $location -Leaf
    
    # Git branch detection
    $branch = ""
    if (Test-Path .git) {
        $branch = & git branch --show-current 2>$null
        if ($branch) {
            $branch = " [$branch]"
        }
    }
    
    # Build prompt
    Write-Host "$env:USERNAME" -NoNewline -ForegroundColor Green
    Write-Host "@" -NoNewline -ForegroundColor White
    Write-Host "$env:COMPUTERNAME" -NoNewline -ForegroundColor Blue
    Write-Host ":" -NoNewline -ForegroundColor White
    Write-Host "$folderName" -NoNewline -ForegroundColor Yellow
    Write-Host "$branch" -NoNewline -ForegroundColor Cyan
    Write-Host " >" -NoNewline -ForegroundColor White
    return " "
}

# ========== Auto-completion ==========
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle ListView
Set-PSReadLineOption -EditMode Windows
Set-PSReadLineOption -HistorySearchCursorMovesToEnd

# Key bindings
Set-PSReadLineKeyHandler -Key Tab -Function Complete
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key Ctrl+d -Function DeleteChar
Set-PSReadLineKeyHandler -Key Ctrl+l -Function ClearScreen
Set-PSReadLineKeyHandler -Key Ctrl+r -Function ReverseSearchHistory

# ========== Welcome Message ==========
Write-Host ""
Write-Host "🚀 PowerShell Enhanced Profile Loaded!" -ForegroundColor Cyan
Write-Host "Type 'Get-Command -Module PSReadLine' for available commands" -ForegroundColor Gray
Write-Host "Type 'h' to search command history" -ForegroundColor Gray
Write-Host "Type 'sysinfo' for system information" -ForegroundColor Gray
Write-Host ""