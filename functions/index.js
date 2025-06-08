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

// ESLint formatting fix

// Admin Panel Functions

/**
 * Helper function to verify admin access
 * @param {Object} req - The request object
 * @return {Object} Object with either error or user details
 */
async function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {error: "No authorization token provided"};
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user has admin claim
    if (!decodedToken.admin) {
      return {error: "User is not authorized as admin"};
    }

    return {uid: decodedToken.uid, email: decodedToken.email};
  } catch (error) {
    console.error("Error verifying token:", error);
    return {error: "Invalid authorization token"};
  }
}

exports.createCustomerStory = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    // Verify admin access
    const authResult = await verifyAdminToken(req);
    if (authResult.error) {
      res.status(401).json({error: authResult.error});
      return;
    }

    try {
      // Check for malformed JSON or missing body
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({error: "Invalid request body"});
        return;
      }

      const {name, email, questions} = req.body;

      // Validate required fields
      if (!name || !email) {
        res.status(400).json({error: "Name and email are required"});
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({error: "Invalid email address"});
        return;
      }

      console.log("Creating customer story for:", {name, email});

      // Save to Firestore
      const db = admin.firestore();
      const storyData = {
        name,
        email,
        questions: questions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: authResult.email,
        createdByUid: authResult.uid,
        status: "in-progress",
      };

      const docRef = await db.collection("customer-stories").add(storyData);

      console.log("Customer story created with ID:", docRef.id);

      res.status(200).json({
        success: true,
        message: "Customer story created successfully",
        storyId: docRef.id,
      });
    } catch (error) {
      console.error("Error creating customer story:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });
});

exports.updateStoryAnswers = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    // Verify admin access
    const authResult = await verifyAdminToken(req);
    if (authResult.error) {
      res.status(401).json({error: authResult.error});
      return;
    }

    try {
      // Check for malformed JSON or missing body
      if (!req.body || typeof req.body !== "object") {
        res.status(400).json({error: "Invalid request body"});
        return;
      }

      const {storyId, answers} = req.body;

      // Validate required fields
      if (!storyId || !answers) {
        res.status(400).json({error: "Story ID and answers are required"});
        return;
      }

      console.log("Updating story answers for:", storyId);

      // Update Firestore document
      const db = admin.firestore();
      const storyRef = db.collection("customer-stories").doc(storyId);

      // Check if story exists
      const storyDoc = await storyRef.get();
      if (!storyDoc.exists) {
        res.status(404).json({error: "Story not found"});
        return;
      }

      // Update the story with answers
      await storyRef.update({
        questions: answers,
        updatedAt: new Date().toISOString(),
        updatedBy: authResult.email,
        updatedByUid: authResult.uid,
        status: "completed",
      });

      console.log("Story answers updated successfully");

      res.status(200).json({
        success: true,
        message: "Story answers updated successfully",
      });
    } catch (error) {
      console.error("Error updating story answers:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });
});

exports.getCustomerStories = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    // Verify admin access
    const authResult = await verifyAdminToken(req);
    if (authResult.error) {
      res.status(401).json({error: authResult.error});
      return;
    }

    try {
      console.log("Fetching customer stories");

      // Get all stories from Firestore
      const db = admin.firestore();
      const storiesSnapshot = await db.collection("customer-stories")
        .orderBy("createdAt", "desc")
        .limit(50) // Limit to 50 most recent stories
        .get();

      const stories = [];
      storiesSnapshot.forEach((doc) => {
        stories.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`Found ${stories.length} customer stories`);

      res.status(200).json({
        success: true,
        stories: stories,
      });
    } catch (error) {
      console.error("Error fetching customer stories:", error);
      res.status(500).json({error: "Internal Server Error"});
    }
  });
});

// Function to set admin claims on a user (call this separately to grant admin access)
exports.setAdminClaim = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({error: "Method Not Allowed"});
      return;
    }

    // This function should be protected - for now it checks for a secret key
    const {email, secretKey} = req.body;

    // Get admin secret from environment config
    const functions = require("firebase-functions");
    const config = functions.config();
    const ADMIN_SECRET = (config.admin && config.admin.secret) ||
      process.env.ADMIN_SECRET || "vitae-admin-secret-2024";

    if (secretKey !== ADMIN_SECRET) {
      res.status(401).json({error: "Invalid secret key"});
      return;
    }

    try {
      // Get user by email
      const user = await admin.auth().getUserByEmail(email);

      // Set custom user claims
      await admin.auth().setCustomUserClaims(user.uid, {
        admin: true,
      });

      console.log(`Admin claim set for user: ${email}`);

      res.status(200).json({
        success: true,
        message: `Admin access granted to ${email}`,
        uid: user.uid,
      });
    } catch (error) {
      console.error("Error setting admin claim:", error);
      res.status(500).json({error: error.message});
    }
  });
});
