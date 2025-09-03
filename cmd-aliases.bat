@echo off
:: CMD Aliases - Unix-like commands for Windows Command Prompt
:: Add this to your system PATH or run it when starting CMD

:: ========== Unix-like Aliases ==========
doskey ls=dir /b $*
doskey ll=dir $*
doskey la=dir /a $*
doskey clear=cls
doskey pwd=cd
doskey cat=type $*
doskey mv=move $*
doskey cp=copy $*
doskey rm=del $*
doskey rmdir=rd /s /q $*
doskey touch=type nul ^> $*
doskey grep=findstr $*
doskey ps=tasklist $*
doskey kill=taskkill /F /PID $*
doskey df=wmic logicaldisk get size,freespace,caption
doskey which=where $*
doskey wget=powershell -Command "Invoke-WebRequest -Uri $* -OutFile"
doskey curl=powershell -Command "Invoke-WebRequest -Uri $*"
doskey history=doskey /history
doskey alias=doskey /macros
doskey unalias=doskey $*=

:: ========== Directory Navigation ==========
doskey ..=cd ..
doskey ...=cd ..\..
doskey ....=cd ..\..\..
doskey ~=cd /d %USERPROFILE%
doskey home=cd /d %USERPROFILE%
doskey desktop=cd /d %USERPROFILE%\Desktop
doskey downloads=cd /d %USERPROFILE%\Downloads
doskey docs=cd /d %USERPROFILE%\Documents
doskey dev=cd /d D:\Users\vilma\fly2any

:: ========== Git Shortcuts ==========
doskey gs=git status
doskey ga=git add $*
doskey gaa=git add .
doskey gc=git commit $*
doskey gcm=git commit -m $*
doskey gp=git push $*
doskey gl=git pull $*
doskey gco=git checkout $*
doskey gb=git branch $*
doskey gd=git diff $*
doskey glog=git log --oneline --graph --decorate --all
doskey gstash=git stash $*
doskey gpop=git stash pop
doskey greset=git reset --hard HEAD
doskey gclone=git clone $*

:: ========== NPM Shortcuts ==========
doskey ni=npm install $*
doskey nid=npm install --save-dev $*
doskey nig=npm install -g $*
doskey nr=npm run $*
doskey nrd=npm run dev
doskey nrb=npm run build
doskey nrt=npm run test
doskey ns=npm start
doskey nls=npm list
doskey nu=npm update
doskey nrm=npm uninstall $*

:: ========== Python Shortcuts ==========
doskey py=python $*
doskey pip=python -m pip $*
doskey venv=python -m venv $*
doskey activate=venv\Scripts\activate.bat
doskey deactivate=venv\Scripts\deactivate.bat

:: ========== File Operations ==========
doskey mkdir=md $*
doskey find=dir /s /b $*
doskey tree=tree /f $*
doskey size=dir /s $*
doskey count=dir /b $* ^| find /c /v ""
doskey tail=powershell -Command "Get-Content $* -Tail 10"
doskey head=powershell -Command "Get-Content $* -Head 10"

:: ========== System Commands ==========
doskey reboot=shutdown /r /t 0
doskey shutdown=shutdown /s /t 0
doskey sleep=timeout /t $*
doskey now=echo %date% %time%
doskey path=echo %PATH%
doskey env=set
doskey ip=ipconfig
doskey ping=ping -t $*
doskey ports=netstat -an
doskey hosts=notepad %SystemRoot%\System32\drivers\etc\hosts
doskey sysinfo=systeminfo
doskey whoami=echo %USERNAME%@%COMPUTERNAME%

:: ========== Process Management ==========
doskey top=powershell -Command "Get-Process | Sort-Object -Property CPU -Descending | Select-Object -First 10"
doskey killall=taskkill /F /IM $*
doskey killport=for /f "tokens=5" %%a in ('netstat -ano ^| findstr :$*') do taskkill /F /PID %%a

:: ========== Utility Functions ==========
doskey extract=powershell -Command "Expand-Archive $*"
doskey zip=powershell -Command "Compress-Archive $*"
doskey search=findstr /s /i $*
doskey open=start $*
doskey e=explorer $*
doskey n=notepad $*
doskey c=code $*

:: ========== Docker Shortcuts (if installed) ==========
doskey d=docker $*
doskey dc=docker-compose $*
doskey dps=docker ps
doskey dpsa=docker ps -a
doskey di=docker images
doskey dex=docker exec -it $*
doskey drm=docker rm $*
doskey drmi=docker rmi $*
doskey dstop=docker stop $*
doskey dstart=docker start $*
doskey dlogs=docker logs $*

:: ========== Display Available Commands ==========
echo.
echo ========================================
echo    CMD Enhanced with Unix-like Aliases
echo ========================================
echo.
echo Common commands available:
echo   ls, ll, la    - List files
echo   clear         - Clear screen
echo   pwd           - Show current directory
echo   cat           - Display file contents
echo   grep          - Search text
echo   touch         - Create empty file
echo   ..            - Go up one directory
echo   gs            - Git status
echo   ni            - NPM install
echo   h             - Show command history
echo.
echo Type 'alias' to see all available aliases
echo Type 'doskey /?' for more information
echo.

:: ========== Set Prompt ==========
prompt $E[32m%USERNAME%$E[0m@$E[34m%COMPUTERNAME%$E[0m:$E[33m$P$E[0m$G 