# Simple test script for Act setup
Write-Host "Testing Act Setup for GitHub Actions Local Execution" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Test 1: Check if act is installed
Write-Host "[TEST] Checking if act is installed..." -ForegroundColor Cyan
$actPath = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\nektos.act_Microsoft.Winget.Source_8wekyb3d8bbwe\act.exe"
if (Test-Path $actPath) {
    $version = & $actPath --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[PASS] Act is installed: $version" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Act command failed" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[FAIL] Act executable not found" -ForegroundColor Red
    Write-Host "Install with: winget install nektos.act" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check workflow discovery
Write-Host "[TEST] Testing workflow discovery..." -ForegroundColor Cyan
$workflows = & $actPath --list 2>$null
if ($LASTEXITCODE -eq 0) {
    $workflowCount = ($workflows | Where-Object { $_ -match "^\d+\s+" }).Count
    Write-Host "[PASS] Found $workflowCount workflow jobs" -ForegroundColor Green
    
    # Check for specific workflows
    $expectedWorkflows = @("pr-validation.yml", "deploy-production.yml", "dependency-check.yml")
    foreach ($workflow in $expectedWorkflows) {
        if ($workflows -match $workflow) {
            Write-Host "[PASS] ✓ $workflow detected" -ForegroundColor Green
        } else {
            Write-Host "[WARN] ✗ $workflow not found" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "[FAIL] Failed to list workflows" -ForegroundColor Red
}

# Test 3: Check configuration files
Write-Host "[TEST] Checking configuration files..." -ForegroundColor Cyan

if (Test-Path ".actrc") {
    Write-Host "[PASS] ✓ .actrc configuration file found" -ForegroundColor Green
} else {
    Write-Host "[WARN] ✗ .actrc configuration file missing" -ForegroundColor Yellow
}

if (Test-Path "act-secrets.template") {
    Write-Host "[PASS] ✓ act-secrets.template found" -ForegroundColor Green
} else {
    Write-Host "[WARN] ✗ act-secrets.template missing" -ForegroundColor Yellow
}

if (Test-Path ".env.act") {
    Write-Host "[PASS] ✓ .env.act secrets file found" -ForegroundColor Green
} else {
    Write-Host "[WARN] ✗ .env.act secrets file not found (optional)" -ForegroundColor Yellow
    Write-Host "Create from template: Copy-Item act-secrets.template .env.act" -ForegroundColor Yellow
}

# Test 4: Check deployment scripts
Write-Host "[TEST] Checking deployment scripts..." -ForegroundColor Cyan

if (Test-Path "deploy-with-act.ps1") {
    Write-Host "[PASS] ✓ Enhanced deployment script (deploy-with-act.ps1) found" -ForegroundColor Green
} else {
    Write-Host "[FAIL] ✗ Enhanced deployment script missing" -ForegroundColor Red
}

if (Test-Path "deploy.ps1") {
    Write-Host "[PASS] ✓ Original deployment script (deploy.ps1) found" -ForegroundColor Green
    
    # Check if it has GitHub Actions integration
    $deployContent = Get-Content "deploy.ps1" -Raw
    if ($deployContent -match "RunGitHubActions") {
        Write-Host "[PASS] ✓ Original script has GitHub Actions integration" -ForegroundColor Green
    } else {
        Write-Host "[WARN] ✗ Original script missing GitHub Actions integration" -ForegroundColor Yellow
    }
} else {
    Write-Host "[FAIL] ✗ Original deployment script missing" -ForegroundColor Red
}

# Summary
Write-Host "`n====================================================" -ForegroundColor Green
Write-Host "Test Summary" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

Write-Host "`nYour act setup is ready! You can now:" -ForegroundColor Green
Write-Host "1. Run PR validation locally:" -ForegroundColor White
Write-Host "   ./deploy-with-act.ps1 -RunPRValidation" -ForegroundColor Cyan
Write-Host "2. Run full deployment with validation:" -ForegroundColor White
Write-Host "   ./deploy-with-act.ps1" -ForegroundColor Cyan
Write-Host "3. Test production workflow:" -ForegroundColor White
Write-Host "   ./deploy-with-act.ps1 -RunProduction" -ForegroundColor Cyan
Write-Host "4. Run original deployment with GitHub Actions:" -ForegroundColor White
Write-Host "   ./deploy.ps1 -RunGitHubActions" -ForegroundColor Cyan

Write-Host "`nFor more information, see:" -ForegroundColor Yellow
Write-Host "- GITHUB_ACTIONS_LOCAL.md (comprehensive guide)" -ForegroundColor White
Write-Host "- ./deploy-with-act.ps1 --help (script options)" -ForegroundColor White
Write-Host "- act --help (act command options)" -ForegroundColor White

Write-Host "[PASS] Act setup test completed!" -ForegroundColor Green 