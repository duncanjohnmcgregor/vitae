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

# Check if gcloud is installed
$gcloudVersion = gcloud --version
if (-not $?) {
    Write-Host "Google Cloud SDK is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
}

# Login to Google Cloud
Write-Host "Logging in to Google Cloud..."
gcloud auth login

# Set the project ID
$projectId = Read-Host "Enter your Google Cloud project ID"
gcloud config set project $projectId

# Set the region
$region = Read-Host "Enter your Google Cloud region (e.g., us-central1)"
gcloud config set functions/region $region

# Install dependencies for the Cloud Function
Write-Host "Installing Cloud Function dependencies..."
Set-Location -Path "functions"
npm install

# Create a zip file for the Cloud Function
Write-Host "Creating Cloud Function zip file..."
Compress-Archive -Path * -DestinationPath "../functions.zip" -Force
Set-Location -Path ".."

# Deploy the Cloud Function
Write-Host "Deploying Cloud Function..."
gcloud functions deploy handleWaitlistSubmission `
    --runtime nodejs18 `
    --trigger-http `
    --allow-unauthenticated `
    --source functions `
    --entry-point handleWaitlistSubmission `
    --set-env-vars FIRESTORE_COLLECTION=waitlist

# Get the deployed function URL
$functionUrl = gcloud functions describe handleWaitlistSubmission --format="value(httpsTrigger.url)"

# Update the Cloud Function URL in script.js
$scriptJsPath = "../src/script.js"
$scriptJsContent = Get-Content -Path $scriptJsPath -Raw
$updatedContent = $scriptJsContent -replace "https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/handleWaitlistSubmission", $functionUrl
$updatedContent | Set-Content -Path $scriptJsPath -Encoding UTF8

Write-Host "`nCloud Function deployed successfully!"
Write-Host "Function URL: $functionUrl"
Write-Host "The script.js file has been updated with the new function URL." 