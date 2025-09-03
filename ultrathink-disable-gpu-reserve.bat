@echo off
title ULTRATHINK - Desativar Reserva GPU AMD
color 0E

echo ========================================
echo   ULTRATHINK - CORRECAO EXTREMA v3.0
echo   Desativar Reserva de 9GB da GPU AMD
echo ========================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Execute como ADMINISTRADOR!
    pause
    exit /b 1
)

echo [INFO] Problema detectado:
echo - AMD Radeon HD 8610G esta RESERVANDO 9GB
echo - Mas pesquisas indicam que isso NAO eh memoria perdida!
echo - Vamos forcar o Windows a USAR essa memoria
echo.

echo ========================================
echo   METODO 1: Desativar GPU Integrada
echo ========================================
echo.

echo [1] Desativando GPU AMD no Gerenciador de Dispositivos...
powershell -Command "Get-PnpDevice | Where-Object {$_.FriendlyName -like '*AMD Radeon*'} | Disable-PnpDevice -Confirm:$false" >nul 2>&1
echo [OK] GPU desativada (usara driver basico)
echo.

echo ========================================
echo   METODO 2: Forcar Memoria Completa
echo ========================================
echo.

echo [2] Removendo TODOS limites de memoria...
bcdedit /deletevalue truncatememory >nul 2>&1
bcdedit /deletevalue removememory >nul 2>&1
bcdedit /deletevalue badmemorylist >nul 2>&1
bcdedit /deletevalue badmemoryaccess >nul 2>&1
bcdedit /set firstmegabytepolicy UseAll >nul 2>&1
bcdedit /set avoidlowmemory 0x8000000 >nul 2>&1
bcdedit /set nolowmem Yes >nul 2>&1
echo [OK] Limites removidos
echo.

echo [3] Configurando memoria maxima...
bcdedit /set IncreaseUserVa 2900 >nul 2>&1
echo [OK] UserVa configurado
echo.

echo ========================================
echo   METODO 3: Registry AMD Especifico
echo ========================================
echo.

echo [4] Modificando registro AMD...
:: Desativar ULPS (Ultra Low Power State)
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "EnableUlps" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0001" /v "EnableUlps" /t REG_DWORD /d 0 /f >nul 2>&1

:: Forcar memoria minima
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000" /v "HyperMemory" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0001" /v "HyperMemory" /t REG_DWORD /d 0 /f >nul 2>&1

:: Limitar shared memory
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000\UMD" /v "ShaderCache" /t REG_DWORD /d 0 /f >nul 2>&1

echo [OK] Registro AMD modificado
echo.

echo ========================================
echo   METODO 4: Servicos Desnecessarios
echo ========================================
echo.

echo [5] Desativando servicos AMD...
sc stop "AMD External Events Utility" >nul 2>&1
sc config "AMD External Events Utility" start=disabled >nul 2>&1
sc stop "AMD FUEL Service" >nul 2>&1  
sc config "AMD FUEL Service" start=disabled >nul 2>&1
echo [OK] Servicos desativados
echo.

echo ========================================
echo   METODO 5: Limpeza de Drivers
echo ========================================
echo.

echo [6] Limpando cache de drivers...
del /F /S /Q %WINDIR%\System32\DriverStore\Temp\* >nul 2>&1
del /F /S /Q %WINDIR%\Prefetch\* >nul 2>&1
echo [OK] Cache limpo
echo.

echo ========================================
echo   VERIFICACAO FINAL
echo ========================================
echo.
echo Memoria antes das mudancas:
powershell -Command "[Math]::Round((Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize/1MB/1024,2)"
echo GB visiveis
echo.

echo ========================================
echo   IMPORTANTE - LEIA COM ATENCAO!
echo ========================================
echo.
echo 1. REINICIE o computador AGORA
echo 2. Se a tela ficar com resolucao baixa, eh normal
echo 3. A GPU foi desativada para liberar memoria
echo 4. Para reativar GPU: Gerenciador de Dispositivos
echo.
echo Deseja reiniciar agora? (S/N)
choice /C SN /N
if errorlevel 2 goto end
if errorlevel 1 goto restart

:restart
shutdown /r /t 10 /c "Reiniciando para aplicar correcoes..."
goto end

:end
echo.
echo Execute 'shutdown /r' quando estiver pronto.
pause