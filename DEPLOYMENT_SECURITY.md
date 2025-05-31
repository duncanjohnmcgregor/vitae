# Deployment & Security Guide

## Overview
This guide covers the security considerations and deployment process for the Vitae Admin Panel with Firebase Authentication.

## Security Architecture

### Authentication Flow
1. User enters email/password on admin login page
2. Firebase Auth validates credentials
3. System checks for admin custom claim
4. If valid, JWT token is returned
5. All API calls include the JWT token
6. Cloud Functions verify token and admin claim

### Security Layers
- **Frontend**: Firebase Auth SDK handles authentication
- **API**: Cloud Functions verify JWT tokens
- **Database**: Firestore rules enforce admin-only access
- **Audit Trail**: All actions tracked with user info

## Pre-Deployment Checklist

- [ ] Change default admin secret key
- [ ] Review Firestore security rules
- [ ] Enable Firebase Auth in console
- [ ] Configure allowed domains in Firebase
- [ ] Set up environment variables
- [ ] Test authentication flow locally
- [ ] Review admin user list

## Environment Variables

### For Cloud Functions
```bash
# Set admin secret (required)
firebase functions:config:set admin.secret="your-very-secure-secret-key"

# View current config
firebase functions:config:get

# Remove config (if needed)
firebase functions:config:unset admin.secret
```

### For Local Development
Create a `.runtimeconfig.json` file in the functions directory:
```json
{
  "admin": {
    "secret": "your-local-development-secret"
  }
}
```

## Deployment Steps

### Quick Deploy (Secure)
```bash
# Use the deployment script
./deploy-production.sh
```

### Manual Deploy
```bash
# 1. Set environment variables
firebase functions:config:set admin.secret="your-secure-secret"

# 2. Apply production rules
cp firestore.rules.production firestore.rules

# 3. Deploy everything
firebase deploy

# 4. Create admin users
node setup-admin-user.js
```

## Creating Admin Users

### First Admin User
1. Enable Email/Password auth in Firebase Console
2. Create a user account in Firebase Auth
3. Run the setup script:
   ```bash
   node setup-admin-user.js
   # Choose 'production'
   # Enter user email
   # Enter admin secret
   ```

### Additional Admin Users
Repeat step 3 for each additional admin user.

### Removing Admin Access
Currently manual process:
1. Go to Firebase Console > Functions
2. Find the user in Authentication
3. Remove custom claims (requires custom script)

## Security Best Practices

### 1. Admin Secret Key
- **Never** commit the secret to version control
- Use a strong, unique secret for production
- Rotate the secret periodically
- Store securely (password manager, secure vault)

### 2. User Accounts
- Enforce strong password requirements
- Enable 2FA when available
- Regularly audit admin users
- Remove access promptly when needed

### 3. Firestore Rules
- Always use production rules in production
- Test rules thoroughly before deployment
- Never use `allow read, write: if true` in production
- Keep rules as restrictive as possible

### 4. Monitoring
- Enable Firebase Analytics
- Monitor function invocations
- Set up alerts for suspicious activity
- Regular security audits

### 5. HTTPS
- Always use HTTPS in production
- Configure proper SSL certificates
- Enable HSTS if possible

## Testing Security

### Local Testing
```bash
# Start emulators with auth
firebase emulators:start --only functions,firestore,auth

# Test without admin claim (should fail)
# Test with admin claim (should succeed)
```

### Production Testing
1. Create a test admin account
2. Verify login works
3. Test all CRUD operations
4. Verify non-admin users are blocked
5. Check audit trail is working

## Troubleshooting Security Issues

### "Permission Denied" in Firestore
- Check if user has admin claim
- Verify Firestore rules are correct
- Check if authenticated properly

### "Invalid Token" Errors
- Token may be expired (re-login)
- Check if Firebase project ID matches
- Verify API keys are correct

### Cannot Set Admin Claims
- Verify admin secret is correct
- Check function deployment status
- Review function logs

## Emergency Procedures

### Revoke All Admin Access
```bash
# Deploy restrictive rules immediately
echo 'rules_version = "2";
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}' > firestore.rules

firebase deploy --only firestore:rules
```

### Disable Admin Panel
Remove or rename admin.html to prevent access.

### Rotate Admin Secret
```bash
# Set new secret
firebase functions:config:set admin.secret="new-secret-key"

# Redeploy functions
firebase deploy --only functions
```

## Compliance Considerations

### Data Protection
- Customer stories contain personal information
- Implement data retention policies
- Provide data export functionality
- Enable audit logging

### Access Control
- Document who has admin access
- Implement principle of least privilege
- Regular access reviews
- Maintain access logs

## Future Security Enhancements

1. **Two-Factor Authentication**
   - Implement 2FA for admin accounts
   - Use Firebase Auth MFA features

2. **Role-Based Access**
   - Implement viewer vs editor roles
   - Granular permissions per story

3. **IP Whitelisting**
   - Restrict admin access by IP
   - Implement in Cloud Functions

4. **Session Management**
   - Implement session timeouts
   - Force re-authentication for sensitive actions

5. **Encryption**
   - Encrypt sensitive data at rest
   - Implement field-level encryption

## Security Audit Checklist

Perform monthly:
- [ ] Review admin user list
- [ ] Check function invocation logs
- [ ] Verify Firestore rules haven't changed
- [ ] Test authentication flow
- [ ] Review any security alerts
- [ ] Update dependencies
- [ ] Rotate admin secret (quarterly) 