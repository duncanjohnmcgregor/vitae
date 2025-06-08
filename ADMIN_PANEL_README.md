# Vitae Admin Panel

## Overview
The Vitae Admin Panel provides a secure interface for managing customer stories and collecting answers to guided questions. It now uses Firebase Authentication with custom admin claims for secure access control.

## Security Features
- ✅ Firebase Authentication for login
- ✅ Custom admin claims for authorization
- ✅ JWT token verification on all API calls
- ✅ Secure Firestore rules with admin-only access
- ✅ Audit trail (tracks who created/updated stories)

## Access
- URL: `/admin` (or `http://localhost:8080/admin` for local development)
- Authentication: Firebase Auth with admin claims

## Setting Up Admin Users

### Prerequisites
1. Firebase project must be configured
2. User must have a Firebase Auth account
3. You need the admin secret key

### Steps to Grant Admin Access

1. **Create a Firebase Auth Account**
   - Go to Firebase Console > Authentication
   - Add a new user with email/password
   - Note the email address

2. **Grant Admin Claims**
   ```bash
   # Run the setup script
   node setup-admin-user.js
   
   # Follow the prompts:
   # - Choose environment (local/production)
   # - Enter the user's email
   # - Enter the admin secret key (default: vitae-admin-secret-2024)
   ```

3. **Sign In**
   - Navigate to `/admin`
   - Sign in with the email/password
   - The system will verify admin claims

### Setting Admin Secret Key (Production)

For production, set the admin secret as an environment variable:

```bash
# Deploy with environment variable
firebase functions:config:set admin.secret="your-secure-secret-key"
firebase deploy --only functions
```

## Features

### 1. Authentication
- Firebase Authentication with email/password
- Custom admin claims for authorization
- Session persists across browser refreshes
- Secure sign-out functionality

### 2. Create New Customer Story
- Click "Start New Story" button
- Enter customer name and email
- System creates a new story with placeholder questions
- Tracks who created the story and when

### 3. Manage Questions & Answers
- After creating a story, you'll see a list of questions
- Enter customer answers in the text areas
- Add custom questions using the "Add Question" button
- Save all answers with "Save All Answers" button
- System tracks who last updated the story

### 4. View Stories
- Click "View All Stories" to see all customer stories
- Shows customer name, email, and creation date
- Shows who created each story
- Click "View Details" to see full story (coming soon)

## Placeholder Questions
The system starts with these default questions:
1. What is your earliest childhood memory?
2. Who was the most influential person in your life?
3. What was your greatest achievement?
4. What advice would you give to your younger self?
5. What tradition or value do you hope to pass on to future generations?

## Firebase Integration

### Firestore Collections
- `customer-stories`: Stores all customer stories
  - Customer name and email
  - Array of questions with answers
  - Creation and update timestamps
  - Created/updated by user info
  - Status (in-progress or completed)

### Security Rules
The project includes two Firestore rules files:
- `firestore.rules`: Development rules (less restrictive)
- `firestore.rules.production`: Production rules (secure)

**Important**: Before deploying to production, replace the development rules:
```bash
# Copy production rules
cp firestore.rules.production firestore.rules

# Deploy the secure rules
firebase deploy --only firestore:rules
```

## Local Development

1. **Start Firebase emulators:**
   ```bash
   firebase emulators:start --only functions,firestore,auth
   ```

2. **Create a test admin user:**
   ```bash
   # In the emulator Auth UI, create a user
   # Then run:
   node setup-admin-user.js
   # Choose 'local' and use the test user's email
   ```

3. **Access the admin panel:**
   ```
   http://localhost:8080/admin
   ```

## Production Deployment

### 1. Set Environment Variables
```bash
# Set the admin secret
firebase functions:config:set admin.secret="your-secure-secret-key"
```

### 2. Deploy Secure Firestore Rules
```bash
# Use production rules
cp firestore.rules.production firestore.rules
firebase deploy --only firestore:rules
```

### 3. Deploy Functions
```bash
firebase deploy --only functions
```

### 4. Deploy Hosting
```bash
firebase deploy --only hosting
```

### 5. Create Production Admin Users
```bash
node setup-admin-user.js
# Choose 'production' and use your secure secret key
```

## Security Best Practices

1. **Change the Admin Secret**: Never use the default secret in production
2. **Use Strong Passwords**: Enforce strong passwords for admin accounts
3. **Limit Admin Access**: Only grant admin access to trusted users
4. **Monitor Access**: Regularly review admin user list
5. **Enable 2FA**: Consider enabling two-factor authentication for admin accounts
6. **HTTPS Only**: Ensure production deployment uses HTTPS
7. **Regular Audits**: Review who has created/modified stories

## Troubleshooting

### "Access denied" after login
- Ensure the user has admin claims set
- User may need to sign out and sign back in
- Check browser console for specific errors

### "No authorization token provided"
- Ensure you're logged in
- Try refreshing the page
- Clear browser cache and cookies

### Cannot set admin claims
- Verify the admin secret key is correct
- Ensure Firebase Functions are deployed
- Check function logs for errors

## Future Enhancements
- Two-factor authentication
- Role-based access control (viewer vs editor)
- Activity logs and audit trails
- Export stories to PDF
- Email notifications
- Question templates/categories
- Search and filter functionality
- Bulk operations 