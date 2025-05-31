#!/usr/bin/env node

const readline = require('readline');
const https = require('https');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('====================================');
console.log('Vitae Admin User Setup');
console.log('====================================\n');

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function setupAdminUser() {
  try {
    // Get environment
    const environment = await askQuestion('Environment (local/production)? [local]: ');
    const isLocal = !environment || environment.toLowerCase() === 'local';
    
    // Get admin email
    const email = await askQuestion('Enter the email address for the admin user: ');
    if (!email || !email.includes('@')) {
      console.error('Invalid email address');
      process.exit(1);
    }
    
    // Get secret key
    const secretKey = await askQuestion('Enter the admin secret key: ');
    if (!secretKey) {
      console.error('Secret key is required');
      process.exit(1);
    }
    
    // Determine the function URL
    const functionUrl = isLocal 
      ? 'http://127.0.0.1:5001/vitae-local/us-central1/setAdminClaim'
      : 'https://us-central1-vitae-460717.cloudfunctions.net/setAdminClaim';
    
    console.log(`\nSetting up admin user: ${email}`);
    console.log(`Using function URL: ${functionUrl}\n`);
    
    // Make the request
    const data = JSON.stringify({ email, secretKey });
    const url = new URL(functionUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          
          if (response.success) {
            console.log('✅ Success!', response.message);
            console.log('\nNext steps:');
            console.log('1. Make sure the user has created an account in Firebase Auth');
            console.log('2. The user can now sign in to the admin panel at /admin');
            console.log('\nNote: The user may need to sign out and sign back in for the admin claim to take effect.');
          } else {
            console.error('❌ Error:', response.error || 'Unknown error');
          }
        } catch (e) {
          console.error('❌ Error parsing response:', e.message);
          console.error('Response:', responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
      if (isLocal) {
        console.log('\nMake sure Firebase emulators are running:');
        console.log('firebase emulators:start --only functions,firestore,auth');
      }
    });
    
    req.write(data);
    req.end();
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

// Instructions
console.log('This script will grant admin access to a user.');
console.log('Prerequisites:');
console.log('- The user must have a Firebase Auth account');
console.log('- You must know the admin secret key');
console.log('- For local setup, Firebase emulators must be running\n');

setupAdminUser(); 