// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();
const PORT = 3000;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  CALLBACK_URL,
);

// Middleware to handle sessions
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:3001', // React frontend URL
    credentials: true,
  }),
);

// Route to start OAuth flow
app.get('/auth/google/generate-auth-url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/gmail.send', // Add this scope to send email
    ],
  });
  res.json({ url });
});

// OAuth callback route
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();

    req.session.user = {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture,
    };

    res.redirect('http://localhost:3001/profile');
  } catch (error) {
    console.error('Error during authentication', error);
    res.redirect('/');
  }
});

// API endpoint to get user profile
app.get('/api/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(req.session.user);
});

// Route to handle logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
