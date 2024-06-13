import { google } from 'googleapis';
import { Request, Response } from 'express';
import { User } from '../db/types/public/User.js';
import crypto from 'crypto';
import { db, redis } from '../db/connection.js';
import { insertDefaultMessages, sqlf } from '../utils/db.utils.js';
import { sql } from 'kysely';
import { oauth2Client } from '../utils/auth.utils.js';

export function googleGenerateAuthUrl(req: Request, res: Response) {
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

export async function googleCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  if (!code) {
    throw Error();
  }

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

  type UserInfo = {
    id: string;
    email: string;
    name: string;
  };
  const { id, email, name } = data as UserInfo;

  // error if account isn't gmail/googlemail account
  if (!email.endsWith('gmail.com') && !email.endsWith('googlemail.com')) {
    return res
      .status(400)
      .json({ message: 'Only Gmail and Googlemail accounts are supported' });
  }

  // insert user into db
  let user;
  try {
    // first time logging in => insert user into db => insert default messages
    [user] = await sqlf<Pick<User, 'id'>>`
    INSERT INTO "user"(google_id, email, name, access_token, refresh_token) 
    VALUES (${id}, ${email}, ${name}, ${access_token}, ${refresh_token})
    RETURNING id
  `.execute(db);

    await insertDefaultMessages(user.id, db);
  } catch (err: any) {
    // if they already have an account => update their email, access and refresh token
    const UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE = '23505';
    if (err.code === UNIQUE_CONSTRAINT_VIOLATION_ERROR_CODE) {
      [user] = await sqlf<Pick<User, 'id'>>`
        UPDATE "user"
        SET email = ${email}, name = ${name}, access_token = ${access_token}, refresh_token = ${refresh_token}
        WHERE google_id = ${id}
        RETURNING id
      `.execute(db);
    } else {
      throw err;
    }
  }

  // generate session token associated with user id, store in redis and respond as json
  const token = crypto.randomBytes(16).toString('base64');
  const EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 7; // 1 week
  await redis.set(
    `sessionToken:${token}`,
    user.id,
    'EX',
    EXPIRATION_TIME_IN_SECONDS,
  );
  res.json({ token });
}

export async function logout(req: Request, res: Response) {
  const { sessionToken } = req.user;
  await redis.del(`sessionToken:${sessionToken}`);
  res.json({ message: 'logout successful, session token deleted' });
}
