import express from 'express';
import {
  googleGenerateAuthUrl,
  googleCallback,
  logout,
} from '../handlers/auth.handlers.js';

export const router = express.Router();
router.get('/google-generate-auth-url', googleGenerateAuthUrl);
router.get('/google-callback', googleCallback);
router.post('/logout', logout);
