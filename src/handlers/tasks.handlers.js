import { db } from '../db/connection.js';
import { sqlf } from '../utils/db.utils.js';
import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { oauth2Client } from '../utils/auth.utils.js';
import { google } from 'googleapis';
import { sql } from 'kysely';
const connection = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    db: 1,
    maxRetriesPerRequest: null,
});
const emailQueue = new Queue('Email', { connection });
function extractTaskIdFromJob(job) {
    return job.id.split('-')[1];
}
class CustomError extends Error {
    constructor(message) {
        super(message);
    }
}
// send email from user to random contact with a random message when task reaches finish timestamp
const emailWorker = new Worker('Email', async (job) => {
    const taskId = extractTaskIdFromJob(job);
    const userId = job.name;
    console.log(`job: ${userId} ${taskId}`);
    // collect data about user, random contact and random message
    const userQuery = sqlf `
      SELECT email, name, access_token, refresh_token
      FROM "user"
      WHERE id = ${userId}
      LIMIT 1
    `.execute(db);
    const contactQuery = sqlf `
      SELECT email
      FROM contact
      WHERE user_id = ${userId}
      ORDER BY RANDOM()
      LIMIT 1
    `.execute(db);
    const messageQuery = sqlf `
      SELECT content
      FROM message
      WHERE user_id = ${userId}
      ORDER BY RANDOM()
      LIMIT 1
    `.execute(db);
    const [[{ email: userEmail, name, accessToken, refreshToken }], [{ email: contactEmail }], [{ content }],] = await Promise.all([userQuery, contactQuery, messageQuery]);
    if (!contactEmail || !content) {
        throw new CustomError('Please ensure you have contacts and messages set');
    }
    // set status of task to failed along with email and message that is going to be sent out
    await sql `
      UPDATE task
      SET status = 'failed', failed_recipient_email = ${contactEmail}, failed_message = ${content}
      WHERE id = ${taskId}
    `.execute(db);
    // use that data to send email
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
    try {
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedBody,
            },
        });
    }
    catch (err) {
        if (err.response.data.error === 'invalid_grant') {
            throw new CustomError('Please logout and log back in again to refresh your credentials');
        }
        throw err;
    }
}, { connection });
// fails to send email => set status of task to error along with error message so user can see what went wrong
emailWorker.on('failed', async (job, err) => {
    const taskId = extractTaskIdFromJob(job);
    if (!(err instanceof CustomError)) {
        console.error(err);
        err.message = 'Internal server error';
    }
    const errorMessage = `Failed to send email. ${err.message}`;
    await sql `
    UPDATE task
    SET status = 'error', error_message = ${errorMessage}
    WHERE id = ${taskId}
  `.execute(db);
});
export function getTasks(req, res) {
    const userId = req.user.id;
}
export async function createTask(req, res) {
    const userId = req.user.id;
    const { title, description, finishTimestamp } = req.body;
    const task = await db.transaction().execute(async (trx) => {
        // insert task
        const [task] = await sqlf `
      INSERT INTO task(user_id, title, description, finish_timestamp, status)
      VALUES (${userId}, ${title}, ${description}, ${finishTimestamp}, 'ongoing')
      RETURNING id, user_id, created_at, title, description, finish_timestamp
    `.execute(trx);
        // schedule job to send out email when finish time is reached for task
        const msTillFinishTime = Number(new Date(finishTimestamp)) - Number(new Date());
        await emailQueue.add(userId.toString(), undefined, {
            jobId: `id-${task.id}`,
            delay: msTillFinishTime,
        });
        return task;
    });
    res.json(task);
}
export function updateTask(req, res) { }
export function deleteTask(req, res) { }
