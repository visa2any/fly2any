# Script simplificado para verificar memória

Write-Host ""
Write-Host "======================================"
Write-Host "  ANÁLISE DE MEMÓRIA DO SISTEMA"
Write-Host "======================================"
Write-Host ""

# Memória física instalada
$totalInstalledBytes = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum
$totalInstalledGB = [Math]::Round($totalInstalledBytes/1GB, 2)

# Memória visível ao Windows
$osInfo = Get-CimInstance Win32_OperatingSystem
$totalVisibleKB = $osInfo.TotalVisibleMemorySize
$totalVisibleGB = [Math]::Round($totalVisibleKB/1MB/1024, 2)

# Memória reservada
$reservedGB = [Math]::Round($totalInstalledGB - $totalVisibleGB, 2)

# GPU Info
$gpuInfo = Get-CimInstance Win32_VideoController
$gpuMemoryMB = [Math]::Round($gpuInfo.AdapterRAM/1MB, 0)

Write-Host "MEMÓRIA FÍSICA:"
Write-Host "  Total Instalado: $totalInstalledGB GB"
Write-Host "  Visível ao Windows: $totalVisibleGB GB"
Write-Host "  Reservado pelo Hardware: $reservedGB GB"
Write-Host ""

Write-Host "GPU INTEGRADA:"
Write-Host "  Modelo: $($gpuInfo.Name)"
Write-Host "  VRAM Dedicada: $gpuMemoryMB MB"
Write-Host ""

Write-Host "======================================"
Write-Host "  PROBLEMA IDENTIFICADO"
Write-Host "======================================"
Write-Host ""
Write-Host "Você tem $totalInstalledGB GB instalados"
Write-Host "Mas apenas $totalVisibleGB GB estão disponíveis"
Write-Host "Total de $reservedGB GB estão reservados!"
Write-Host ""
Write-Host "CAUSA: GPU integrada AMD Radeon HD 8610G"
Write-Host "está reservando RAM excessiva do sistema."
Write-Host ""
Write-Host "======================================"
Write-Host "  SOLUÇÕES RECOMENDADAS"
Write-Host "======================================"
Write-Host ""