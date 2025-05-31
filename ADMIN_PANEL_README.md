# Vitae Admin Panel

## Overview
The Vitae Admin Panel provides a simple interface for managing customer stories and collecting answers to guided questions.

## Access
- URL: `/admin` (or `http://localhost:5000/admin` for local development)
- Default Username: `admin`
- Default Password: `vitae2024`

## Features

### 1. Authentication
- Simple username/password authentication
- Session persists using localStorage
- Logout button to end session

### 2. Create New Customer Story
- Click "Start New Story" button
- Enter customer name and email
- System creates a new story with placeholder questions

### 3. Manage Questions & Answers
- After creating a story, you'll see a list of questions
- Enter customer answers in the text areas
- Add custom questions using the "Add Question" button
- Save all answers with "Save All Answers" button

### 4. View Stories
- Click "View All Stories" to see all customer stories
- Shows customer name, email, and creation date
- Click "View Details" to see full story (coming soon)

## Placeholder Questions
The system starts with these default questions:
1. What is your earliest childhood memory?
2. Who was the most influential person in your life?
3. What was your greatest achievement?
4. What advice would you give to your younger self?
5. What tradition or value do you hope to pass on to future generations?

## Firebase Integration
- Stories are stored in the `customer-stories` collection
- Each story contains:
  - Customer name and email
  - Array of questions with answers
  - Creation and update timestamps
  - Status (in-progress or completed)

## Local Development
1. Start Firebase emulators:
   ```bash
   firebase emulators:start --only functions,firestore
   ```

2. Access the admin panel at:
   ```
   http://localhost:5000/admin
   ```

## Production Deployment
1. Upgrade Firebase project to Blaze plan (required for Cloud Functions)
2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```
3. Deploy hosting:
   ```bash
   firebase deploy --only hosting
   ```

## Security Notes
- Current implementation uses simple hardcoded credentials
- For production, implement proper authentication (Firebase Auth)
- Update Firestore rules to restrict access
- Use environment variables for sensitive data

## Future Enhancements
- Firebase Authentication integration
- Rich text editor for answers
- Export stories to PDF
- Email notifications
- Question templates/categories
- Search and filter functionality 