import { Request, RequestParamHandler, Response } from 'express';
import { db, redis } from '../db/connection.js';
import { sqlf } from '../utils/db.utils.js';
import { idSchema } from '../schemas/ids.schemas.js';
import { TypedRequestBody, TypedRequestParams } from 'zod-express-middleware';
import {
  createTaskSchema,
  updateTaskSchema,
} from '../schemas/tasks.schemas.js';
import { z } from 'zod';
import { Task } from '../db/types/public/Task.js';
import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { User } from '../db/types/public/User.js';
import { Contact } from '../db/types/public/Contact.js';
import { Message } from '../db/types/public/Message.js';
import { oauth2Client } from '../utils/auth.utils.js';
import { google } from 'googleapis';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  db: 1,
  maxRetriesPerRequest: null,
});
const emailQueue = new Queue('Email', { connection });
const emailWorker = new Worker(
  'Email',
  async (job) => {
    const taskId = job.id!.split('-')[1];
    const userId = job.name;
    console.log(`job: ${userId} ${taskId}`);

    const userQuery = sqlf<
      Pick<User, 'email' | 'name' | 'accessToken' | 'refreshToken'>
    >`
      SELECT email, name, access_token, refresh_token
      FROM "user"
      WHERE id = ${userId}
      LIMIT 1
    `.execute(db);

    const contactQuery = sqlf<Pick<Contact, 'email'>>`
      SELECT email
      FROM contact
      WHERE user_id = ${userId}
      ORDER BY RANDOM()
      LIMIT 1
    `.execute(db);

    const messageQuery = sqlf<Pick<Message, 'content'>>`
      SELECT content
      FROM message
      WHERE user_id = ${userId}
      ORDER BY RANDOM()
      LIMIT 1
    `.execute(db);

    const [
      [{ email: userEmail, name, accessToken, refreshToken }],
      [{ email: contactEmail }],
      [{ content }],
    ] = await Promise.all([userQuery, contactQuery, messageQuery]);

    try {
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      const gmail = google.gmail({
        auth: oauth2Client,
        version: 'v1',
      });
      const body = [
        `From: ${name} <${userEmail}>`,
        `To: <${contactEmail}>`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        'Subject: ',
        '',
        content,
      ].join('\n');
      // The body needs to be base64url encoded.
      const encodedBody = Buffer.from(body)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const res = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedBody,
        },
      });
    } catch (e) {
      console.log(e);
    }
  },
  { connection },
);

export function getTasks(req: Request, res: Response) {
  const userId = req.user.id;
}

export async function createTask(
  req: TypedRequestBody<typeof createTaskSchema>,
  res: Response,
) {
  const userId = req.user.id;
  const { title, description, finishTimestamp } = req.body;

  const [task] = await sqlf<Task>`
    INSERT INTO task(user_id, title, description, finish_timestamp)
    VALUES (${userId}, ${title}, ${description}, ${finishTimestamp})
    RETURNING id, user_id, created_at, title, description, finish_timestamp
  `.execute(db);

  // schedule job to send out email when finish time is reached for task
  const msTillFinishTime =
    Number(new Date(finishTimestamp)) - Number(new Date());
  await emailQueue.add(userId.toString(), undefined, {
    jobId: `id-${task.id}`,
    delay: msTillFinishTime,
  });
  console.log(msTillFinishTime);

  res.json(task);
}

export function updateTask(
  req: Request<
    z.infer<typeof idSchema>,
    any,
    z.infer<typeof updateTaskSchema>,
    any
  >,
  res: Response,
) {}

export function deleteTask(
  req: TypedRequestParams<typeof idSchema>,
  res: Response,
) {}
