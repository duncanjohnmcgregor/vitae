# Vitae Website Deployment Script (PowerShell)
# This script automates the deployment of the Vitae landing page using Terraform and Firebase
#
# IMPORTANT: Production deployment via this script is for BREAK-GLASS/EMERGENCY use only!
# 
# Normal deployment workflow:
# 1. Create a feature branch: git checkout -b feature/your-feature
# 2. Make your changes and commit them
# 3. Push the branch: git push origin feature/your-feature  
# 4. Open a Pull Request on GitHub
# 5. After review and approval, merge the PR into main
# 6. GitHub Actions will automatically deploy to production
#
# Only use 'prod' parameter in emergency situations when:
# - GitHub Actions is down
# - Critical hotfix needed immediately
# - CI/CD pipeline is broken and needs immediate bypass

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
    [switch]$DeployFunctionsOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipEmulatorCleanup,
    
    [Parameter(Mandatory=$false)]
    [switch]$ConfirmBreakGlass
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Display usage information if help requested
if ($PSBoundParameters.ContainsKey('?') -or $args -contains '-?' -or $args -contains '-help' -or $args -contains '--help') {
    Write-Host "`nVitae Deployment Script Usage:" -ForegroundColor Green
    Write-Host "==============================" -ForegroundColor Green
    Write-Host "`nFor local development (recommended):" -ForegroundColor Yellow
    Write-Host "  ./deploy.ps1" -ForegroundColor White
    Write-Host "  ./deploy.ps1 local" -ForegroundColor White
    Write-Host "`nFor EMERGENCY production deployment only:" -ForegroundColor Red
    Write-Host "  ./deploy.ps1 prod -ConfirmBreakGlass" -ForegroundColor Red
    Write-Host "`nNormal production deployment should use GitHub workflow:" -ForegroundColor Green
    Write-Host "  1. Create branch, make changes, push" -ForegroundColor White
    Write-Host "  2. Open Pull Request" -ForegroundColor White
    Write-Host "  3. Merge after review - auto-deploys via GitHub Actions" -ForegroundColor White
    Write-Host "`nParameters:" -ForegroundColor Yellow
    Write-Host "  -Environment: 'local' (default) or 'prod'" -ForegroundColor White
    Write-Host "  -ConfirmBreakGlass: Required for prod deployment" -ForegroundColor White
    Write-Host "  -ProjectId: GCP project ID (auto-detected if not provided)" -ForegroundColor White
    Write-Host "  -SkipTerraform: Skip Terraform deployment" -ForegroundColor White
    Write-Host "  -SkipFirebase: Skip Firebase deployment" -ForegroundColor White
    Write-Host "  -DeployFunctionsOnly: Deploy only Firebase Functions" -ForegroundColor White
    exit 0
}

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

# Function to stop existing Firebase emulator processes
function Stop-FirebaseEmulators {
    Write-Status "Checking for existing Firebase emulator processes..."
    
    # Detect the right firebase command to use
    $localFirebaseCmd = if ($env:CI -eq 'true' -or $env:GITHUB_ACTIONS -eq 'true') { "npx firebase" } else { "firebase" }
    
    try {
        # Stop Firebase emulators using the CLI (most reliable method)
        $output = & $localFirebaseCmd emulators:exec --help 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Attempting to stop Firebase emulators gracefully..."
            & $localFirebaseCmd emulators:exec "echo 'Stopping emulators...'" 2>$null
        }
    }
    catch {
        # Ignore errors from firebase command
    }
    
    # Kill Firebase-related processes
    $processesToKill = @(
        "firebase",
        "java"  # Firestore emulator often runs on Java
    )
    
    $killedAny = $false
    foreach ($processName in $processesToKill) {
        try {
            $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
            if ($processes) {
                Write-Status "Stopping existing $processName processes..."
                $processes | Stop-Process -Force -ErrorAction SilentlyContinue
                $killedAny = $true
            }
        }
        catch {
            # Ignore errors - process might not exist
        }
    }
    
    # Also kill Node.js processes that might be running Firebase Functions
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*firebase*" -or 
            $_.CommandLine -like "*functions-framework*" -or
            $_.CommandLine -like "*emulator*"
        }
        if ($nodeProcesses) {
            Write-Status "Stopping Firebase-related Node.js processes..."
            $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
            $killedAny = $true
        }
    }
    catch {
        # Get-Process might not support CommandLine property on all systems
        # Try alternative approach
        try {
            $allNodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
            if ($allNodeProcesses) {
                # Kill all node processes as a fallback (less precise but effective)
                Write-Warning "Stopping all Node.js processes (some may be unrelated to Firebase)..."
                $allNodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
                $killedAny = $true
            }
        }
        catch {
            # Ignore if this fails too
        }
    }
    
    # Wait a moment for processes to fully terminate
    if ($killedAny) {
        Write-Status "Waiting for processes to terminate..."
        Start-Sleep -Seconds 3
        Write-Success "Existing emulator processes stopped"
    } else {
        Write-Status "No existing emulator processes found"
    }
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
$isCI = $env:CI -eq 'true' -or $env:GITHUB_ACTIONS -eq 'true'

$requiredTools = @{
    'Node.js' = { Test-Command 'node' }
    'npm' = { Test-Command 'npm' }
}

# Firebase CLI check - in CI it's installed via npm, so check for npx availability
if ($isCI) {
    $requiredTools['Firebase CLI (npx)'] = { Test-Command 'npx' }
} else {
    $requiredTools['Firebase CLI'] = { Test-Command 'firebase' }
}

if ($Environment -eq 'prod') {
    # In CI with service account auth, we don't need gcloud command
    if ($isCI -and $env:GOOGLE_APPLICATION_CREDENTIALS) {
        Write-Status "Running in CI with service account credentials - skipping gcloud requirement"
    } else {
        $requiredTools['Google Cloud SDK'] = { Test-Command 'gcloud' }
    }
    
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

# Set Firebase command based on environment
$firebaseCmd = if ($isCI) { "npx firebase" } else { "firebase" }

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
        Invoke-Command -Command "$firebaseCmd use prod" -ErrorMessage "Failed to switch to production Firebase project"
        Invoke-Command -Command "$firebaseCmd deploy --only functions" -ErrorMessage "Failed to deploy Firebase Functions to production"
    } else {
        Invoke-Command -Command "$firebaseCmd use default" -ErrorMessage "Failed to switch to default Firebase project"
        
        # Stop any existing emulator processes before starting new ones (unless skipped)
        if (-not $SkipEmulatorCleanup) {
            Stop-FirebaseEmulators
        } else {
            Write-Status "Skipping emulator cleanup (existing emulators may continue running)"
        }
        
        Write-Status "Starting Firebase emulators in background..."
        
        # Start emulators in a new PowerShell window
        $emulatorCommand = "Write-Host 'Firebase Emulators Starting...' -ForegroundColor Yellow; Write-Host 'Press Ctrl+C in this window to stop the emulators.' -ForegroundColor Yellow; $firebaseCmd emulators:start"
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
        Invoke-Command -Command "$firebaseCmd use prod" -ErrorMessage "Failed to switch to production Firebase project"
        Invoke-Command -Command "$firebaseCmd deploy --only hosting" -ErrorMessage "Failed to deploy Firebase Hosting to production"
    } else {
        Write-Status "Firebase Hosting will be served via emulators for local development"
    }
}

# Function to deploy Firestore rules
function Deploy-FirestoreRules {
    param([string]$Environment)
    
    Write-Status "Deploying Firestore rules for environment: $Environment"
    if ($Environment -eq 'prod') {
        Invoke-Command -Command "$firebaseCmd use prod" -ErrorMessage "Failed to switch to production Firebase project"
        Invoke-Command -Command "$firebaseCmd deploy --only firestore" -ErrorMessage "Failed to deploy Firestore rules to production"
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
            $localUrl = "http://127.0.0.1:5001/vitae-local/us-central1/handleWaitlistSubmission"
            $productionUrl = "https://us-central1-vitae-460717.cloudfunctions.net/handleWaitlistSubmission"
            # Ensure both local and production URLs are set correctly for development
            $pattern = "const functionUrl = window\.location\.hostname === 'localhost'[^;]+;"
            $replacement = "const functionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '$localUrl' : '$productionUrl';"
            $updatedContent = $scriptJsContent -replace $pattern, $replacement
            $updatedContent | Set-Content -Path $scriptJsPath -Encoding UTF8
            Write-Success "Updated script.js with local function URL: $localUrl"
        }
    }
}

# Function to update HTML files for local development
function Update-HtmlFilesForLocal {
    param([string]$Environment)
    
    if ($Environment -eq 'local') {
        Write-Status "Updating HTML files for local development..."
        
        # Get all HTML files in src directory
        $htmlFiles = Get-ChildItem -Path "src" -Filter "*.html"
        
        foreach ($htmlFile in $htmlFiles) {
            $htmlPath = $htmlFile.FullName
            $htmlContent = Get-Content -Path $htmlPath -Raw
            $updated = $false
            
            # Update start-your-story.html form submission URL
            if ($htmlFile.Name -eq "start-your-story.html") {
                $localStartStoryUrl = "http://127.0.0.1:5001/vitae-local/us-central1/handleStartStorySubmission"
                $productionStartStoryUrl = "https://us-central1-vitae-460717.cloudfunctions.net/handleStartStorySubmission"
                
                # Update the function URL in the script section
                $pattern = "const functionUrl = window\.location\.hostname === 'localhost'[^;]+;"
                $replacement = "const functionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '$localStartStoryUrl' : '$productionStartStoryUrl';"
                
                if ($htmlContent -match $pattern) {
                    $htmlContent = $htmlContent -replace $pattern, $replacement
                    $updated = $true
                }
            }
            
            # Save updated content if changes were made
            if ($updated) {
                $htmlContent | Set-Content -Path $htmlPath -Encoding UTF8
                Write-Success "Updated $($htmlFile.Name) for local development"
            }
        }
    } else {
        Write-Status "Updating HTML files for production environment..."
        
        # Get all HTML files in src directory
        $htmlFiles = Get-ChildItem -Path "src" -Filter "*.html"
        
        foreach ($htmlFile in $htmlFiles) {
            $htmlPath = $htmlFile.FullName
            $htmlContent = Get-Content -Path $htmlPath -Raw
            $updated = $false
            
            # Update start-your-story.html form submission URL for production
            if ($htmlFile.Name -eq "start-your-story.html") {
                $localStartStoryUrl = "http://127.0.0.1:5001/vitae-local/us-central1/handleStartStorySubmission"
                $productionStartStoryUrl = "https://$Region-$ProjectId.cloudfunctions.net/handleStartStorySubmission"
                
                # Update the function URL in the script section
                $pattern = "const functionUrl = window\.location\.hostname === 'localhost'[^;]+;"
                $replacement = "const functionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? '$localStartStoryUrl' : '$productionStartStoryUrl';"
                
                if ($htmlContent -match $pattern) {
                    $htmlContent = $htmlContent -replace $pattern, $replacement
                    $updated = $true
                }
            }
            
            # Save updated content if changes were made
            if ($updated) {
                $htmlContent | Set-Content -Path $htmlPath -Encoding UTF8
                Write-Success "Updated $($htmlFile.Name) for production environment"
            }
        }
    }
}

# Function to start local HTTP server for development
function Start-LocalHttpServer {
    Write-Status "Starting local HTTP server for website files..."
    
    # Check if Python is available
    if (Test-Command 'python') {
        Write-Status "Starting Python HTTP server on port 3000..."
        $serverCommand = "Write-Host 'Local HTTP Server Starting on http://localhost:3000' -ForegroundColor Yellow; Write-Host 'Press Ctrl+C in this window to stop the server.' -ForegroundColor Yellow; cd src; python -m http.server 3000"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverCommand -WindowStyle Normal
        Write-Success "Local HTTP server started in separate window"
    } elseif (Test-Command 'node') {
        # Fallback to Node.js http-server if available
        Write-Status "Python not found, checking for Node.js http-server..."
        try {
            # Try to install http-server globally if not present
            $output = npm list -g http-server 2>$null
            if ($LASTEXITCODE -ne 0) {
                Write-Status "Installing http-server globally..."
                npm install -g http-server
            }
            
            Write-Status "Starting Node.js HTTP server on port 3000..."
            $serverCommand = "Write-Host 'Local HTTP Server Starting on http://localhost:3000' -ForegroundColor Yellow; Write-Host 'Press Ctrl+C in this window to stop the server.' -ForegroundColor Yellow; cd src; npx http-server -p 3000"
            Start-Process powershell -ArgumentList "-NoExit", "-Command", $serverCommand -WindowStyle Normal
            Write-Success "Local HTTP server started in separate window"
        }
        catch {
            Write-Warning "Could not start Node.js HTTP server. Please manually serve the src/ directory on port 3000"
        }
    } else {
        Write-Warning "Neither Python nor Node.js found. Please manually serve the src/ directory on port 3000"
        Write-Host "You can use any static file server, for example:" -ForegroundColor Yellow
        Write-Host "  - Python: cd src && python -m http.server 3000" -ForegroundColor White
        Write-Host "  - Node.js: cd src && npx http-server -p 3000" -ForegroundColor White
    }
}

# Main deployment logic
Write-Host "Starting deployment for environment: $Environment" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

if ($Environment -eq 'prod') {
    # BREAK-GLASS WARNING FOR PRODUCTION DEPLOYMENT
    Write-Host "`n🚨 BREAK-GLASS PRODUCTION DEPLOYMENT WARNING 🚨" -ForegroundColor Red -BackgroundColor Yellow
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host "You are attempting to deploy directly to PRODUCTION!" -ForegroundColor Red
    Write-Host "`nThis script should ONLY be used in emergency situations!" -ForegroundColor Red
    Write-Host "`nNormal deployment process:" -ForegroundColor Yellow
    Write-Host "1. Create feature branch: git checkout -b feature/your-change" -ForegroundColor White
    Write-Host "2. Make changes and commit: git commit -am 'Your changes'" -ForegroundColor White
    Write-Host "3. Push branch: git push origin feature/your-change" -ForegroundColor White
    Write-Host "4. Open Pull Request on GitHub" -ForegroundColor White
    Write-Host "5. Get review and approval" -ForegroundColor White
    Write-Host "6. Merge PR - GitHub Actions deploys automatically" -ForegroundColor White
    Write-Host "`nOnly use this direct deployment for:" -ForegroundColor Yellow
    Write-Host "- GitHub Actions is down" -ForegroundColor Red
    Write-Host "- Critical emergency hotfix needed immediately" -ForegroundColor Red
    Write-Host "- CI/CD pipeline is broken and needs bypass" -ForegroundColor Red
    Write-Host "=================================================" -ForegroundColor Red
    
    if (-not $ConfirmBreakGlass) {
        Write-Host "`nTo proceed with emergency deployment, you must:" -ForegroundColor Yellow
        Write-Host "1. Add -ConfirmBreakGlass parameter to confirm this is an emergency" -ForegroundColor White
        Write-Host "2. Document the reason in your commit message" -ForegroundColor White
        Write-Host "3. Create a follow-up PR to track the emergency change" -ForegroundColor White
        Write-Host "`nExample: ./deploy.ps1 prod -ConfirmBreakGlass" -ForegroundColor Cyan
        Write-Host "`nAborting deployment for safety." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n⚠️  EMERGENCY DEPLOYMENT CONFIRMED ⚠️" -ForegroundColor Black -BackgroundColor Red
    $reason = Read-Host "`nPlease enter the emergency reason (this will be logged)"
    if ([string]::IsNullOrWhiteSpace($reason)) {
        Write-Host "Emergency reason is required. Aborting deployment." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`nEmergency reason: $reason" -ForegroundColor Yellow
    Write-Host "This deployment will be logged for audit purposes." -ForegroundColor Yellow
    
    $confirmation = Read-Host "`nType 'EMERGENCY' to confirm you want to proceed with break-glass deployment"
    if ($confirmation -ne 'EMERGENCY') {
        Write-Host "Confirmation failed. Aborting deployment." -ForegroundColor Red
        exit 1
    }
    
    # Log the emergency deployment
    $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - EMERGENCY DEPLOYMENT by $env:USERNAME - Reason: $reason"
    $logEntry | Add-Content -Path "emergency-deployments.log" -Encoding UTF8
    Write-Host "`nEmergency deployment logged to emergency-deployments.log" -ForegroundColor Yellow
    Write-Host "=================================================" -ForegroundColor Green
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
    Write-Host "  Skip Emulator Cleanup: $SkipEmulatorCleanup" -ForegroundColor Cyan
    
    # Authenticate with Google Cloud
    Write-Status "Ensuring Google Cloud authentication..."
    
    if ($isCI -and $env:GOOGLE_APPLICATION_CREDENTIALS) {
        Write-Status "Running in CI with service account credentials - skipping gcloud authentication"
        Write-Status "Using service account credentials from: $env:GOOGLE_APPLICATION_CREDENTIALS"
    } else {
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
            Update-HtmlFilesForLocal -Environment $Environment
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
    
    # Update HTML files for local development
    Update-HtmlFilesForLocal -Environment $Environment
    
    # Start Firebase emulators
    if (-not $SkipFirebase) {
        Deploy-FirebaseFunctions -Environment $Environment
    }
    
    # Start local HTTP server for the website
    Start-LocalHttpServer
    
    Write-Success "Local development environment setup complete!"
}

# Print deployment summary
Write-Host "`n=================================================" -ForegroundColor Green
Write-Host "Deployment Summary:" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

if ($Environment -eq 'local') {
    Write-Success "Local development environment is ready!"
    Write-Host "`nLocal servers are running in separate windows:" -ForegroundColor Yellow
    Write-Host "- Local HTTP Server (website files)" -ForegroundColor Yellow
    Write-Host "- Firebase Emulators" -ForegroundColor Yellow
    if (-not $SkipEmulatorCleanup) {
        Write-Host "Note: Any existing emulator processes were stopped before starting new ones" -ForegroundColor Yellow
    } else {
        Write-Host "Note: Emulator cleanup was skipped - existing emulators may still be running" -ForegroundColor Yellow
    }
    Write-Host "`nLocal Development URLs:" -ForegroundColor Green
    Write-Host "Website (main site): http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Firebase Emulator UI: http://localhost:4001" -ForegroundColor Cyan
    Write-Host "Waitlist Function: http://127.0.0.1:5001/vitae-local/us-central1/handleWaitlistSubmission" -ForegroundColor Cyan
    Write-Host "Start Story Function: http://127.0.0.1:5001/vitae-local/us-central1/handleStartStorySubmission" -ForegroundColor Cyan
    Write-Host "Firestore emulator: http://localhost:8081" -ForegroundColor Cyan
    Write-Host "`nTo use the development environment:" -ForegroundColor Yellow
    Write-Host "1. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host "2. Open http://localhost:4001 for Firebase UI" -ForegroundColor White
    Write-Host "3. All navigation links will work locally with .html extensions" -ForegroundColor White
    Write-Host "4. Forms will submit to local Firebase Functions" -ForegroundColor White
    Write-Host "5. Close both server windows or press Ctrl+C to stop" -ForegroundColor White
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