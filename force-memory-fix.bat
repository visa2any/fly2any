@echo off
title ULTRATHINK Force Memory Fix - SEM BIOS
color 0C

echo =====================================
echo   FORCAR LIBERACAO DE MEMORIA - v2.0
echo =====================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] EXECUTE COMO ADMINISTRADOR!
    pause
    exit /b 1
)

echo [1] Limitando memoria maxima do sistema...
bcdedit /deletevalue removememory >nul 2>&1
bcdedit /deletevalue truncatememory >nul 2>&1
bcdedit /set removememory 0 >nul 2>&1
echo [OK] Removendo restricoes de memoria
echo.

echo [2] Forcando Windows a usar toda RAM...
bcdedit /set pae ForceEnable >nul 2>&1
bcdedit /set nx AlwaysOn >nul 2>&1
bcdedit /set increaseuserva 3072 >nul 2>&1
echo [OK] PAE e UserVA configurados
echo.

echo [3] Desativando reserva de memoria para GPU...
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v DedicatedSegmentSize /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v TdrLevel /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v SessionViewSize /t REG_DWORD /d 48 /f >nul 2>&1
reg add "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v SessionPoolSize /t REG_DWORD /d 4 /f >nul 2>&1
echo [OK] Registro da GPU modificado
echo.

echo [4] Configurando limite de video memory...
reg add "HKLM\SOFTWARE\Intel\GMM" /v DedicatedSegmentSize /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\AMD\GMM" /v DedicatedSegmentSize /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\SOFTWARE\ATI Technologies\GMM" /v DedicatedSegmentSize /t REG_DWORD /d 0 /f >nul 2>&1
echo [OK] Limites de fabricantes configurados
echo.

echo =====================================
echo   REINICIE O COMPUTADOR AGORA!
echo =====================================
echo.
shutdown /r /t 30 /c "Reiniciando em 30 segundos para aplicar correcoes de memoria..."
echo Sistema reiniciara em 30 segundos...
echo Pressione qualquer tecla para cancelar reinicio
pause >nul
shutdown /a
echo Reinicio cancelado. Execute shutdown /r quando estiver pronto.
pause