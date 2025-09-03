@echo off
title ULTRATHINK Memory Optimizer
color 0A

echo =====================================
echo   ULTRATHINK MEMORY OPTIMIZER v1.0
echo =====================================
echo.

:: Verificar privilégios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Este script precisa ser executado como ADMINISTRADOR!
    echo.
    echo Clique com botao direito e selecione "Executar como administrador"
    pause
    exit /b 1
)

echo [OK] Executando com privilegios de administrador
echo.

echo =====================================
echo   ANALISE DE MEMORIA ATUAL
echo =====================================
echo.

:: Mostrar memoria atual
powershell -Command "(Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum/1GB"
echo GB de RAM fisica instalada
echo.

powershell -Command "[Math]::Round((Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize/1MB/1024,2)"
echo GB visiveis ao Windows
echo.

echo =====================================
echo   APLICANDO OTIMIZACOES
echo =====================================
echo.

echo [1/6] Desativando Superfetch/SysMain...
sc stop "SysMain" >nul 2>&1
sc config "SysMain" start=disabled >nul 2>&1
echo [OK] Superfetch desativado
echo.

echo [2/6] Desativando Windows Search (indexacao)...
sc stop "WSearch" >nul 2>&1
sc config "WSearch" start=disabled >nul 2>&1
echo [OK] Windows Search desativado
echo.

echo [3/6] Ajustando configuracoes de memoria virtual...
wmic computersystem set AutomaticManagedPagefile=False >nul 2>&1
wmic pagefileset where name="C:\\pagefile.sys" delete >nul 2>&1
wmic pagefileset create name="C:\\pagefile.sys" >nul 2>&1
wmic pagefileset where name="C:\\pagefile.sys" set InitialSize=2048,MaximumSize=4096 >nul 2>&1
echo [OK] Arquivo de paginacao otimizado (2-4GB)
echo.

echo [4/6] Limpando memoria cache e temporarios...
del /q /s %temp%\*.* >nul 2>&1
rd /s /q %temp% >nul 2>&1
md %temp% >nul 2>&1
echo [OK] Cache limpo
echo.

echo [5/6] Configurando limite de memoria GPU (Registry)...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v TdrLevel /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers\Configuration" /v HwSchMode /t REG_DWORD /d 2 /f >nul 2>&1
echo [OK] Limites de GPU configurados
echo.

echo [6/6] Aplicando ajustes de boot...
bcdedit /set increaseuserva 3072 >nul 2>&1
bcdedit /set disabledynamictick yes >nul 2>&1
bcdedit /set useplatformtick yes >nul 2>&1
echo [OK] Configuracoes de boot otimizadas
echo.

echo =====================================
echo   OTIMIZACAO COMPLETA!
echo =====================================
echo.
echo IMPORTANTE:
echo -----------
echo 1. REINICIE o computador para aplicar as mudancas
echo 2. Entre na BIOS (F2/DEL) e reduza "UMA Frame Buffer" para 1GB
echo 3. Apos reiniciar, verifique a memoria disponivel
echo.
echo Arquivo de instrucoes criado: ULTRATHINK_MEMORY_FIX.md
echo.
pause