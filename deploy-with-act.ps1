# Enhanced Vitae Website Deployment Script with GitHub Actions Local Testing
# This script runs GitHub Actions locally using 'act' before deployment
#
# Usage:
#   ./deploy-with-act.ps1                    # Run PR validation + local deployment
#   ./deploy-with-act.ps1 -RunPRValidation   # Run only PR validation workflow
#   ./deploy-with-act.ps1 -RunProduction     # Run production workflow locally (testing only)
#   ./deploy-with-act.ps1 -SkipValidation    # Skip GitHub Actions, run deploy.ps1 directly

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('local', 'prod')]
    [string]$Environment = 'local',
    
    [Parameter(Mandatory=$false)]
    [switch]$RunPRValidation,
    
    [Parameter(Mandatory=$false)]
    [switch]$RunProduction,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipValidation,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDeployment,
    
    [Parameter(Mandatory=$false)]
    [string]$WorkflowFile,
    
    # Pass-through parameters for deploy.ps1
    [Parameter(Mandatory=$false)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-central1',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTerraform,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipFirebase,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployFunctionsOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipEmulatorCleanup,
    
    [Parameter(Mandatory=$false)]
    [switch]$ConfirmBreakGlass
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[ACT-INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[ACT-SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[ACT-WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ACT-ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

# Function to setup act
function Initialize-Act {
    Write-Status "Setting up act for local GitHub Actions execution..."
    
    # Check if act is available
    try {
        function act { & "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\nektos.act_Microsoft.Winget.Source_8wekyb3d8bbwe\act.exe" @args }
        $actVersion = act --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Act is available: $actVersion"
        } else {
            throw "Act command failed"
        }
    }
    catch {
        Write-Error "Act is not installed or not working properly."
        Write-Host "Please install act using: winget install nektos.act" -ForegroundColor Yellow
        exit 1
    }
    
    # Check if Docker is running
    if (-not (Test-DockerRunning)) {
        Write-Error "Docker is not running. Act requires Docker to run GitHub Actions locally."
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Success "Docker is running and ready for act"
    
    # Check for secrets file
    if (-not (Test-Path ".env.act")) {
        Write-Warning "Secrets file .env.act not found."
        Write-Host "Creating .env.act from template..." -ForegroundColor Yellow
        
        if (Test-Path "act-secrets.template") {
            Copy-Item "act-secrets.template" ".env.act"
            Write-Warning "Please edit .env.act and add your actual secrets before running workflows that need them."
        } else {
            Write-Warning "Please create .env.act file with your secrets. See act-secrets.template for reference."
        }
    }
}

# Function to run GitHub Actions workflow locally
function Invoke-ActWorkflow {
    param(
        [string]$WorkflowName,
        [string]$Event = "push",
        [hashtable]$AdditionalArgs = @{}
    )
    
    Write-Status "Running GitHub Actions workflow locally: $WorkflowName"
    Write-Host "Event: $Event" -ForegroundColor Cyan
    
    # Build act command
    $actArgs = @()
    $actArgs += $Event
    
    if ($WorkflowName) {
        $actArgs += "--workflows"
        $actArgs += ".github/workflows/$WorkflowName"
    }
    
    # Add additional arguments
    foreach ($key in $AdditionalArgs.Keys) {
        $actArgs += $key
        if ($AdditionalArgs[$key]) {
            $actArgs += $AdditionalArgs[$key]
        }
    }
    
    Write-Status "Running: act $($actArgs -join ' ')"
    
    try {
        & act @actArgs
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Workflow '$WorkflowName' completed successfully!"
            return $true
        } else {
            Write-Error "Workflow '$WorkflowName' failed with exit code $LASTEXITCODE"
            return $false
        }
    }
    catch {
        Write-Error "Failed to run workflow '$WorkflowName': $($_.Exception.Message)"
        return $false
    }
}

# Function to run PR validation workflow
function Invoke-PRValidation {
    Write-Status "Running PR validation workflow locally..."
    
    $additionalArgs = @{
        "--env-file" = ".env.act"
    }
    
    return Invoke-ActWorkflow -WorkflowName "pr-validation.yml" -Event "pull_request" -AdditionalArgs $additionalArgs
}

# Function to run production deployment workflow (for testing only)
function Invoke-ProductionWorkflow {
    Write-Status "Running production deployment workflow locally (TESTING ONLY - no actual deployment)..."
    Write-Warning "This will test the workflow but won't actually deploy to production."
    
    $additionalArgs = @{
        "--env-file" = ".env.act"
        "--dry-run" = $null
    }
    
    return Invoke-ActWorkflow -WorkflowName "deploy-production.yml" -Event "push" -AdditionalArgs $additionalArgs
}

# Function to run custom workflow
function Invoke-CustomWorkflow {
    param([string]$WorkflowFile)
    
    Write-Status "Running custom workflow: $WorkflowFile"
    
    if (-not (Test-Path ".github/workflows/$WorkflowFile")) {
        Write-Error "Workflow file not found: .github/workflows/$WorkflowFile"
        return $false
    }
    
    return Invoke-ActWorkflow -WorkflowName $WorkflowFile -Event "workflow_dispatch"
}

# Main execution logic
Write-Host "Enhanced Vitae Deployment with GitHub Actions Local Testing" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green

# Display usage if help requested
if ($PSBoundParameters.ContainsKey('?') -or $args -contains '-?' -or $args -contains '-help' -or $args -contains '--help') {
    Write-Host "`nEnhanced Vitae Deployment Script Usage:" -ForegroundColor Green
    Write-Host "=======================================" -ForegroundColor Green
    Write-Host "`nRun PR validation + local deployment (recommended):" -ForegroundColor Yellow
    Write-Host "  ./deploy-with-act.ps1" -ForegroundColor White
    Write-Host "`nRun only PR validation workflow:" -ForegroundColor Yellow
    Write-Host "  ./deploy-with-act.ps1 -RunPRValidation" -ForegroundColor White
    Write-Host "`nTest production workflow locally (no actual deployment):" -ForegroundColor Yellow
    Write-Host "  ./deploy-with-act.ps1 -RunProduction" -ForegroundColor White
    Write-Host "`nRun custom workflow:" -ForegroundColor Yellow
    Write-Host "  ./deploy-with-act.ps1 -WorkflowFile 'workflow-name.yml'" -ForegroundColor White
    Write-Host "`nSkip GitHub Actions validation:" -ForegroundColor Yellow
    Write-Host "  ./deploy-with-act.ps1 -SkipValidation" -ForegroundColor White
    Write-Host "`nRun only GitHub Actions (no deployment):" -ForegroundColor Yellow
    Write-Host "  ./deploy-with-act.ps1 -SkipDeployment" -ForegroundColor White
    Write-Host "`nAll deploy.ps1 parameters are also supported:" -ForegroundColor Green
    Write-Host "  -Environment, -ProjectId, -Region, -SkipTerraform, etc." -ForegroundColor White
    exit 0
}

# Initialize act
if (-not $SkipValidation) {
    Initialize-Act
}

$workflowSuccess = $true

# Run GitHub Actions workflows based on parameters
if (-not $SkipValidation) {
    if ($RunPRValidation) {
        Write-Status "Running PR validation workflow only..."
        $workflowSuccess = Invoke-PRValidation
    }
    elseif ($RunProduction) {
        Write-Status "Running production workflow for testing only..."
        $workflowSuccess = Invoke-ProductionWorkflow
    }
    elseif ($WorkflowFile) {
        Write-Status "Running custom workflow: $WorkflowFile"
        $workflowSuccess = Invoke-CustomWorkflow -WorkflowFile $WorkflowFile
    }
    else {
        Write-Status "Running default PR validation before deployment..."
        $workflowSuccess = Invoke-PRValidation
    }
    
    if (-not $workflowSuccess) {
        Write-Error "GitHub Actions workflow failed. Stopping deployment."
        Write-Host "Fix the issues shown above and try again." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Success "All GitHub Actions workflows passed!"
}

# Run actual deployment if not skipped
if (-not $SkipDeployment) {
    Write-Status "GitHub Actions validation passed. Running actual deployment..."
    
    # Build arguments for deploy.ps1
    $deployArgs = @()
    $deployArgs += $Environment
    
    if ($ProjectId) { $deployArgs += "-ProjectId"; $deployArgs += $ProjectId }
    if ($Region -ne 'us-central1') { $deployArgs += "-Region"; $deployArgs += $Region }
    if ($SkipTerraform) { $deployArgs += "-SkipTerraform" }
    if ($SkipFirebase) { $deployArgs += "-SkipFirebase" }
    if ($DeployFunctionsOnly) { $deployArgs += "-DeployFunctionsOnly" }
    if ($SkipEmulatorCleanup) { $deployArgs += "-SkipEmulatorCleanup" }
    if ($ConfirmBreakGlass) { $deployArgs += "-ConfirmBreakGlass" }
    
    Write-Status "Running: ./deploy.ps1 $($deployArgs -join ' ')"
    
    try {
        & "./deploy.ps1" @deployArgs
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Deployment completed successfully!"
        } else {
            Write-Error "Deployment failed with exit code $LASTEXITCODE"
            exit 1
        }
    }
    catch {
        Write-Error "Failed to run deployment: $($_.Exception.Message)"
        exit 1
    }
} else {
    Write-Status "Deployment skipped as requested."
}

# Final summary
Write-Host "`n=============================================================" -ForegroundColor Green
Write-Host "Enhanced Deployment Summary:" -ForegroundColor Green
Write-Host "=============================================================" -ForegroundColor Green

if (-not $SkipValidation) {
    Write-Success "✅ GitHub Actions workflows validated locally"
}

if (-not $SkipDeployment) {
    Write-Success "✅ Deployment completed"
    
    if ($Environment -eq 'local') {
        Write-Host "`nLocal Development URLs:" -ForegroundColor Green
        Write-Host "Website: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Firebase Emulator UI: http://localhost:4001" -ForegroundColor Cyan
    }
} else {
    Write-Success "✅ GitHub Actions validation completed (deployment skipped)"
}

Write-Success "`nAll operations completed successfully!"
Write-Host "`nNext time you can run:" -ForegroundColor Yellow
Write-Host "  ./deploy-with-act.ps1                 # Full validation + deployment" -ForegroundColor White
Write-Host "  ./deploy-with-act.ps1 -RunPRValidation # Just run PR validation" -ForegroundColor White
Write-Host "  ./deploy-with-act.ps1 -SkipValidation  # Skip validation, deploy only" -ForegroundColor White 