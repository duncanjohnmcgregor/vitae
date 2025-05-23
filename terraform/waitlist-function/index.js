const functions = require('@google-cloud/functions-framework');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Register an HTTP function with the Functions Framework
functions.http('handleWaitlistSubmission', async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { email, name } = req.body;

    // Validate input
    if (!email || !name) {
      res.status(400).json({ error: 'Email and name are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Get Firestore instance
    const db = admin.firestore();
    const collection = db.collection(process.env.FIRESTORE_COLLECTION || 'waitlist');

    // Check if email already exists
    const existingEntry = await collection.where('email', '==', email).get();
    if (!existingEntry.empty) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Add new entry
    await collection.add({
      email,
      name,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'pending'
    });

    res.status(200).json({ message: 'Successfully joined the waitlist!' });
  } catch (error) {
    console.error('Error processing waitlist submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}); 