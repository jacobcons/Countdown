import { google } from 'googleapis';
import { dbQuery } from '../utils.js';
import crypto from 'crypto';
import { redis } from '../db/connection.js';
const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
export async function googleGenerateAuthUrl(req, res) {
    res.json({
        url: oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/gmail.send',
            ],
        }),
    });
}
export async function googleCallback(req, res) {
    const code = req.query.code;
    // grab access and refresh token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const { access_token, refresh_token } = tokens;
    // grab user's id and email
    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2',
    });
    const { data } = await oauth2.userinfo.get();
    const { id, email } = data;
    // insert user into db, if they already exist update their record
    const [user] = await dbQuery `
  INSERT INTO "user"(google_id, email, access_token, refresh_token) 
  VALUES (${id}, ${email}, ${access_token}, ${refresh_token})
  ON CONFLICT (google_id)
  DO UPDATE SET
    email = EXCLUDED.email,
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token
  RETURNING id;
  `;
    // generate session token associated with user id, store in redis and respond as json
    const token = crypto.randomBytes(16).toString('base64');
    const EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 7; // 1 week
    await redis.set(`sessionToken:${token}`, user.id, 'EX', EXPIRATION_TIME_IN_SECONDS);
    return res.json({ token });
}
export async function logout(req, res) { }
