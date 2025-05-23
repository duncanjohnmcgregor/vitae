const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.handleWaitlistSubmission = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        res.status(400).send('Invalid email address');
        return;
      }

      const db = admin.firestore();
      await db.collection('waitlist').add({
        email,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(200).send('Successfully joined the waitlist!');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });
});
