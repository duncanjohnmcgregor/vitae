#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Check Docker status and run GitHub Actions locally with act
.DESCRIPTION
    This script checks if Docker Desktop is ready and provides options to:
    1. Wait for Docker to be ready and run act
    2. Run deployment without GitHub Actions validation
    3. Show Docker troubleshooting tips
.PARAMETER Action
    What to do: 'check', 'wait', 'deploy-only', 'troubleshoot'
.PARAMETER Timeout
    How long to wait for Docker (in seconds, default: 120)
.EXAMPLE
    ./check-docker-and-run-act.ps1 -Action check
    ./check-docker-and-run-act.ps1 -Action wait -Timeout 180
    ./check-docker-and-run-act.ps1 -Action deploy-only
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('check', 'wait', 'deploy-only', 'troubleshoot')]
    [string]$Action = 'check',
    
    [Parameter(Mandatory=$false)]
    [int]$Timeout = 120
)

function Test-DockerReady {
    try {
        $result = docker info --format "{{.ServerVersion}}" 2>$null
        return $result -and $result.Length -gt 0
    }
    catch {
        return $false
    }
}

function Show-DockerStatus {
    Write-Host "`n🔍 Docker Desktop Status Check" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    # Check if Docker Desktop processes are running
    $dockerProcesses = Get-Process | Where-Object { $_.ProcessName -like "*Docker*" }
    if ($dockerProcesses) {
        Write-Host "✅ Docker Desktop processes are running:" -ForegroundColor Green
        $dockerProcesses | Select-Object ProcessName, Id | Format-Table -AutoSize
    } else {
        Write-Host "❌ Docker Desktop processes not found" -ForegroundColor Red
        return $false
    }
    
    # Check Docker daemon
    Write-Host "🔧 Testing Docker daemon connection..." -ForegroundColor Yellow
    if (Test-DockerReady) {
        Write-Host "✅ Docker daemon is ready!" -ForegroundColor Green
        docker --version
        return $true
    } else {
        Write-Host "❌ Docker daemon not responding" -ForegroundColor Red
        Write-Host "   Error: Cannot connect to Docker engine" -ForegroundColor Red
        return $false
    }
}

function Wait-ForDocker {
    param([int]$TimeoutSeconds)
    
    Write-Host "`n⏳ Waiting for Docker to be ready (timeout: $TimeoutSeconds seconds)..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    $endTime = $startTime.AddSeconds($TimeoutSeconds)
    
    while ((Get-Date) -lt $endTime) {
        if (Test-DockerReady) {
            Write-Host "✅ Docker is ready!" -ForegroundColor Green
            return $true
        }
        
        $remaining = [math]::Round(($endTime - (Get-Date)).TotalSeconds)
        Write-Host "   Still waiting... ($remaining seconds remaining)" -ForegroundColor Gray
        Start-Sleep 5
    }
    
    Write-Host "⏰ Timeout reached. Docker is not ready." -ForegroundColor Red
    return $false
}

function Show-TroubleshootingTips {
    Write-Host "`n🛠️  Docker Troubleshooting Tips" -ForegroundColor Cyan
    Write-Host "==============================" -ForegroundColor Cyan
    
    Write-Host "`n1. 🔄 Restart Docker Desktop:" -ForegroundColor Yellow
    Write-Host "   • Close Docker Desktop completely"
    Write-Host "   • Run as Administrator: 'C:\Program Files\Docker\Docker\Docker Desktop.exe'"
    Write-Host "   • Wait 2-5 minutes for full initialization"
    
    Write-Host "`n2. 🔧 Check Windows Features:" -ForegroundColor Yellow
    Write-Host "   • Enable 'Windows Subsystem for Linux' (WSL2)" -ForegroundColor White
    Write-Host "   • Enable 'Virtual Machine Platform'" -ForegroundColor White
    Write-Host "   • Restart computer if features were just enabled" -ForegroundColor White
    
    Write-Host "`n3. 🐳 Alternative: Use act with different runner:" -ForegroundColor Yellow
    Write-Host "   • Edit .actrc to use smaller images:"
    Write-Host "   • -P ubuntu-latest=node:16-alpine"
    Write-Host "   • -P ubuntu-22.04=node:18-alpine"
    
    Write-Host "`n4. 🚀 Continue without Docker:" -ForegroundColor Yellow
    Write-Host "   • Run: ./deploy-with-act.ps1 -SkipValidation"
    Write-Host "   • This deploys locally without GitHub Actions testing"
    
    Write-Host "`n5. 📋 Manual Commands to Try:" -ForegroundColor Yellow
    Write-Host "   Get-Process | Where-Object { `$_.ProcessName -like '*Docker*' }"
    Write-Host "   docker --version"
    Write-Host "   docker info"
    Write-Host "   wsl --list --verbose"
}

function Run-ActValidation {
    Write-Host "`n🎬 Running GitHub Actions with act..." -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    
    # Test with a simple workflow first
    Write-Host "Testing act with workflow list..." -ForegroundColor Yellow
    act --list
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Act is working! Running PR validation..." -ForegroundColor Green
        ./deploy-with-act.ps1 -RunPRValidation
    } else {
        Write-Host "`n❌ Act failed. Running deployment without validation..." -ForegroundColor Red
        ./deploy-with-act.ps1 -SkipValidation
    }
}

# Main script logic
Write-Host "🐳 Docker & Act Status Checker" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta

switch ($Action) {
    'check' {
        $isReady = Show-DockerStatus
        if ($isReady) {
            Write-Host "`n🎉 Docker is ready! You can now run:" -ForegroundColor Green
            Write-Host "   ./deploy-with-act.ps1                 # Full validation + deployment" -ForegroundColor Cyan
            Write-Host "   ./deploy-with-act.ps1 -RunPRValidation # Just PR validation" -ForegroundColor Cyan
            Write-Host "   act --list                            # List all workflows" -ForegroundColor Cyan
        } else {
            Write-Host "`n💡 Options:" -ForegroundColor Yellow
            Write-Host "   ./check-docker-and-run-act.ps1 -Action wait         # Wait for Docker" -ForegroundColor Cyan
            Write-Host "   ./check-docker-and-run-act.ps1 -Action deploy-only  # Deploy without validation" -ForegroundColor Cyan
            Write-Host "   ./check-docker-and-run-act.ps1 -Action troubleshoot # Show troubleshooting tips" -ForegroundColor Cyan
        }
    }
    
    'wait' {
        if (Wait-ForDocker -TimeoutSeconds $Timeout) {
            Run-ActValidation
        } else {
            Write-Host "`n💡 Docker is not ready. Running deployment without validation..." -ForegroundColor Yellow
            ./deploy-with-act.ps1 -SkipValidation
        }
    }
    
    'deploy-only' {
        Write-Host "`n🚀 Running deployment without GitHub Actions validation..." -ForegroundColor Green
        ./deploy-with-act.ps1 -SkipValidation
    }
    
    'troubleshoot' {
        Show-DockerStatus
        Show-TroubleshootingTips
    }
}

Write-Host "`n✨ Done!" -ForegroundColor Green 