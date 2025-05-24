# Vitae Local Development Setup Script (PowerShell)
# Fixed version that uses Node.js HTTP server instead of Python

param(    [Parameter(Mandatory=$false)]    [int]$Port = 8001)

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

# Function to check if a port is in use
function Test-PortInUse {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

# Function to stop existing processes
function Stop-ExistingProcesses {
    Write-Status "Stopping any existing Firebase emulators and web servers..."
    
    # Stop Firebase processes
    Get-Process -Name "firebase" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*firebase*" -or $_.CommandLine -like "*serve-local*" } | Stop-Process -Force
    
    Start-Sleep -Seconds 2
    Write-Success "Existing processes stopped"
}

Write-Host "Starting Vitae Local Development Environment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check for required tools
Write-Status "Checking required tools..."

$requiredTools = @{
    'Node.js' = { Test-Command 'node' }
    'npm' = { Test-Command 'npm' }
    'Firebase CLI' = { Test-Command 'firebase' }
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

Write-Success "All required tools are available"

# Stop existing processes
Stop-ExistingProcesses

# Install Firebase Functions dependencies
Write-Status "Installing Firebase Functions dependencies..."
if (Test-Path "functions") {
    Set-Location -Path "functions"
    npm install
    Set-Location -Path ".."
    Write-Success "Firebase Functions dependencies installed"
} else {
    Write-Warning "Functions directory not found. Some features may not work."
}

# Update script.js for local development
Write-Status "Updating script.js for local development..."
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
    Write-Success "Updated script.js with local function URL"
} else {
    Write-Warning "script.js not found at $scriptJsPath"
}

# Start Firebase emulators
Write-Status "Starting Firebase emulators..."
$emulatorCommand = "Write-Host 'Firebase Emulators Starting...' -ForegroundColor Yellow; Write-Host 'Press Ctrl+C in this window to stop the emulators.' -ForegroundColor Yellow; firebase emulators:start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $emulatorCommand -WindowStyle Normal

# Wait for emulators to start
Write-Status "Waiting for Firebase emulators to initialize..."
$maxWait = 30
$waited = 0
$emulatorsReady = $false

while ($waited -lt $maxWait -and -not $emulatorsReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    # Check if emulator ports are responding
    $uiReady = Test-PortInUse -Port 4001
    $functionsReady = Test-PortInUse -Port 5001
    $firestoreReady = Test-PortInUse -Port 8080
    
    if ($uiReady -and $functionsReady -and $firestoreReady) {
        $emulatorsReady = $true
    }
}

if ($emulatorsReady) {
    Write-Success "Firebase emulators are ready!"
} else {
    Write-Warning "Firebase emulators may still be starting. Check the emulator window for status."
}

# Start local web server using Node.js
Write-Status "Starting local web server on port $Port..."

if (Test-PortInUse -Port $Port) {
    Write-Warning "Port $Port is already in use. Trying to stop existing server..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*serve-local*" } | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Create the Node.js server script if it doesn't exist
if (-not (Test-Path "serve-local.js")) {
    Write-Status "Creating Node.js HTTP server script..."
    @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = $Port;
const PUBLIC_DIR = path.join(__dirname, 'src');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found, serve index.html for SPA routing
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (error, content) => {
          if (error) {
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: `${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Local server running at http://localhost:`${PORT}/`);
  console.log(`Serving files from: `${PUBLIC_DIR}`);
  console.log('Press Ctrl+C to stop the server');
});
"@ | Out-File -FilePath "serve-local.js" -Encoding UTF8
}

# Start the web server in a new window
$webServerCommand = "Write-Host 'Starting local web server...' -ForegroundColor Yellow; node serve-local.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $webServerCommand -WindowStyle Normal

# Wait for web server to start
Write-Status "Waiting for web server to start..."
Start-Sleep -Seconds 3

if (Test-PortInUse -Port $Port) {
    Write-Success "Local web server is running!"
} else {
    Write-Warning "Web server may still be starting. Check the web server window for status."
}

# Print summary
Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "Local Development Environment Ready!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`nServices:" -ForegroundColor Yellow
Write-Host "  Website: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "  Firebase Emulator UI: http://localhost:4001" -ForegroundColor Cyan
Write-Host "  Cloud Function endpoint: http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission" -ForegroundColor Cyan
Write-Host "  Firestore emulator: http://localhost:8080" -ForegroundColor Cyan

Write-Host "`nTo use the development environment:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:$Port in your browser to view the website" -ForegroundColor White
Write-Host "2. Open http://localhost:4001 for Firebase Emulator UI" -ForegroundColor White
Write-Host "3. Close the emulator and web server windows to stop services" -ForegroundColor White

Write-Host "`nBoth Firebase emulators and web server are running in separate windows." -ForegroundColor Green
Write-Success "Setup completed successfully!" 