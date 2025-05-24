# DevOps Setup Automation Script
# This script helps automate the setup of Google Cloud resources for GitHub Actions deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceAccountName = "github-actions-deploy",
    
    [Parameter(Mandatory=$false)]
    [string]$KeyFileName = "github-actions-key.json",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipApiEnable,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipServiceAccount
)

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

# Function to run gcloud command with error handling
function Invoke-GcloudCommand {
    param(
        [string]$Command,
        [string]$ErrorMessage
    )
    
    try {
        Write-Status "Running: gcloud $Command"
        
        # Use PowerShell's call operator with proper error handling
        $output = @()
        $errorOutput = @()
        
        # Execute command and capture both streams
        try {
            $result = Invoke-Expression "gcloud $Command" -ErrorVariable errorOutput 2>&1
            $exitCode = $LASTEXITCODE
            
            # Collect all output
            $output = $result
        }
        catch {
            $exitCode = 1
            $errorOutput = $_.Exception.Message
        }
        
        # Display all output
        if ($output) {
            $output | ForEach-Object { 
                if ($_.ToString().Trim()) { 
                    Write-Host $_.ToString().Trim() 
                }
            }
        }
        
        # For gcloud config commands, success messages often go to stderr
        # Only treat as error if exit code is non-zero AND output suggests actual failure
        if ($exitCode -ne 0) {
            $outputText = ($output | Out-String) + ($errorOutput | Out-String)
            if ($outputText -notmatch "Updated property" -and 
                $outputText -notmatch "already exists" -and 
                $outputText -notmatch "Operation.*completed successfully" -and
                $outputText -notmatch "Updated IAM policy for project" -and
                $outputText -notmatch "created key.*of type.*json.*as") {
                # Show the actual error output for debugging
                if ($errorOutput) {
                    Write-Host "Error details:" -ForegroundColor Red
                    $errorOutput | ForEach-Object { 
                        if ($_.ToString().Trim()) { 
                            Write-Host $_.ToString().Trim() -ForegroundColor Red
                        }
                    }
                }
                throw "Command failed with exit code $exitCode"
            }
        }
        
        return $output
    }
    catch {
        Write-Error "$ErrorMessage"
        Write-Host $_.Exception.Message -ForegroundColor Red
        throw
    }
}

Write-Host "=== DevOps Setup for Vitae Project ===" -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
Write-Host "Service Account: $ServiceAccountName" -ForegroundColor Cyan
Write-Host "Key File: $KeyFileName" -ForegroundColor Cyan

# Check prerequisites
Write-Status "Checking prerequisites..."

if (-not (Test-Command 'gcloud')) {
    Write-Error "Google Cloud SDK (gcloud) is not installed or not in PATH"
    Write-Host "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
}

if (-not (Test-Command 'firebase')) {
    Write-Warning "Firebase CLI not found. Installing..."
    try {
        npm install -g firebase-tools
        Write-Success "Firebase CLI installed"
    }
    catch {
        Write-Error "Failed to install Firebase CLI. Please install Node.js first."
        exit 1
    }
}

# Verify authentication
Write-Status "Checking Google Cloud authentication..."
try {
    $currentAccount = gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>$null
    if (-not $currentAccount) {
        Write-Warning "Not authenticated with Google Cloud"
        Write-Host "Please run: gcloud auth login"
        Write-Host "Then re-run this script"
        exit 1
    }
    Write-Success "Authenticated as: $currentAccount"
}
catch {
    Write-Warning "Could not verify authentication status"
}

# Set the project
Write-Status "Setting Google Cloud project..."
try {
    Invoke-GcloudCommand "config set project $ProjectId" "Failed to set project"
    Write-Success "Project set to: $ProjectId"
}
catch {
    Write-Error "Failed to set project. Please ensure the project exists and you have access."
    exit 1
}

# Verify project access
Write-Status "Verifying project access..."
try {
    $projectInfo = gcloud projects describe $ProjectId --format="value(projectId)" 2>$null
    if ($projectInfo -eq $ProjectId) {
        Write-Success "Project access verified: $ProjectId"
    } else {
        throw "Could not access project"
    }
}
catch {
    Write-Error "Cannot access project $ProjectId. Please ensure the project exists and you have the necessary permissions."
    exit 1
}

# Enable APIs
if (-not $SkipApiEnable) {
    Write-Status "Enabling required Google Cloud APIs..."
    $apis = @(
        "cloudfunctions.googleapis.com",
        "storage-api.googleapis.com",
        "compute.googleapis.com",
        "dns.googleapis.com",
        "firebase.googleapis.com",
        "firebasehosting.googleapis.com",
        "iam.googleapis.com",
        "cloudresourcemanager.googleapis.com"
    )
    
    foreach ($api in $apis) {
        try {
            Write-Status "Enabling $api..."
            Invoke-GcloudCommand "services enable $api --project=$ProjectId" "Failed to enable $api"
        }
        catch {
            Write-Warning "Failed to enable $api - continuing with other APIs"
        }
    }
    Write-Success "API enablement completed"
} else {
    Write-Status "Skipping API enablement"
}

# Create service account
if (-not $SkipServiceAccount) {
    Write-Status "Creating service account..."
    
    $serviceAccountEmail = "$ServiceAccountName@$ProjectId.iam.gserviceaccount.com"
    
    # Check if service account already exists
    try {
        Write-Status "Checking if service account already exists..."
        $existingAccount = Invoke-Expression "gcloud iam service-accounts describe $serviceAccountEmail --project=$ProjectId" -ErrorAction SilentlyContinue 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Warning "Service account $serviceAccountEmail already exists"
            $response = Read-Host "Do you want to continue and update permissions? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                Write-Status "Skipping service account creation"
                exit 0
            }
        } else {
            Write-Status "Service account does not exist, will create it"
        }
    }
    catch {
        Write-Status "Service account does not exist, will create it"
    }
    
    # Create service account if it doesn't exist
    if ($LASTEXITCODE -ne 0) {
        try {
            Write-Status "Creating service account $ServiceAccountName..."
            Invoke-GcloudCommand "iam service-accounts create $ServiceAccountName --project=$ProjectId" "Failed to create service account"
            Write-Success "Service account created: $serviceAccountEmail"
        }
        catch {
            # Show more detailed error information
            Write-Error "Failed to create service account. This might be because:"
            Write-Host "1. The service account already exists" -ForegroundColor Yellow
            Write-Host "2. You don't have sufficient permissions" -ForegroundColor Yellow
            Write-Host "3. The project billing is not enabled" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "You can check manually with:" -ForegroundColor Cyan
            Write-Host "gcloud iam service-accounts list --project=$ProjectId" -ForegroundColor White
            Write-Host ""
            $response = Read-Host "Do you want to continue anyway and try to assign permissions to existing service account? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                throw
            }
        }
    } else {
        Write-Status "Service account already exists, skipping creation"
    }
    
    # Grant necessary roles
    Write-Status "Granting IAM roles to service account..."
    $roles = @(
        "roles/firebase.admin",
        "roles/cloudfunctions.admin", 
        "roles/storage.admin",
        "roles/compute.admin",
        "roles/iam.serviceAccountUser",
        "roles/editor"  # For Terraform
    )
    
    foreach ($role in $roles) {
        try {
            Write-Status "Granting role: $role"
            Invoke-GcloudCommand "projects add-iam-policy-binding $ProjectId --member='serviceAccount:$serviceAccountEmail' --role='$role'" "Failed to grant role $role"
        }
        catch {
            Write-Warning "Failed to grant role $role - continuing with other roles"
        }
    }
    Write-Success "IAM roles granted"
    
    # Create service account key
    Write-Status "Creating service account key..."
    try {
        if (Test-Path $KeyFileName) {
            $response = Read-Host "Key file $KeyFileName already exists. Overwrite? (y/N)"
            if ($response -ne 'y' -and $response -ne 'Y') {
                Write-Status "Skipping key creation"
            } else {
                Remove-Item $KeyFileName -Force
            }
        }
        
        if (-not (Test-Path $KeyFileName)) {
            Invoke-GcloudCommand "iam service-accounts keys create $KeyFileName --iam-account=$serviceAccountEmail --project=$ProjectId" "Failed to create service account key"
            Write-Success "Service account key created: $KeyFileName"
        }
    }
    catch {
        Write-Error "Failed to create service account key"
        throw
    }
} else {
    Write-Status "Skipping service account creation"
}

# Generate Firebase token
Write-Status "Generating Firebase CI token..."
Write-Host ""
Write-Host "Please follow these steps to generate a Firebase CI token:" -ForegroundColor Yellow
Write-Host "1. Run: firebase login" -ForegroundColor White
Write-Host "2. Run: firebase login:ci" -ForegroundColor White
Write-Host "3. Copy the generated token" -ForegroundColor White
Write-Host ""

$response = Read-Host "Would you like to run 'firebase login:ci' now? (y/N)"
if ($response -eq 'y' -or $response -eq 'Y') {
    try {
        # Check if already logged in
        $projects = firebase projects:list 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Status "Logging into Firebase..."
            firebase login
        }
        
        Write-Status "Generating CI token..."
        firebase login:ci
    }
    catch {
        Write-Warning "Firebase token generation failed. Please run 'firebase login:ci' manually."
    }
}

# Display summary
Write-Host ""
Write-Host "=== Setup Summary ===" -ForegroundColor Green
Write-Host "Project ID: $ProjectId" -ForegroundColor Cyan
if (-not $SkipServiceAccount) {
    Write-Host "Service Account: $ServiceAccountName@$ProjectId.iam.gserviceaccount.com" -ForegroundColor Cyan
    Write-Host "Key File: $KeyFileName" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Copy the contents of '$KeyFileName' to GitHub secret 'GCP_SA_KEY'" -ForegroundColor White
Write-Host "2. Copy the Firebase CI token to GitHub secret 'FIREBASE_TOKEN'" -ForegroundColor White  
Write-Host "3. Set GitHub secret 'GCP_PROJECT_ID' to: $ProjectId" -ForegroundColor White
Write-Host "4. Follow the complete setup guide: .github/DEVOPS_SETUP.md" -ForegroundColor White

Write-Host ""
Write-Host "=== Security Reminder ===" -ForegroundColor Red
Write-Host "- NEVER commit the service account key file to your repository" -ForegroundColor White
Write-Host "- Add '$KeyFileName' to your .gitignore file" -ForegroundColor White
Write-Host "- Rotate the service account key regularly (recommended: every 90 days)" -ForegroundColor White

Write-Success "DevOps setup completed successfully!"

# Add key file to gitignore if it exists
if (-not $SkipServiceAccount -and (Test-Path $KeyFileName)) {
    $gitignorePath = ".gitignore"
    $keyFileEntry = $KeyFileName
    
    if (Test-Path $gitignorePath) {
        $gitignoreContent = Get-Content $gitignorePath -Raw
        if ($gitignoreContent -notmatch [regex]::Escape($keyFileEntry)) {
            Write-Status "Adding $KeyFileName to .gitignore..."
            Add-Content -Path $gitignorePath -Value "`n# Service account key file (never commit!)$([Environment]::NewLine)$keyFileEntry"
            Write-Success "Added $KeyFileName to .gitignore"
        }
    } else {
        Write-Status "Creating .gitignore with service account key exclusion..."
        @"
# Service account key file (never commit!)
$keyFileEntry

# Node modules
node_modules/

# Environment files
.env
.env.local
.env.*.local

# Firebase
.firebase/

# Terraform
terraform/*.tfstate
terraform/*.tfstate.backup
terraform/.terraform/
"@ | Out-File -FilePath $gitignorePath -Encoding UTF8
        Write-Success "Created .gitignore file"
    }
} 