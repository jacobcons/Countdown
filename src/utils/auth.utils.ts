import { google } from 'googleapis';
import { sql } from 'kysely';
import { db } from '../db/connection.js';

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL,
);

oauth2Client.on('tokens', async (tokens) => {
  // oauth2client auto fetches access_token when it becomes invalid using refresh_token
  // update the access_token for the user that it belongs to
  const { access_token, refresh_token } = tokens;
  if (!refresh_token) {
    oauth2Client.setCredentials({
      access_token,
      refresh_token,
    });
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const { data } = await oauth2.userinfo.get();
    const googleId = data.id;
    await sql`
      UPDATE "user"
      SET access_token = ${access_token}
      WHERE google_id = ${googleId}
    `.execute(db);
  }
});
