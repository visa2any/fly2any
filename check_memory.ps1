# Script para verificar memória do sistema

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ANÁLISE DE MEMÓRIA DO SISTEMA" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Memória física instalada
$totalInstalledBytes = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum
$totalInstalledGB = [Math]::Round($totalInstalledBytes/1GB, 2)

# Memória visível ao Windows
$osInfo = Get-CimInstance Win32_OperatingSystem
$totalVisibleKB = $osInfo.TotalVisibleMemorySize
$totalVisibleGB = [Math]::Round($totalVisibleKB/1MB/1024, 2)

# Memória reservada (hardware/sistema)
$reservedGB = [Math]::Round($totalInstalledGB - $totalVisibleGB, 2)

# Informações da GPU
$gpuInfo = Get-CimInstance Win32_VideoController
$gpuMemoryMB = [Math]::Round($gpuInfo.AdapterRAM/1MB, 0)

Write-Host "MEMÓRIA FÍSICA:" -ForegroundColor Yellow
Write-Host "  Total Instalado: $totalInstalledGB GB" -ForegroundColor White
Write-Host "  Visível ao Windows: $totalVisibleGB GB" -ForegroundColor White
Write-Host "  Reservado (Hardware): $reservedGB GB" -ForegroundColor Red
Write-Host ""

Write-Host "GPU INTEGRADA:" -ForegroundColor Yellow
Write-Host "  Modelo: $($gpuInfo.Name)" -ForegroundColor White
Write-Host "  VRAM Dedicada: $gpuMemoryMB MB" -ForegroundColor White
Write-Host ""

# Verificar memória compartilhada pela GPU
Write-Host "ANÁLISE DE MEMÓRIA COMPARTILHADA:" -ForegroundColor Yellow
$sharedSystemMemory = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" -ErrorAction SilentlyContinue

if ($sharedSystemMemory) {
    if ($sharedSystemMemory.TdrLevel) {
        Write-Host "  TDR Level: $($sharedSystemMemory.TdrLevel)" -ForegroundColor White
    }
}

# Verificar configuração de paginação
$pagingInfo = Get-CimInstance Win32_PageFileUsage
Write-Host ""
Write-Host "ARQUIVO DE PAGINAÇÃO:" -ForegroundColor Yellow
Write-Host "  Tamanho Atual: $([Math]::Round($pagingInfo.CurrentUsage/1024, 2)) GB" -ForegroundColor White
Write-Host "  Tamanho Alocado: $([Math]::Round($pagingInfo.AllocatedBaseSize/1024, 2)) GB" -ForegroundColor White

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  PROBLEMA IDENTIFICADO" -ForegroundColor Red
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Você tem 16 GB instalados, mas apenas $totalVisibleGB GB disponíveis." -ForegroundColor Yellow
Write-Host "Aproximadamente $reservedGB GB estão reservados!" -ForegroundColor Red
Write-Host ""
Write-Host "POSSÍVEL CAUSA: A GPU integrada AMD Radeon HD 8610G está" -ForegroundColor White
Write-Host "reservando uma quantidade excessiva de RAM do sistema." -ForegroundColor White
Write-Host ""
Write-Host "SOLUÇÃO: Ajustar a quantidade de memória compartilhada" -ForegroundColor Green
Write-Host "na BIOS/UEFI (geralmente chamado de UMA Frame Buffer Size," -ForegroundColor Green
Write-Host 'Graphics Memory Size ou Shared Memory).' -ForegroundColor Green