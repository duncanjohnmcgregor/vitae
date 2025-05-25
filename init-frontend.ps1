# Initialize Frontend Dependencies
# This script sets up the frontend dependencies for the first time

Write-Host "🎨 Initializing Frontend Dependencies" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if src directory exists
if (-not (Test-Path "src")) {
    Write-Error "❌ src directory not found! Make sure you're in the project root."
    exit 1
}

# Check if src/package.json exists
if (-not (Test-Path "src/package.json")) {
    Write-Error "❌ src/package.json not found! Frontend testing may not be configured."
    exit 1
}

Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location src

try {
    # Install dependencies
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend dependencies installed successfully!" -ForegroundColor Green
        
        # Verify package-lock.json was created
        if (Test-Path "package-lock.json") {
            Write-Host "✅ package-lock.json created" -ForegroundColor Green
        }
        
        # Run a quick test to verify everything works
        Write-Host "`n🧪 Running a quick test to verify setup..." -ForegroundColor Yellow
        npm run test -- --passWithNoTests
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend setup verified successfully!" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ Tests had issues, but dependencies are installed"
        }
        
    } else {
        Write-Error "❌ Failed to install frontend dependencies"
        Set-Location ..
        exit 1
    }
    
} catch {
    Write-Error "❌ Error during installation: $($_.Exception.Message)"
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host "`n🎉 Frontend initialization complete!" -ForegroundColor Green
Write-Host "You can now push your changes and the workflow should work." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Commit the new package-lock.json file: git add src/package-lock.json"
Write-Host "2. Push your changes to trigger the workflow"
Write-Host "3. The PR validation should now pass the dependency installation step" 