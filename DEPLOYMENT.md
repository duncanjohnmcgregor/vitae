# Vitae Deployment Guide

This guide explains how to deploy the Vitae landing page using the `deploy.ps1` PowerShell script for both local development and production environments.

## Prerequisites

### Required Tools

Before running the deployment script, ensure you have the following tools installed:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Firebase CLI** - Install with `npm install -g firebase-tools`

### Additional Requirements for Production

- **Google Cloud SDK** - [Download here](https://cloud.google.com/sdk/docs/install)
- **Terraform** - [Download here](https://www.terraform.io/downloads.html)

### Firebase Project Setup

1. Create Firebase projects for local and production:
   - Local: `vitae-local` 
   - Production: `vitae-prod` (or use your own project ID)

2. Update `.firebaserc` if using different project IDs:
   ```json
   {
     "projects": {
       "default": "your-local-project",
       "prod": "your-production-project"
     }
   }
   ```

3. Authenticate with Firebase:
   ```powershell
   firebase login
   ```

### Google Cloud Setup (Production Only)

1. Authenticate with Google Cloud:
   ```powershell
   gcloud auth login
   gcloud auth application-default login
   ```

2. Enable required APIs:
   ```powershell
   gcloud services enable cloudfunctions.googleapis.com
   gcloud services enable storage-api.googleapis.com
   gcloud services enable compute.googleapis.com
   gcloud services enable dns.googleapis.com
   ```

## Usage

### Local Development

Start local development environment with Firebase emulators:

```powershell
.\deploy.ps1
```

Or explicitly specify local environment:

```powershell
.\deploy.ps1 -Environment local
```

This will:
- Install Firebase Functions dependencies
- Start Firebase emulators (Functions, Firestore, Hosting, UI)
- Update `src/script.js` with local function URL
- Provide access URLs for testing

**Local URLs:**
- Website: http://localhost:3000
- Firebase UI: http://localhost:4001
- Functions: http://localhost:5001/vitae-local/us-central1/handleWaitlistSubmission
- Firestore: http://localhost:8081

### Production Deployment

Deploy to production with both Terraform infrastructure and Firebase:

```powershell
.\deploy.ps1 -Environment prod
```

🎯 **New Feature**: The script will automatically use the project ID from your `terraform/terraform.tfvars` file. If no terraform configuration is found, it will prompt you for the project ID.

You can also explicitly specify a project ID:

```powershell
.\deploy.ps1 -Environment prod -ProjectId your-gcp-project-id
```

Optional parameters:
- `-Region`: Specify GCP region (default: us-central1)
- `-SkipTerraform`: Skip Terraform infrastructure deployment
- `-SkipFirebase`: Skip Firebase deployment
- `-DeployFunctionsOnly`: Deploy only Firebase Functions

#### Examples

Deploy everything to production (using terraform config):
```powershell
.\deploy.ps1 -Environment prod
```

Deploy with explicit project ID:
```powershell
.\deploy.ps1 -Environment prod -ProjectId vitae-prod-123
```

Deploy only Firebase Functions:
```powershell
.\deploy.ps1 -Environment prod -DeployFunctionsOnly
```

Deploy with different region:
```powershell
.\deploy.ps1 -Environment prod -Region europe-west1
```

Skip Terraform (Firebase only):
```powershell
.\deploy.ps1 -Environment prod -SkipTerraform
```

### Production Deployment Process

When deploying to production, the script will:1. **Auto-detect Project Configuration**   - Read project ID from `terraform/terraform.tfvars` if available   - Prompt for project ID only if not found in config2. **Validate Prerequisites**   - Check for required tools   - Authenticate with Google Cloud   - Set up project configuration3. **Deploy Firebase Functions**   - Install dependencies   - Deploy to Firebase Functions   - Configure environment variables4. **Deploy Firestore Rules**   - Deploy database security rules   - Configure waitlist collection access5. **Update Website Configuration**   - Update `src/script.js` with production function URL   - Prepare static assets6. **Deploy Firebase Hosting**   - Deploy website to Firebase Hosting   - Configure caching and security headers7. **Deploy Terraform Infrastructure** (if not skipped)
   - Initialize Terraform
   - Use existing terraform.tfvars or create new one
   - Create/update GCP resources:
     - Cloud Storage bucket for static hosting
     - Load Balancer with CDN
     - SSL certificates (if domain configured)
     - DNS records (if domain configured)

## Configuration

### Environment Variables

The script automatically sets up environment variables for different deployment contexts.

### Terraform Configuration

The script will use your existing `terraform/terraform.tfvars` file if it exists, or create a new one with default production settings:

```hcl
project_id = "your-project-id"
region = "us-central1"
environment = "prod"
website_source_dir = "../src"
bucket_name = "vitae-website-prod"
enable_load_balancer = true
enable_ssl = true
enable_versioning = true
```

You can modify these values or add additional variables as needed.

### Firebase Configuration

The Firebase configuration is defined in `firebase.json`:
- Hosting serves files from the `src/` directory
- Functions are deployed from the `functions/` directory
- Emulators run on predefined ports for local development

## Troubleshooting

### Common Issues

1. **"Command not found" errors**
   - Ensure all required tools are installed and in your PATH
   - Restart your terminal after installing tools

2. **Authentication errors**
   - Run `firebase login` and `gcloud auth login`
   - Ensure you have the necessary permissions for the projects

3. **Terraform errors**
   - Ensure the GCP project exists and billing is enabled
   - Check that required APIs are enabled
   - Verify Terraform is properly installed

4. **Firebase project errors**
   - Ensure Firebase projects exist and are properly configured
   - Check `.firebaserc` for correct project IDs
   - Verify you have owner/editor permissions

5. **Project ID detection issues**
   - Ensure `terraform/terraform.tfvars` exists and contains `project_id = "your-project"`
   - Check file permissions if the script can't read terraform.tfvars
   - Manually specify `-ProjectId` if auto-detection fails

### Logs and Debugging

- Firebase emulator logs are displayed in the console
- Terraform state is stored in `terraform/terraform.tfstate`
- Check Firebase console for function logs: https://console.firebase.google.com/
- Check GCP console for infrastructure: https://console.cloud.google.com/

## Cleanup

### Stop Local Development
Press `Ctrl+C` to stop Firebase emulators.

### Destroy Production Resources
To clean up production resources:

```powershell
cd terraform
terraform destroy -var-file=terraform.tfvars
```

## Security Notes

- The script sets appropriate CORS headers for web security
- SSL is enabled by default for production deployments
- Firebase security rules are applied from `firestore.rules`
- Terraform state contains sensitive information - store securely

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs from Firebase and GCP consoles
3. Ensure all prerequisites are properly installed and configured 