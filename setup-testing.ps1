# Setup Testing Framework
# This script initializes the testing framework dependencies for the Vitae project

Write-Host "🧪 Setting up Testing Framework for Vitae Project" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Error "❌ npm is not available. Please ensure npm is installed with Node.js"
    exit 1
}

# Install root dependencies if package.json exists
if (Test-Path "package.json") {
    Write-Host "`n📦 Installing root dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Root dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Error "❌ Failed to install root dependencies"
        exit 1
    }
}

# Install frontend dependencies
if (Test-Path "src/package.json") {
    Write-Host "`n🎨 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location src
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
        
        # Run a quick test to ensure everything is working
        Write-Host "`n🧪 Running frontend tests to verify setup..." -ForegroundColor Yellow
        npm run test:ci
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend tests passed - setup is working correctly!" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ Frontend tests failed - there may be issues with the test setup"
        }
    } else {
        Write-Error "❌ Failed to install frontend dependencies"
        Set-Location ..
        exit 1
    }
    Set-Location ..
} else {
    Write-Warning "⚠️ No src/package.json found - frontend testing may not be configured"
}

# Install backend dependencies
if (Test-Path "functions/package.json") {
    Write-Host "`n⚙️ Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location functions
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
        
        # Run a quick test to ensure everything is working
        Write-Host "`n🧪 Running backend tests to verify setup..." -ForegroundColor Yellow
        npm run test:ci
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend tests passed - setup is working correctly!" -ForegroundColor Green
        } else {
            Write-Warning "⚠️ Backend tests failed - there may be issues with the test setup"
        }
    } else {
        Write-Error "❌ Failed to install backend dependencies"
        Set-Location ..
        exit 1
    }
    Set-Location ..
} else {
    Write-Warning "⚠️ No functions/package.json found - backend testing may not be configured"
}

# Check if Terraform is available (optional)
Write-Host "`n🏗️ Checking Terraform availability..." -ForegroundColor Yellow
try {
    $terraformVersion = terraform --version
    Write-Host "✅ Terraform is available: $($terraformVersion.Split("`n")[0])" -ForegroundColor Green
    
    # Check if terraform directory exists and validate
    if (Test-Path "terraform") {
        Write-Host "🔍 Validating Terraform configuration..." -ForegroundColor Yellow
        Set-Location terraform
        terraform init -backend=false
        if ($LASTEXITCODE -eq 0) {
            terraform validate
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Terraform configuration is valid" -ForegroundColor Green
            } else {
                Write-Warning "⚠️ Terraform validation failed"
            }
        } else {
            Write-Warning "⚠️ Terraform init failed"
        }
        Set-Location ..
    }
} catch {
    Write-Warning "⚠️ Terraform is not installed - infrastructure testing will be skipped in CI"
    Write-Host "   You can install Terraform from https://www.terraform.io/downloads.html" -ForegroundColor Gray
}

# Summary
Write-Host "`n🎉 Setup Summary" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "✅ Testing framework dependencies installed"
Write-Host "✅ Ready for PR validation workflow"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Set up branch protection rules (see BRANCH_PROTECTION_SETUP.md)"
Write-Host "2. Update .github/CODEOWNERS with your GitHub username"
Write-Host "3. Create a test PR to verify the validation workflow"
Write-Host ""
Write-Host "🧪 Local Testing Commands:" -ForegroundColor Cyan
Write-Host "  Frontend: cd src && npm run test:all"
Write-Host "  Backend:  cd functions && npm run test:ci"
Write-Host "  Infrastructure: cd terraform && terraform test"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - TESTING.md - Comprehensive testing guide"
Write-Host "  - BRANCH_PROTECTION_SETUP.md - Branch protection setup"
Write-Host ""
Write-Host "🚀 The testing framework is now ready!" -ForegroundColor Green 