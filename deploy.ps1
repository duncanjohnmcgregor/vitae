# Vitae Website Deployment Script (PowerShell)
# This script automates the deployment of the Vitae landing page using Terraform

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('local', 'prod')]
    [string]$Environment = 'local',
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-central1'
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if a command exists
function Test-Command {
    param($Command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'stop'
    try { if (Get-Command $Command) { return $true } }
    catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
}

# Check for required tools
$requiredTools = @{
    'Node.js' = { Test-Command 'node' }
    'npm' = { Test-Command 'npm' }
    'Firebase CLI' = { Test-Command 'firebase' }
}

if ($Environment -eq 'prod') {
    $requiredTools['Google Cloud SDK'] = { Test-Command 'gcloud' }
    $requiredTools['Terraform'] = { Test-Command 'terraform' }
}

$missingTools = @()
foreach ($tool in $requiredTools.GetEnumerator()) {
    if (-not (& $tool.Value)) {
        $missingTools += $tool.Key
    }
}

if ($missingTools.Count -gt 0) {
    Write-Host "The following required tools are missing:"
    $missingTools | ForEach-Object { Write-Host "- $_" }
    Write-Host "`nPlease install the missing tools and try again."
    exit 1
}

# Function to run a script and handle errors
function Invoke-Script {
    param(
        [string]$ScriptPath,
        [string]$ErrorMessage
    )
    
    try {
        & $ScriptPath
        if ($LASTEXITCODE -ne 0) {
            throw "Script exited with code $LASTEXITCODE"
        }
    }
    catch {
        Write-Host "Error: $ErrorMessage"
        Write-Host $_.Exception.Message
        exit 1
    }
}

# Main deployment logic
Write-Host "Starting deployment for environment: $Environment" -ForegroundColor Green

if ($Environment -eq 'local') {
    Write-Host "`nSetting up local development environment..." -ForegroundColor Yellow
    Invoke-Script -ScriptPath ".\terraform\setup-local.ps1" -ErrorMessage "Failed to set up local environment"
}
else {
    Write-Host "`nDeploying to production..." -ForegroundColor Yellow
    
    # Validate production parameters
    if (-not $ProjectId) {
        $ProjectId = Read-Host "Enter your Google Cloud project ID"
    }
    
    # Set environment variables for the deployment script
    $env:PROJECT_ID = $ProjectId
    $env:REGION = $Region
    
    # Run the production deployment script
    Invoke-Script -ScriptPath ".\terraform\deploy-function.ps1" -ErrorMessage "Failed to deploy to production"
    
    # Deploy the website using Terraform
    Write-Host "`nDeploying website infrastructure..." -ForegroundColor Yellow
    try {
        Set-Location -Path ".\terraform"
        terraform init
        if ($LASTEXITCODE -ne 0) { throw "Terraform init failed" }
        
        terraform apply -auto-approve
        if ($LASTEXITCODE -ne 0) { throw "Terraform apply failed" }
        Set-Location -Path ".."
    }
    catch {
        Write-Host "Error: Failed to deploy website infrastructure"
        Write-Host $_.Exception.Message
        exit 1
    }
}

# Print deployment summary
Write-Host "`nDeployment Summary:" -ForegroundColor Green
if ($Environment -eq 'local') {
    Write-Host "Local development environment is ready!"
    Write-Host "Firebase Emulator UI: http://localhost:4000"
    Write-Host "Cloud Function endpoint: http://localhost:5001/vitae-local/us-central1/waitlist-submission"
    Write-Host "Firestore emulator: http://localhost:8080"
    Write-Host "`nPress Ctrl+C to stop the emulators."
}
else {
    Write-Host "Production deployment completed successfully!"
    Write-Host "Project ID: $ProjectId"
    Write-Host "Region: $Region"
    Write-Host "`nYou can view your deployed resources in the Google Cloud Console:"
    Write-Host "https://console.cloud.google.com/home/dashboard?project=$ProjectId"
}

Write-Host "`nDeployment completed successfully!" -ForegroundColor Green 