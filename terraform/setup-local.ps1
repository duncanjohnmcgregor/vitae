# Check if Node.js is installed
$nodeVersion = node -v
if (-not $?) {
    Write-Host "Node.js is not installed. Please install Node.js 18 or later from https://nodejs.org/"
    exit 1
}

# Check if npm is installed
$npmVersion = npm -v
if (-not $?) {
    Write-Host "npm is not installed. Please install npm."
    exit 1
}

# Install Firebase CLI globally if not already installed
$firebaseVersion = firebase --version
if (-not $?) {
    Write-Host "Installing Firebase CLI..."
    npm install -g firebase-tools
}

# Login to Firebase (if not already logged in)
firebase login

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
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
"@ | Out-File -FilePath "firebase.json" -Encoding UTF8
}

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

# Create waitlist-function directory if it doesn't exist
if (-not (Test-Path "waitlist-function")) {
    Write-Host "Creating waitlist-function directory..."
    New-Item -ItemType Directory -Path "waitlist-function"
}

# Create package.json for the Cloud Function
Write-Host "Creating package.json for Cloud Function..."
@"
{
  "name": "waitlist-function",
  "version": "1.0.0",
  "description": "Waitlist submission Cloud Function",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@google-cloud/firestore": "^6.0.0",
    "cors": "^2.8.5"
  }
}
"@ | Out-File -FilePath "waitlist-function\package.json" -Encoding UTF8

# Create index.js for the Cloud Function
Write-Host "Creating index.js for Cloud Function..."
@"
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.handleWaitlistSubmission = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        res.status(400).send('Invalid email address');
        return;
      }

      const db = admin.firestore();
      await db.collection('waitlist').add({
        email,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).send('Successfully joined the waitlist!');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });
});
"@ | Out-File -FilePath "waitlist-function\index.js" -Encoding UTF8

# Install dependencies for the Cloud Function
Write-Host "Installing Cloud Function dependencies..."
Set-Location -Path "waitlist-function"
npm install

# Create a zip file for the Cloud Function
Write-Host "Creating Cloud Function zip file..."
Compress-Archive -Path * -DestinationPath "..\waitlist-function.zip" -Force
Set-Location -Path ".."

# Start the Firebase emulators
Write-Host "Starting Firebase emulators..."
Start-Process -FilePath "firebase" -ArgumentList "emulators:start" -NoNewWindow

# Wait for emulators to start
Write-Host "Waiting for emulators to start..."
Start-Sleep -Seconds 5

# Update the Cloud Function URL in script.js
$scriptJsPath = "..\src\script.js"
$scriptJsContent = Get-Content -Path $scriptJsPath -Raw
$updatedContent = $scriptJsContent -replace "http://localhost:8080", "http://localhost:5001/vitae-local/us-central1/waitlist-submission"
$updatedContent | Set-Content -Path $scriptJsPath -Encoding UTF8

Write-Host "`nLocal development environment is ready!"
Write-Host "Firebase Emulator UI: http://localhost:4000"
Write-Host "Cloud Function endpoint: http://localhost:5001/vitae-local/us-central1/waitlist-submission"
Write-Host "Firestore emulator: http://localhost:8080"
Write-Host "`nPress Ctrl+C to stop the emulators." 