#!/usr/bin/env pwsh
# Quick Docker Status Checker for Act

Write-Host "Docker Status Check" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

# Check Docker processes
$dockerProcesses = Get-Process | Where-Object { $_.ProcessName -like "*Docker*" } -ErrorAction SilentlyContinue
if ($dockerProcesses) {
    Write-Host "✅ Docker Desktop processes running:" -ForegroundColor Green
    $dockerProcesses | Select-Object ProcessName, Id | Format-Table -AutoSize
} else {
    Write-Host "❌ Docker Desktop not running" -ForegroundColor Red
}

# Test Docker daemon
Write-Host "Testing Docker daemon..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info --format "{{.ServerVersion}}" 2>$null
    if ($dockerInfo) {
        Write-Host "✅ Docker daemon is ready!" -ForegroundColor Green
        Write-Host "Docker version: $(docker --version)" -ForegroundColor Green
        
        Write-Host "`n🎉 You can now run GitHub Actions locally!" -ForegroundColor Green
        Write-Host "Commands available:" -ForegroundColor Cyan
        Write-Host "  ./deploy-with-act.ps1                 # Full validation + deployment" -ForegroundColor White
        Write-Host "  ./deploy-with-act.ps1 -RunPRValidation # Just PR validation" -ForegroundColor White
        Write-Host "  act --list                            # List all workflows" -ForegroundColor White
    } else {
        Write-Host "❌ Docker daemon not responding" -ForegroundColor Red
        Write-Host "Solutions:" -ForegroundColor Yellow
        Write-Host "1. Wait 2-5 minutes for Docker to fully start" -ForegroundColor White
        Write-Host "2. Restart Docker Desktop as Administrator" -ForegroundColor White
        Write-Host "3. Run without validation: ./deploy-with-act.ps1 -SkipValidation" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Docker command failed" -ForegroundColor Red
    Write-Host "Run: ./deploy-with-act.ps1 -SkipValidation" -ForegroundColor Yellow
} 