/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

// Configure Firestore to use the emulator for local development
if (process.env.FUNCTIONS_EMULATOR) {
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081";
}

// const {FieldValue} = admin.firestore; // Removed unused import

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.handleWaitlistSubmission = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    try {
      // Check for malformed JSON or missing body
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({error: "Invalid request body"});
        return;
      }

      const {email} = req.body;

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 254) {
        res.status(400).json({error: "Invalid email address"});
        return;
      }

      console.log("Email submission received:", email);

      // Save to Firestore
      const db = admin.firestore();
      const docRef = await db.collection("waitlist").add({
        email,
        timestamp: new Date(),
        name: req.body.name || "",
        userAgent: req.headers["user-agent"] || "",
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "",
      });

      console.log("Document written with ID: ", docRef.id);

      res.status(200).json({
        success: true,
        message: "Successfully joined the waitlist!",
        id: docRef.id,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });
});

exports.handleStartStorySubmission = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    try {
      // Check for malformed JSON or missing body
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({error: "Invalid request body"});
        return;
      }

      const {firstName, lastName, email, phone, age, motivation, timeline} = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email) {
        res.status(400).json({error: "First name, last name, and email are required"});
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || typeof email !== "string" || !emailRegex.test(email) || email.length > 254) {
        res.status(400).json({error: "Invalid email address"});
        return;
      }

      console.log("Start story submission received:", {firstName, lastName, email});

      // Save to Firestore
      const db = admin.firestore();
      const docRef = await db.collection("start-story-submissions").add({
        firstName,
        lastName,
        email,
        phone: phone || "",
        age: age || "",
        motivation: motivation || "",
        timeline: timeline || "",
        timestamp: new Date(),
        userAgent: req.headers["user-agent"] || "",
        ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress || "",
        status: "pending",
      });

      console.log("Start story document written with ID: ", docRef.id);

      res.status(200).json({
        success: true,
        message: "Thank you for starting your story journey! We'll contact you within 24 hours.",
        id: docRef.id,
      });
    } catch (error) {
      console.error("Error handling start story submission:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });
});
