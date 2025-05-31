# GitHub Actions Setup for Admin Panel Deployment

This guide explains how to configure GitHub Actions for automatic production deployment with admin panel support.

## Required GitHub Secrets

### 1. **GCP_PROJECT_ID**
Your Firebase/Google Cloud project ID.
- Example: `vitae-460717`
- Already configured ✓

### 2. **GCP_SA_KEY**
Service account key for Firebase deployment.
- Already configured ✓

### 3. **FIREBASE_ADMIN_SECRET** (NEW - Required for Admin Panel)
Secret key for granting admin access to users.

#### Setting up FIREBASE_ADMIN_SECRET:

1. **Generate a secure secret**:
   ```bash
   # Generate a secure random secret
   openssl rand -base64 32
   ```

2. **Add to GitHub Secrets**:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_ADMIN_SECRET`
   - Value: Your generated secret
   - Click "Add secret"

3. **Important**: Save this secret securely - you'll need it to grant admin access to users

## Deployment Workflow Features

The updated `deploy-production.yml` workflow now includes:

### 🔒 Security Features
- **Automatic Production Rules**: Detects and replaces development Firestore rules
- **Admin Secret Configuration**: Sets Firebase functions config from GitHub secrets
- **Security Validation**: Pre-deployment checks for security configuration

### 🚀 Admin Panel Features
- **Route Validation**: Ensures `/admin` route is configured
- **File Validation**: Checks that `admin.html` exists
- **Post-deployment Testing**: Verifies admin panel accessibility
- **Deployment Summary**: Includes admin panel URL and security status

### 📋 Pre-deployment Checks
- Validates all required files exist
- Checks for admin route in `firebase.json`
- Automatically applies production Firestore rules if needed
- Warns if admin secret is not configured

### ✅ Post-deployment Verification
- Tests main website accessibility
- Tests admin panel route (`/admin`)
- Verifies correct content is served
- Includes security configuration in deployment summary

## Usage

### Automatic Deployment (on push to main)
```bash
git add .
git commit -m "feat: add admin panel"
git push origin main
```

### Manual Deployment
1. Go to Actions tab in GitHub
2. Select "🚀 Deploy to Production"
3. Click "Run workflow"
4. Select branch and options
5. Click "Run workflow"

## Deployment Summary

After deployment, check the workflow summary for:
- ✅ All services deployment status
- 🌐 Production URLs (including admin panel)
- 🔒 Security configuration status
- ⚠️ Any warnings or issues

## Creating Admin Users After Deployment

Once deployed with the admin secret configured:

```bash
# On your local machine
node setup-admin-user.js

# Choose 'production'
# Enter admin email
# Enter the secret you set in FIREBASE_ADMIN_SECRET
```

## Troubleshooting

### "FIREBASE_ADMIN_SECRET not set" warning
- Add the secret to GitHub repository settings
- Re-run the deployment workflow

### Admin panel not accessible
- Check deployment logs for route configuration
- Verify `admin.html` was uploaded
- Check browser console for errors

### "Invalid secret key" when creating admin users
- Ensure you're using the exact secret from GitHub secrets
- Check if functions were deployed with the secret
- View function logs: `firebase functions:log`

## Security Best Practices

1. **Use a strong admin secret** - Never use default values in production
2. **Rotate secrets periodically** - Update both GitHub secrets and redeploy
3. **Limit repository access** - Only trusted team members should have access
4. **Monitor deployments** - Review deployment summaries for security warnings
5. **Audit admin users** - Regularly review who has admin access
6. **Principle of Least Privilege for Service Accounts**: Ensure the `GCP_SA_KEY` (and any other service account keys) corresponds to a service account with only the minimum necessary permissions required for its tasks (e.g., Firebase deployment).
7. **Enable Repository Secret Scanning**: Configure and enable GitHub's secret scanning feature for your repository to help detect accidentally committed secrets.
