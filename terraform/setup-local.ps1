$ErrorActionPreference = "Continue"

# Debug: Print PATH
Write-Host "[DEBUG] PATH: $env:PATH" -ForegroundColor Cyan

# Check if Java is installed
Write-Host "[DEBUG] Checking for Java with Get-Command..." -ForegroundColor Cyan
try {
    $javaPath = (Get-Command java -ErrorAction Stop).Path
    Write-Host "[DEBUG] Java found at: $javaPath" -ForegroundColor Cyan
} catch {
    Write-Host "[DEBUG] Java not found or error occurred." -ForegroundColor Red
    Write-Host "Java is not installed or not in PATH. Please install Java 11 or later:" -ForegroundColor Red
    Write-Host "1. Download OpenJDK 11 or later from: https://adoptium.net/" -ForegroundColor Yellow
    Write-Host "2. Run the installer" -ForegroundColor Yellow
    Write-Host "3. Add Java to your PATH environment variable" -ForegroundColor Yellow
    Write-Host "4. Restart your terminal and try again" -ForegroundColor Yellow
    exit 1
}

# Print Java version (do not check exit code)
$javaVersion = & java -version 2>&1
Write-Host "Java detected at: $javaPath" -ForegroundColor Green
Write-Host "Java version:`n$javaVersion" -ForegroundColor Green
Write-Host "[DEBUG] Java check complete" -ForegroundColor Cyan

# Check if Node.js is installed
$nodeVersion = node -v
if (-not $?) {
    Write-Host "Node.js is not installed. Please install Node.js 18 or later from https://nodejs.org/"
    exit 1
}
Write-Host "[DEBUG] Node.js check complete" -ForegroundColor Cyan

# Check if npm is installed
$npmVersion = npm -v
if (-not $?) {
    Write-Host "npm is not installed. Please install npm."
    exit 1
}
Write-Host "[DEBUG] npm check complete" -ForegroundColor Cyan

# Install Firebase CLI globally if not already installed
$firebaseVersion = firebase --version
if (-not $?) {
    Write-Host "Installing Firebase CLI..."
    npm install -g firebase-tools
}
Write-Host "[DEBUG] Firebase CLI check complete" -ForegroundColor Cyan

# Login to Firebase (if not already logged in)
firebase login
Write-Host "[DEBUG] Firebase login complete" -ForegroundColor Cyan

# Create firebase.json if it doesn't exist
if (-not (Test-Path "firebase.json")) {
    Write-Host "Creating firebase.json..."
    @"
{
  "emulators": {
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8081,
      "rules": "firestore.rules"
    },
    "ui": {
      "enabled": true,
      "port": 4001
    },
    "singleProjectMode": true
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "*.local"
      ]
    }
  ]
}
"@ | Out-File -FilePath "firebase.json" -Encoding UTF8
}
Write-Host "[DEBUG] firebase.json check/creation complete" -ForegroundColor Cyan

# Create .firebaserc if it doesn't exist
if (-not (Test-Path ".firebaserc")) {
    Write-Host "Creating .firebaserc..."
    @"
{
  "projects": {
    "default": "vitae-local"
  }
}
"@ | Out-File -FilePath ".firebaserc" -Encoding UTF8
}
Write-Host "[DEBUG] .firebaserc check/creation complete" -ForegroundColor Cyan

# Ensure functions directory exists and has dependencies installed
if (-not (Test-Path "functions")) {
    Write-Host "Functions directory not found. Please run 'firebase init functions' first." -ForegroundColor Red
    exit 1
}

Write-Host "Installing Cloud Function dependencies..."
Set-Location -Path "functions"
npm install
Set-Location -Path ".."
Write-Host "[DEBUG] npm install for functions complete" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-PortInUse {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Function to start local web server
function Start-LocalWebServer {
    param($Port = 8000)
    
    if (Test-PortInUse -Port $Port) {
        Write-Host "Web server is already running on port $Port" -ForegroundColor Yellow
        return
    }

    Write-Host "Starting local web server on port $Port..."
    # Change to src directory before starting server
    Set-Location -Path "src"
    $webServerCmd = "python -m http.server $Port"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $webServerCmd
    # Change back to original directory
    Set-Location -Path ".."
    Write-Host "Local web server started at http://localhost:$Port" -ForegroundColor Green
}

# Function to kill existing emulator processes
function Stop-EmulatorProcesses {
    Write-Host "Checking for existing emulator processes..." -ForegroundColor Yellow
    
    # Kill Firebase emulator processes
    $firebaseProcesses = Get-Process -Name "firebase" -ErrorAction SilentlyContinue
    if ($firebaseProcesses) {
        Write-Host "Stopping existing Firebase emulator processes..." -ForegroundColor Yellow
        $firebaseProcesses | Stop-Process -Force
        Start-Sleep -Seconds 2  # Give processes time to fully stop
    }

    # Kill Python HTTP server processes (if any)
    $pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*http.server*" }
    if ($pythonProcesses) {
        Write-Host "Stopping existing Python HTTP server processes..." -ForegroundColor Yellow
        $pythonProcesses | Stop-Process -Force
        Start-Sleep -Seconds 1
    }

    Write-Host "All emulator processes stopped." -ForegroundColor Green
}

# Start the Firebase emulators
Write-Host "Checking for existing Firebase emulators..."
Stop-EmulatorProcesses

$existingEmulator = Get-Process -Name "firebase" -ErrorAction SilentlyContinue
if ($existingEmulator) {
    Write-Host "Firebase emulator is already running. Skipping emulator start." -ForegroundColor Yellow
    Write-Host "Firebase Emulator UI: http://localhost:4001"
    Write-Host "Cloud Function endpoint: http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission"
    Write-Host "Firestore emulator: http://localhost:8081"
} else {
    Write-Host "Starting Firebase emulators..."
    try {
        # Start emulators in a new window
        $firebaseCmd = "firebase emulators:start"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $firebaseCmd
        
        # Wait for emulators to start
        Write-Host "Waiting for emulators to start..."
        Start-Sleep -Seconds 10
        
        # Check if emulators are running        $emulatorPorts = @(4001, 5001, 8081)
        $allRunning = $true
        
        foreach ($port in $emulatorPorts) {
            $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
            if (-not $connection.TcpTestSucceeded) {
                $allRunning = $false
                Write-Warning "Emulator on port $port is not responding"
            }
        }
        
        if (-not $allRunning) {
            throw "One or more emulators failed to start"
        }
        Write-Host "[DEBUG] Firebase emulators started successfully" -ForegroundColor Cyan
    }
    catch {
        Write-Error "Failed to start Firebase emulators: $_"
        exit 1
    }
}

# Start local web server
Start-LocalWebServer -Port 8000

# Update the Cloud Function URL in script.js
$scriptJsPath = "..\src\script.js"
if (Test-Path $scriptJsPath) {
    $scriptJsContent = Get-Content -Path $scriptJsPath -Raw
    $updatedContent = $scriptJsContent -replace "http://localhost:8080", "http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission"
    $updatedContent | Set-Content -Path $scriptJsPath -Encoding UTF8
    Write-Host "[DEBUG] script.js URL update complete" -ForegroundColor Cyan
}
else {
    Write-Warning "script.js not found at $scriptJsPath"
}

Write-Host "`nLocal development environment is ready!"
Write-Host "Your webpage is available at: http://localhost:8000"
Write-Host "`nLocal development environment is ready!"
Write-Host "`nPress Ctrl+C to stop the emulators and web server." 