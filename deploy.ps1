# Vitae Website Deployment Script (PowerShell)
# This script automates the deployment of the Vitae landing page using Terraform and Firebase

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('local', 'prod')]
    [string]$Environment = 'local',
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$Region = 'us-central1',
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTerraform,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipFirebase,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployFunctionsOnly
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

# Function to read project ID from terraform configuration
function Get-TerraformProjectId {
    $tfvarsPath = "terraform/terraform.tfvars"
    if (Test-Path $tfvarsPath) {
        try {
            $content = Get-Content -Path $tfvarsPath -Raw
            if ($content -match 'project_id\s*=\s*"([^"]+)"') {
                return $matches[1]
            }
        }
        catch {
            Write-Warning "Could not read project_id from terraform.tfvars: $($_.Exception.Message)"
        }
    }
    return $null
}

# Function to update Firebase project configuration
function Update-FirebaseProjectConfig {
    param([string]$ProjectId)
    
    $firebaseRcPath = ".firebaserc"
    if (Test-Path $firebaseRcPath) {
        try {
            $config = Get-Content -Path $firebaseRcPath -Raw | ConvertFrom-Json
            if ($config.projects.prod -ne $ProjectId) {
                Write-Status "Updating Firebase project configuration to use: $ProjectId"
                $config.projects.prod = $ProjectId
                $config | ConvertTo-Json -Depth 10 | Set-Content -Path $firebaseRcPath -Encoding UTF8
                Write-Success "Updated .firebaserc with correct production project ID"
            }
        }
        catch {
            Write-Warning "Could not update .firebaserc: $($_.Exception.Message)"
        }
    }
}

# Check for required tools
$requiredTools = @{
    'Node.js' = { Test-Command 'node' }
    'npm' = { Test-Command 'npm' }
    'Firebase CLI' = { Test-Command 'firebase' }
}

if ($Environment -eq 'prod') {
    $requiredTools['Google Cloud SDK'] = { Test-Command 'gcloud' }
    if (-not $SkipTerraform) {
        $requiredTools['Terraform'] = { Test-Command 'terraform' }
    }
}

$missingTools = @()
foreach ($tool in $requiredTools.GetEnumerator()) {
    if (-not (& $tool.Value)) {
        $missingTools += $tool.Key
    }
}

if ($missingTools.Count -gt 0) {
    Write-Error "The following required tools are missing:"
    $missingTools | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    Write-Host "`nPlease install the missing tools and try again."
    exit 1
}

# Function to run a command and handle errors
function Invoke-Command {
    param(
        [string]$Command,
        [string]$ErrorMessage,
        [string]$WorkingDirectory = $null
    )
    
    $originalLocation = $null
    if ($WorkingDirectory) {
        $originalLocation = Get-Location
        Set-Location -Path $WorkingDirectory
    }
    
    try {
        Write-Status "Running: $Command"
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            throw "Command exited with code $LASTEXITCODE"
        }
    }
    catch {
        Write-Error "$ErrorMessage"
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }
    finally {
        if ($originalLocation) {
            Set-Location -Path $originalLocation
        }
    }
}

# Function to deploy Firebase Functions
function Deploy-FirebaseFunctions {
    param([string]$Environment)
    
    Write-Status "Installing Firebase Functions dependencies..."
    Invoke-Command -Command "npm install" -ErrorMessage "Failed to install functions dependencies" -WorkingDirectory "functions"
    
    Write-Status "Deploying Firebase Functions for environment: $Environment"
    if ($Environment -eq 'prod') {
        Invoke-Command -Command "firebase use prod" -ErrorMessage "Failed to switch to production Firebase project"
        Invoke-Command -Command "firebase deploy --only functions" -ErrorMessage "Failed to deploy Firebase Functions to production"
    } else {
        Invoke-Command -Command "firebase use default" -ErrorMessage "Failed to switch to default Firebase project"
        Write-Status "Starting Firebase emulators in background..."
        
        # Start emulators in a new PowerShell window
        $emulatorCommand = "Write-Host 'Firebase Emulators Starting...' -ForegroundColor Yellow; Write-Host 'Press Ctrl+C in this window to stop the emulators.' -ForegroundColor Yellow; firebase emulators:start"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $emulatorCommand -WindowStyle Normal
        
        # Wait a moment for emulators to start
        Write-Status "Waiting for emulators to initialize..."
        Start-Sleep -Seconds 5
        Write-Success "Firebase emulators started in separate window"
    }
}

# Function to deploy Firebase Hosting
function Deploy-FirebaseHosting {
    param([string]$Environment)
    
    Write-Status "Deploying Firebase Hosting for environment: $Environment"
    if ($Environment -eq 'prod') {
        Invoke-Command -Command "firebase use prod" -ErrorMessage "Failed to switch to production Firebase project"
        Invoke-Command -Command "firebase deploy --only hosting" -ErrorMessage "Failed to deploy Firebase Hosting to production"
    } else {
        Write-Status "Firebase Hosting will be served via emulators for local development"
    }
}

# Function to deploy Firestore rules
function Deploy-FirestoreRules {
    param([string]$Environment)
    
    Write-Status "Deploying Firestore rules for environment: $Environment"
    if ($Environment -eq 'prod') {
        Invoke-Command -Command "firebase use prod" -ErrorMessage "Failed to switch to production Firebase project"
        Invoke-Command -Command "firebase deploy --only firestore" -ErrorMessage "Failed to deploy Firestore rules to production"
    } else {
        Write-Status "Firestore rules will be used via emulators for local development"
    }
}

# Function to deploy Terraform infrastructure
function Deploy-TerraformInfrastructure {
    param([string]$Environment, [string]$ProjectId, [string]$Region)
    
    Write-Status "Deploying Terraform infrastructure for environment: $Environment"
    
    $originalLocation = Get-Location
    try {
        Set-Location -Path "terraform"
        
        # Initialize Terraform
        Invoke-Command -Command "terraform init" -ErrorMessage "Failed to initialize Terraform"
        
        if ($Environment -eq 'prod') {
            # Use existing terraform.tfvars if it exists, otherwise create one
            if (-not (Test-Path "terraform.tfvars")) {
                # Create terraform.tfvars for production
                $tfvarsContent = @"
project_id = "$ProjectId"
region = "$Region"
environment = "prod"
website_source_dir = "../src"
bucket_name = "vitae-website-prod"
enable_load_balancer = false
enable_ssl = false
enable_versioning = true
"@
                $tfvarsContent | Out-File -FilePath "terraform.tfvars" -Encoding UTF8
                Write-Status "Created terraform.tfvars with project ID: $ProjectId"
            } else {
                Write-Status "Using existing terraform.tfvars configuration"
            }
            
            # Plan and apply
            Invoke-Command -Command "terraform plan" -ErrorMessage "Failed to plan Terraform deployment"
            Invoke-Command -Command "terraform apply -auto-approve" -ErrorMessage "Failed to apply Terraform deployment"
        } else {
            Write-Status "Skipping Terraform deployment for local environment"
        }
    }
    finally {
        Set-Location -Path $originalLocation
    }
}

# Function to update script.js with the correct Firebase Function URL
function Update-ScriptWithFunctionUrl {
    param([string]$Environment, [string]$ProjectId)
    
    if ($Environment -eq 'prod') {
        Write-Status "Updating script.js with production Firebase Function URL..."
        
        # Construct the Firebase Function URL using the project ID
        $functionUrl = "https://$Region-$ProjectId.cloudfunctions.net/handleWaitlistSubmission"
        
        $scriptJsPath = "src/script.js"
        if (Test-Path $scriptJsPath) {
            $scriptJsContent = Get-Content -Path $scriptJsPath -Raw
            # Replace the function URL assignment
            $pattern = "const functionUrl = window\.location\.hostname === 'localhost'[^;]+;"
            $replacement = "const functionUrl = window.location.hostname === 'localhost' ? 'http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission' : '$functionUrl';"
            $updatedContent = $scriptJsContent -replace $pattern, $replacement
            $updatedContent | Set-Content -Path $scriptJsPath -Encoding UTF8
            Write-Success "Updated script.js with production function URL: $functionUrl"
        }
    } else {
        Write-Status "Updating script.js for local development environment..."
        $scriptJsPath = "src/script.js"
        if (Test-Path $scriptJsPath) {
            $scriptJsContent = Get-Content -Path $scriptJsPath -Raw
            $localUrl = "http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission"
            $productionUrl = "https://us-central1-vitae-460717.cloudfunctions.net/handleWaitlistSubmission"
            # Ensure both local and production URLs are set correctly for development
            $pattern = "const functionUrl = window\.location\.hostname === 'localhost'[^;]+;"
            $replacement = "const functionUrl = window.location.hostname === 'localhost' ? '$localUrl' : '$productionUrl';"
            $updatedContent = $scriptJsContent -replace $pattern, $replacement
            $updatedContent | Set-Content -Path $scriptJsPath -Encoding UTF8
            Write-Success "Updated script.js with local function URL: $localUrl"
        }
    }
}

# Main deployment logic
Write-Host "Starting deployment for environment: $Environment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

if ($Environment -eq 'prod') {
    # Get project ID from terraform config if not provided
    if (-not $ProjectId) {
        $terraformProjectId = Get-TerraformProjectId
        if ($terraformProjectId) {
            $ProjectId = $terraformProjectId
            Write-Status "Using project ID from terraform.tfvars: $ProjectId"
        } else {
            $ProjectId = Read-Host "Enter your Google Cloud project ID"
        }
    }
    
    # Update Firebase project configuration to match the detected/specified project ID
    Update-FirebaseProjectConfig -ProjectId $ProjectId
    
    Write-Status "Production deployment configuration:"
    Write-Host "  Project ID: $ProjectId" -ForegroundColor Cyan
    Write-Host "  Region: $Region" -ForegroundColor Cyan
    Write-Host "  Skip Terraform: $SkipTerraform" -ForegroundColor Cyan
    Write-Host "  Skip Firebase: $SkipFirebase" -ForegroundColor Cyan
    Write-Host "  Functions Only: $DeployFunctionsOnly" -ForegroundColor Cyan
    
    # Authenticate with Google Cloud
    Write-Status "Ensuring Google Cloud authentication..."
    try {
        $currentProject = gcloud config get-value project 2>$null
        if ($currentProject -ne $ProjectId) {
            Invoke-Command -Command "gcloud config set project $ProjectId" -ErrorMessage "Failed to set Google Cloud project"
        }
        Invoke-Command -Command "gcloud auth application-default login" -ErrorMessage "Failed to authenticate with Google Cloud"
    }
    catch {
        Write-Warning "Google Cloud authentication may be required. Please run 'gcloud auth login' manually if needed."
    }
    
    # Deploy components based on flags
    if (-not $SkipFirebase) {
        if ($DeployFunctionsOnly) {
            Deploy-FirebaseFunctions -Environment $Environment
        } else {
            # Deploy all Firebase components
            Deploy-FirebaseFunctions -Environment $Environment
            Deploy-FirestoreRules -Environment $Environment
            Update-ScriptWithFunctionUrl -Environment $Environment -ProjectId $ProjectId
            Deploy-FirebaseHosting -Environment $Environment
        }
    }
    
    if (-not $SkipTerraform -and -not $DeployFunctionsOnly) {
        Deploy-TerraformInfrastructure -Environment $Environment -ProjectId $ProjectId -Region $Region
    }
    
} else {
    # Local development setup
    Write-Status "Setting up local development environment..."
    
    # Update script.js for local development
    Update-ScriptWithFunctionUrl -Environment $Environment -ProjectId ""
    
    # Start Firebase emulators
    if (-not $SkipFirebase) {
        Deploy-FirebaseFunctions -Environment $Environment
    }
    
    Write-Success "Local development environment setup complete!"
}

# Print deployment summary
Write-Host "`n=================================================" -ForegroundColor Green
Write-Host "Deployment Summary:" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

if ($Environment -eq 'local') {
    Write-Success "Local development environment is ready!"
    Write-Host "`nFirebase Emulators are running in a separate window" -ForegroundColor Yellow
    Write-Host "Firebase Emulator UI: http://localhost:4001" -ForegroundColor Cyan
    Write-Host "Website (hosting): http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Cloud Function endpoint: http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission" -ForegroundColor Cyan
    Write-Host "Firestore emulator: http://localhost:8081" -ForegroundColor Cyan
    Write-Host "`nTo use the development environment:" -ForegroundColor Yellow
    Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host "2. Open http://localhost:4001 for Firebase UI" -ForegroundColor White
    Write-Host "3. Close the emulator window or press Ctrl+C to stop" -ForegroundColor White
} else {
    Write-Success "Production deployment completed successfully!"
    Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
    Write-Host "Region: $Region" -ForegroundColor Cyan
    
    if (-not $SkipFirebase) {
        Write-Host "Firebase Hosting URL: https://$ProjectId.web.app" -ForegroundColor Cyan
        Write-Host "Firebase Functions URL: https://$Region-$ProjectId.cloudfunctions.net/handleWaitlistSubmission" -ForegroundColor Cyan
        Write-Host "Firestore Console: https://console.firebase.google.com/project/$ProjectId/firestore" -ForegroundColor Cyan
    }
    
    if (-not $SkipTerraform) {
        Write-Host "Terraform resources deployed to GCP" -ForegroundColor Cyan
    }
    
    Write-Host "`nYou can view your deployed resources in the Google Cloud Console:" -ForegroundColor Yellow
    Write-Host "https://console.cloud.google.com/home/dashboard?project=$ProjectId" -ForegroundColor Cyan
}

Write-Success "`nDeployment completed successfully!" 