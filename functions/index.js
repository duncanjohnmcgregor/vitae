/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

// Configure Firestore to use the emulator for local development
if (process.env.FUNCTIONS_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
}

const { FieldValue } = admin.firestore;

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.handleWaitlistSubmission = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
      }

      console.log('Email submission received:', email);

      // Save to Firestore
      const db = admin.firestore();
      const docRef = await db.collection('waitlist').add({
        email,
        timestamp: new Date(),
        name: req.body.name || '',
        userAgent: req.headers['user-agent'] || '',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''
      });

      console.log('Document written with ID: ', docRef.id);

      res.status(200).json({ 
        success: true, 
        message: 'Successfully joined the waitlist!',
        id: docRef.id
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
});
