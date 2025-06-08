# Local Authentication Testing Guide

This guide helps you test the admin panel authentication using Firebase emulators.

## Prerequisites

1. Firebase CLI installed (`npm install -g firebase-tools`)
2. Node.js installed
3. Project dependencies installed

## Setup Steps

### 1. Start Firebase Emulators

```bash
# Start all emulators including auth
firebase emulators:start --only functions,firestore,auth,hosting

# Or start all emulators
firebase emulators:start
```

The emulators will start on these ports:
- **Auth Emulator**: http://localhost:9099
- **Functions Emulator**: http://localhost:5001
- **Firestore Emulator**: http://localhost:8081
- **Hosting Emulator**: http://localhost:3000
- **Emulator UI**: http://localhost:4001

### 2. Access the Emulator UI

Open http://localhost:4001 in your browser to access the Firebase Emulator Suite UI.

### 3. Create a Test User

#### Option A: Using Emulator UI
1. Go to the Emulator UI (http://localhost:4001)
2. Click on "Authentication" tab
3. Click "Add user"
4. Enter email and password (e.g., `admin@test.com` / `testpass123`)
5. Click "Save"

#### Option B: Using Admin Panel
1. Go to http://localhost:3000/admin
2. You'll see a link to create an account (if implemented)
3. Or use the Firebase SDK in browser console

### 4. Grant Admin Access

```bash
# Run the setup script
node setup-admin-user.js

# When prompted:
# - Choose 'local' for environment
# - Enter the test user's email (e.g., admin@test.com)
# - Enter the local dev secret: local-dev-secret-2024
```

### 5. Test Login

1. Go to http://localhost:3000/admin
2. Sign in with your test credentials
3. You should see the admin panel

## Testing Scenarios

### 1. Valid Admin Login
- Create user → Grant admin claim → Login
- **Expected**: Access granted to admin panel

### 2. Non-Admin User
- Create user → Don't grant admin claim → Login
- **Expected**: "Access denied" message

### 3. Invalid Credentials
- Try to login with wrong email/password
- **Expected**: Authentication error

### 4. Token Expiry
- Login successfully → Wait for token to expire (1 hour)
- **Expected**: Automatic token refresh or re-login prompt

### 5. API Authorization
- Login as admin → Create a customer story
- **Expected**: Story created successfully
- Check Firestore emulator to verify data

## Debugging Tips

### Check Auth Emulator Status
Open browser console and look for:
```
Connected to Auth emulator
```

### View Current User
In browser console:
```javascript
const auth = window.firebaseAuth;
console.log(auth.currentUser);
```

### Check Admin Claims
```javascript
const user = auth.currentUser;
if (user) {
  user.getIdTokenResult().then(result => {
    console.log('Admin claim:', result.claims.admin);
  });
}
```

### Clear Auth State
```javascript
auth.signOut();
```

## Common Issues

### "Cannot connect to Auth emulator"
- Ensure emulators are running
- Check if auth emulator is on port 9099
- Verify no other process is using the port

### "Access denied" for admin user
- User might not have admin claim
- Re-run `setup-admin-user.js`
- Sign out and sign back in

### "CORS error" on API calls
- Ensure you're accessing via localhost:3000
- Not via file:// protocol

### Changes not reflecting
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Sign out and sign back in

## Emulator Data Persistence

By default, emulator data is cleared when stopped. To persist data:

```bash
# Export data before stopping
firebase emulators:export ./emulator-data

# Import data when starting
firebase emulators:start --import ./emulator-data
```

## Testing Checklist

- [ ] Auth emulator connects successfully
- [ ] Can create users in emulator
- [ ] Admin claim script works locally
- [ ] Login/logout flow works
- [ ] API calls include auth token
- [ ] Firestore rules enforce auth
- [ ] Non-admin users are blocked
- [ ] Session persists on refresh

## Useful Commands

```bash
# View emulator logs
cat firebase-debug.log

# Kill emulators if stuck
lsof -ti:9099 | xargs kill -9  # Auth
lsof -ti:5001 | xargs kill -9  # Functions
lsof -ti:8081 | xargs kill -9  # Firestore
lsof -ti:3000 | xargs kill -9  # Hosting

# Clear all emulator data
rm -rf .firebase/
``` 