# DevOps Setup Guide

This guide will help you set up the complete DevOps pipeline for automatic deployment of your Vitae project when pull requests are merged into the main branch.

## Overview

The DevOps scaffold includes:

- **Production Deployment**: Automatic deployment to production when PRs are merged to main
- **PR Validation**: Comprehensive validation of code, configuration, and deployment scripts on every PR
- **Manual Deployment**: Ability to manually trigger deployments with custom parameters

## Prerequisites

Before setting up the CI/CD pipeline, ensure you have:

1. A Firebase project set up for production
2. A Google Cloud Project with billing enabled
3. Repository admin access to configure secrets
4. `gcloud` CLI installed locally for initial setup

## Step 1: Create Google Cloud Service Account

Create a service account that GitHub Actions will use to deploy your application:

```bash
# Set your project ID
export PROJECT_ID="your-gcp-project-id"

# Create service account
gcloud iam service-accounts create github-actions-deploy \
    --description="Service account for GitHub Actions deployment" \
    --display-name="GitHub Actions Deploy" \
    --project=$PROJECT_ID

# Get the service account email
export SA_EMAIL="github-actions-deploy@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant necessary roles for Firebase and GCP deployment
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudfunctions.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/compute.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"

# If using Terraform (recommended)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/editor"

# Create and download the service account key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL \
    --project=$PROJECT_ID
```

## Step 2: Get Firebase CI Token

Generate a Firebase CI token for GitHub Actions:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Generate CI token
firebase login:ci
```

**Important**: Save the generated token - you'll need it in Step 4.

## Step 3: Enable Required Google Cloud APIs

Enable the necessary APIs for your project:

```bash
gcloud services enable cloudfunctions.googleapis.com \
    storage-api.googleapis.com \
    compute.googleapis.com \
    dns.googleapis.com \
    firebase.googleapis.com \
    firebasehosting.googleapis.com \
    --project=$PROJECT_ID
```

## Step 4: Configure GitHub Repository Secrets

Go to your GitHub repository settings and add the following secrets:

### Required Secrets

Navigate to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

1. **`GCP_SA_KEY`**
   - Content: The entire contents of the `github-actions-key.json` file you created in Step 1
   - This should be the complete JSON object including the braces

2. **`FIREBASE_TOKEN`**
   - Content: The CI token generated in Step 2
   - Should be a long string starting with something like `1//`

3. **`GCP_PROJECT_ID`**
   - Content: Your Google Cloud Project ID (e.g., `vitae-prod-123456`)

### Optional Variables

Navigate to **Settings** → **Secrets and variables** → **Actions** → **Variables** tab

1. **`GCP_REGION`** (optional)
   - Content: Your preferred GCP region (default: `us-central1`)
   - Examples: `us-central1`, `europe-west1`, `asia-southeast1`

## Step 5: Update Project Configuration

### Update `.firebaserc`

Ensure your `.firebaserc` file has the correct production project:

```json
{
  "projects": {
    "default": "your-local-project",
    "prod": "your-production-project-id"
  }
}
```

### Update Terraform Configuration

If using Terraform, ensure your `terraform/terraform.tfvars` file exists and contains:

```hcl
project_id = "your-production-project-id"
region = "us-central1"
environment = "prod"
website_source_dir = "../src"
bucket_name = "vitae-website-prod"
enable_load_balancer = true
enable_ssl = true
enable_versioning = true
```

## Step 6: Test the Setup

### Test PR Validation

1. Create a test branch:
   ```bash
   git checkout -b test-devops-setup
   ```

2. Make a small change to any file and commit:
   ```bash
   echo "# Test change" >> README.md
   git add README.md
   git commit -m "Test DevOps setup"
   git push origin test-devops-setup
   ```

3. Create a pull request to `main` branch

4. Verify that the "PR Validation" workflow runs and passes

### Test Manual Deployment

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Choose your deployment options and run

### Test Automatic Deployment

1. Merge your test pull request into main
2. Verify that the "Deploy to Production" workflow triggers automatically
3. Check that your website deploys successfully

## Step 7: Security Best Practices

### Service Account Key Management

- **Never commit** the service account key file to your repository
- **Rotate keys regularly** (recommended: every 90 days)
- **Use least privilege**: Only grant necessary permissions
- **Monitor usage** through Google Cloud Console

### Repository Security

- **Enable branch protection** for the `main` branch:
  - Go to **Settings** → **Branches** → **Add rule**
  - Require status checks (PR Validation workflow)
  - Require up-to-date branches
  - Restrict push access

- **Require reviews** for pull requests
- **Enable Dependabot** for security updates

### Secrets Management

- **Use repository secrets** instead of hardcoding values
- **Regularly audit** who has access to repository secrets
- **Consider using environment-specific secrets** for staging/production

## Workflow Overview

### What Happens on PR Creation/Update

1. **PR Validation** workflow runs:
   - Validates PowerShell script syntax
   - Checks Firebase configuration
   - Installs and validates dependencies
   - Runs security scans
   - Validates Terraform configuration

### What Happens on PR Merge to Main

1. **Deploy to Production** workflow runs:
   - Sets up Node.js, Terraform, and Firebase CLI
   - Authenticates with Google Cloud and Firebase
   - Installs all dependencies
   - Runs your `deploy.ps1` script with production parameters
   - Verifies deployment success
   - Provides deployment summary

## Troubleshooting

### Common Issues

#### Authentication Errors

**Problem**: `Error: failed to retrieve credentials`
**Solution**: 
- Verify `GCP_SA_KEY` secret contains the complete JSON key
- Ensure the service account has necessary permissions
- Check that the service account key hasn't expired

#### Firebase Token Issues

**Problem**: `Error: Authentication Error`
**Solution**:
- Regenerate Firebase CI token: `firebase login:ci`
- Update the `FIREBASE_TOKEN` secret in GitHub
- Ensure the token has access to your Firebase project

#### Deployment Failures

**Problem**: Deployment fails with "project not found"
**Solution**:
- Verify `GCP_PROJECT_ID` secret matches your actual project ID
- Ensure the project exists and billing is enabled
- Check that required APIs are enabled

#### Permission Errors

**Problem**: `Error: insufficient permissions`
**Solution**:
- Review service account permissions in Step 1
- Ensure the service account has `firebase.admin` role
- Add additional roles if using specific GCP services

### Getting Help

1. **Check workflow logs**: Go to Actions tab and review failed step logs
2. **Verify configurations**: Double-check all secrets and variables
3. **Test locally**: Run `.\deploy.ps1 -Environment prod` locally first
4. **Review permissions**: Use `gcloud iam` commands to verify service account roles

## Additional Resources

- [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)

---

## Quick Reference Commands

### Rotate Service Account Key

```bash
# Delete old key (get key ID from Google Cloud Console)
gcloud iam service-accounts keys delete KEY_ID \
    --iam-account=$SA_EMAIL \
    --project=$PROJECT_ID

# Create new key
gcloud iam service-accounts keys create github-actions-key-new.json \
    --iam-account=$SA_EMAIL \
    --project=$PROJECT_ID

# Update GitHub secret with new key content
```

### Update Firebase Token

```bash
firebase login:ci
# Update GitHub FIREBASE_TOKEN secret with new token
```

### Check Service Account Permissions

```bash
gcloud projects get-iam-policy $PROJECT_ID \
    --flatten="bindings[].members" \
    --filter="bindings.members:serviceAccount:$SA_EMAIL"
``` 