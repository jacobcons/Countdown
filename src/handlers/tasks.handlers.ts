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
import { Task, TaskId } from '../db/types/public/Task.js';
import Redis from 'ioredis';
import { Job, Queue, Worker } from 'bullmq';
import { User } from '../db/types/public/User.js';
import { Contact } from '../db/types/public/Contact.js';
import { Message } from '../db/types/public/Message.js';
import { oauth2Client } from '../utils/auth.utils.js';
import { google } from 'googleapis';
import { sql } from 'kysely';
import Status from '../db/types/public/Status.js';

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  db: 1,
  maxRetriesPerRequest: null,
});

const emailQueue = new Queue('Email', { connection });

function extractTaskIdFromJob(job: Job) {
  return job.id!.split('-')[1];
}

class CustomError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// send email from user to random contact with a random message when task reaches finish timestamp
const emailWorker = new Worker(
  'Email',
  async (job) => {
    // extract the task and user id from the job
    const taskId = extractTaskIdFromJob(job);
    const userId = job.name;
    console.log(`job: ${userId} ${taskId}`);

    // set status of task to failed immediately
    await sql`
      UPDATE task
      SET status = 'failed'
      WHERE id = ${taskId}
    `.execute(db);

    // collect data about user, random contact and random message
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

    const [[user], [contact], [message]] = await Promise.all([
      userQuery,
      contactQuery,
      messageQuery,
    ]);

    // if no contacts or messages are set => display custom error with task to user
    if (!contact || !message) {
      throw new CustomError('Please ensure you have contacts and messages set');
    }

    // use that data to send email
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });
    const gmail = google.gmail({
      auth: oauth2Client,
      version: 'v1',
    });
    const body = [
      `From: ${user.name} <${user.email}>`,
      `To: <${contact.email}>`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      'Subject: ',
      '',
      message.content,
    ].join('\n');
    // The body needs to be base64url encoded.
    const encodedBody = Buffer.from(body)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    try {
      // send email out
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedBody,
        },
      });

      // set recipient email and message that was sent out for the task
      await sql`
        UPDATE task
        SET failed_recipient_email = ${contact.email}, failed_message = ${message.content}
        WHERE id = ${taskId}
      `.execute(db);
    } catch (err: any) {
      // if refresh token is invalid => display custom error with task to user
      if (err.response.data.error === 'invalid_grant') {
        throw new CustomError(
          'Please logout and log back in again to refresh your credentials',
        );
      }
      throw err;
    }
  },
  { connection },
);

// fails to send email => set status of task to error along with error message so user can see what went wrong
emailWorker.on('failed', async (job, err) => {
  const taskId = extractTaskIdFromJob(job!);
  if (!(err instanceof CustomError)) {
    console.error(err);
    err.message = 'Internal server error';
  }

  const errorMessage = `Failed to send email. ${err.message}`;
  await sql`
    UPDATE task
    SET status = 'error', error_message = ${errorMessage}
    WHERE id = ${taskId}
  `.execute(db);
});

export async function getTasks(req: Request, res: Response) {
  const userId = req.user.id;

  const tasks = await sqlf<Task>`
    SELECT *
    FROM task
    WHERE user_id = ${userId}
  `.execute(db);

  res.json(tasks);
}

function calculateMsUntilDate(date: string): number {
  return Number(new Date(date)) - Number(new Date());
}

export async function createTask(
  req: TypedRequestBody<typeof createTaskSchema>,
  res: Response,
) {
  const userId = req.user.id;
  const { title, description, finishTimestamp } = req.body;

  const task = await db.transaction().execute(async (trx) => {
    // insert task
    const [task] = await sqlf<Task>`
      INSERT INTO task(user_id, title, description, finish_timestamp, status)
      VALUES (${userId}, ${title}, ${description}, ${finishTimestamp}, 'ongoing')
      RETURNING id, user_id, created_at, title, description, finish_timestamp
    `.execute(trx);

    // schedule job to send out email when finish time is reached for task
    await emailQueue.add(userId.toString(), undefined, {
      jobId: `id-${task.id}`,
      delay: calculateMsUntilDate(finishTimestamp),
    });
    return task;
  });

  res.status(201).json(task);
}

function getEmailJob(taskId: number) {
  return emailQueue.getJob(`id-${taskId}`);
}

export async function updateTask(
  req: Request<
    z.infer<typeof idSchema>,
    any,
    z.infer<typeof updateTaskSchema>,
    any
  >,
  res: Response,
) {
  const taskId = req.params.id;
  const userId = req.user.id;
  const { title, description, finishTimestamp, completed } = req.body;

  // update task with new details only if the task is ongoing
  let query = db
    .updateTable('task')
    .set({ title, description, finishTimestamp })
    .where('id', '=', taskId)
    .where('userId', '=', userId)
    .where('status', '=', Status.ongoing)
    .returningAll();

  // if completed => update status and time task was completed
  if (completed) {
    query = query.set({
      status: Status.completed,
      completedTimestamp: new Date(),
    });
  }

  const task = await query.executeTakeFirst();

  if (!task) {
    return res.status(404).json({
      message: `task<${taskId}> belonging to user<${userId}> with ongoing status not found`,
    });
  }

  // if task was updated =>
  // if finish timestamp => delay job so its sends email at the new timestamp
  if (finishTimestamp) {
    const job = await getEmailJob(taskId);
    await job?.changeDelay(calculateMsUntilDate(finishTimestamp));
  }

  // if completed => remove job so it doesn't send off email
  if (completed) {
    const job = await getEmailJob(taskId);
    await job?.remove();
  }

  return res.json(task);
}

export async function deleteTask(
  req: TypedRequestParams<typeof idSchema>,
  res: Response,
) {
  const taskId = req.params.id;
  const userId = req.user.id;

  const { numAffectedRows } = await sql`
    DELETE FROM task 
    WHERE id = ${taskId} AND user_id = ${userId} AND status = ${Status.ongoing}
  `.execute(db);

  if (!numAffectedRows) {
    return res.status(404).json({
      message: `task<${taskId}> belonging to user<${userId}> with ongoing status not found`,
    });
  }

  // if the task was deleted => remove job so it doesn't send off email
  const job = await getEmailJob(taskId);
  await job?.remove();

  return res.status(204).end();
}
