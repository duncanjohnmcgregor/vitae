Write-Host "Testing Act Setup" -ForegroundColor Green

$actPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\nektos.act_Microsoft.Winget.Source_8wekyb3d8bbwe\act.exe"

if (Test-Path $actPath) {
    Write-Host "✓ Act executable found" -ForegroundColor Green
    
    $version = & $actPath --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Act version: $version" -ForegroundColor Green
    } else {
        Write-Host "✗ Act command failed" -ForegroundColor Red
    }
    
    Write-Host "Listing workflows..." -ForegroundColor Cyan
    & $actPath --list
    
} else {
    Write-Host "✗ Act not found" -ForegroundColor Red
}

Write-Host "`nSetup files:" -ForegroundColor Yellow
if (Test-Path ".actrc") { Write-Host "✓ .actrc" -ForegroundColor Green } else { Write-Host "✗ .actrc" -ForegroundColor Red }
if (Test-Path "deploy-with-act.ps1") { Write-Host "✓ deploy-with-act.ps1" -ForegroundColor Green } else { Write-Host "✗ deploy-with-act.ps1" -ForegroundColor Red }
if (Test-Path "act-secrets.template") { Write-Host "✓ act-secrets.template" -ForegroundColor Green } else { Write-Host "✗ act-secrets.template" -ForegroundColor Red }

Write-Host "`nAct setup complete! Try: ./deploy-with-act.ps1 -RunPRValidation" -ForegroundColor Green 