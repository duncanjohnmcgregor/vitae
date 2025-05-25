# Running GitHub Actions Locally with Act

This guide explains how to run your GitHub Actions workflows locally using [act](https://github.com/nektos/act) before deploying your Vitae website.

## Overview

With `act`, you can:
- ✅ Test PR validation workflows locally before pushing
- ✅ Validate production deployment workflows without actually deploying
- ✅ Debug workflow issues faster with local execution
- ✅ Ensure your changes pass all checks before creating a PR

## Prerequisites

### 1. Install Docker Desktop
Act requires Docker to run GitHub Actions in containers.

- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Start Docker Desktop and ensure it's running

### 2. Install Act
Act is already installed via winget. If you need to reinstall:

```powershell
winget install nektos.act
```

### 3. Setup Secrets (Optional)
For workflows that need secrets, create a `.env.act` file:

```powershell
# Copy the template and edit with your values
Copy-Item act-secrets.template .env.act
# Edit .env.act with your actual secrets
```

## Usage Options

### Option 1: Enhanced Script (Recommended)
Use the new `deploy-with-act.ps1` script for the best experience:

```powershell
# Run PR validation + local deployment (recommended)
./deploy-with-act.ps1

# Run only PR validation workflow
./deploy-with-act.ps1 -RunPRValidation

# Test production workflow locally (no actual deployment)
./deploy-with-act.ps1 -RunProduction

# Run custom workflow
./deploy-with-act.ps1 -WorkflowFile "dependency-check.yml"

# Skip GitHub Actions validation
./deploy-with-act.ps1 -SkipValidation

# Run only GitHub Actions (no deployment)
./deploy-with-act.ps1 -SkipDeployment
```

### Option 2: Original Script with Act Integration
Use the original `deploy.ps1` with GitHub Actions support:

```powershell
# Run GitHub Actions before local deployment
./deploy.ps1 -RunGitHubActions

# Run GitHub Actions before production deployment (emergency only)
./deploy.ps1 prod -RunGitHubActions -ConfirmBreakGlass
```

### Option 3: Direct Act Commands
Run act directly for specific workflows:

```powershell
# Run PR validation workflow
act pull_request --workflows .github/workflows/pr-validation.yml

# Run production deployment workflow (testing only)
act push --workflows .github/workflows/deploy-production.yml --dry-run

# List all available workflows
act --list

# Run with specific event data
act workflow_dispatch --workflows .github/workflows/performance-monitor.yml
```

## Available Workflows

Your project has these GitHub Actions workflows that can be run locally:

1. **PR Validation** (`pr-validation.yml`)
   - Structure & config validation
   - Security scanning
   - Frontend linting
   - Backend tests
   - Firebase validation

2. **Production Deployment** (`deploy-production.yml`)
   - Pre-deployment validation
   - Firebase Functions deployment
   - Firestore rules deployment
   - Firebase Hosting deployment

3. **Hotfix Deployment** (`hotfix-deploy.yml`)
   - Emergency deployment workflow

4. **Performance Monitor** (`performance-monitor.yml`)
   - Performance testing and monitoring

5. **Dependency Check** (`dependency-check.yml`)
   - Security and dependency validation

## Configuration Files

### `.actrc`
Global configuration for act:
```
# Use GitHub's official runner images
-P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest

# Enable verbose logging
--verbose

# Reuse containers for faster runs
--reuse

# Set secrets file
--secret-file .env.act
```

### `.env.act` (Optional)
Secrets and environment variables:
```
GITHUB_TOKEN=your_github_token_here
GCP_PROJECT_ID=your_gcp_project_id
FIREBASE_TOKEN=your_firebase_token
NODE_VERSION=18
```

## Troubleshooting

### Docker Issues
```powershell
# Check if Docker is running
docker info

# If Docker isn't running, start Docker Desktop
```

### Act Installation Issues
```powershell
# Reinstall act
winget uninstall nektos.act
winget install nektos.act

# Check act version
act --version
```

### Workflow Failures
```powershell
# Run with more verbose output
act pull_request --workflows .github/workflows/pr-validation.yml --verbose

# Run specific job only
act pull_request --workflows .github/workflows/pr-validation.yml --job lint-frontend

# Skip jobs that require secrets
act pull_request --workflows .github/workflows/pr-validation.yml --job validate-structure
```

### Container Issues
```powershell
# Pull latest runner images
docker pull ghcr.io/catthehacker/ubuntu:act-latest

# Clean up old containers
docker system prune -f

# Reset act containers
act --rm
```

## Best Practices

### 1. Regular Validation
Run PR validation before every commit:
```powershell
./deploy-with-act.ps1 -RunPRValidation
```

### 2. Test Before Production
Always test production workflows locally:
```powershell
./deploy-with-act.ps1 -RunProduction
```

### 3. Incremental Testing
Test specific jobs when debugging:
```powershell
act pull_request --job security-scan
act pull_request --job test-backend
```

### 4. Use Dry Run
For deployment workflows, use dry run:
```powershell
act push --workflows .github/workflows/deploy-production.yml --dry-run
```

## Integration with Development Workflow

### Recommended Development Flow

1. **Make Changes**
   ```bash
   git checkout -b feature/your-feature
   # Make your changes
   ```

2. **Test Locally with Act**
   ```powershell
   ./deploy-with-act.ps1 -RunPRValidation
   ```

3. **Fix Any Issues**
   - Address linting errors
   - Fix failing tests
   - Resolve security issues

4. **Test Full Deployment**
   ```powershell
   ./deploy-with-act.ps1
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin feature/your-feature
   ```

6. **Create PR**
   - GitHub Actions will run the same workflows
   - They should pass since you tested locally

### Emergency Production Deployment

For emergency situations:

1. **Test Production Workflow**
   ```powershell
   ./deploy-with-act.ps1 -RunProduction
   ```

2. **Deploy if Tests Pass**
   ```powershell
   ./deploy.ps1 prod -ConfirmBreakGlass -RunGitHubActions
   ```

## Performance Tips

- Use `--reuse` flag to reuse containers between runs
- Pull runner images once: `docker pull ghcr.io/catthehacker/ubuntu:act-latest`
- Use specific job targeting for faster feedback
- Keep Docker Desktop running to avoid startup delays

## Security Notes

- Never commit real secrets to `.env.act`
- Use `.env.act` only for local testing
- Production secrets should remain in GitHub Secrets
- The `--dry-run` flag prevents actual deployments during testing

## Getting Help

- Check the [act documentation](https://github.com/nektos/act)
- Use `act --help` for command options
- Use `./deploy-with-act.ps1 --help` for script options
- Check workflow logs for specific error details 