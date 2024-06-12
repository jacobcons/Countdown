import { db } from '../db/connection.js';
import { insertDefaultMessages, sqlf } from '../utils/db.utils.js';
import { sql } from 'kysely';
export async function getMessages(req, res) {
    const userId = req.user.id;
    const messages = await sqlf `
    SELECT * 
    FROM message 
    WHERE user_id = ${userId}
  `.execute(db);
    res.json(messages);
}
export async function createMessage(req, res) {
    const userId = req.user.id;
    const { content } = req.body;
    const [message] = await sqlf `
    INSERT INTO message(user_id, content)
    VALUES (${userId}, ${content})
    RETURNING *
`.execute(db);
    res.status(201).json(message);
}
export async function updateMessage(req, res) {
    const messageId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;
    const [message] = await sqlf `
    UPDATE message 
    SET content = ${content} 
    WHERE id = ${messageId} AND user_id = ${userId}
    RETURNING *
  `.execute(db);
    if (!message) {
        return res.status(404).json({
            message: `message<${messageId}> belonging to user<${userId}> not found`,
        });
    }
    res.json(message);
}
export async function deleteMessage(req, res) {
    const messageId = req.params.id;
    const userId = req.user.id;
    const { numAffectedRows } = await sql `
    DELETE FROM message 
    WHERE id = ${messageId} AND user_id = ${userId}
  `.execute(db);
    if (!numAffectedRows) {
        return res.status(404).json({
            message: `message<${messageId}> belonging to user<${userId}> not found`,
        });
    }
    res.status(204).end();
}
export async function restoreDefaultMessages(req, res) {
    const userId = req.user.id;
    const messages = await db.transaction().execute(async (trx) => {
        await sql `
      DELETE FROM message 
      WHERE user_id = ${userId}
    `.execute(trx);
        return insertDefaultMessages(userId, trx);
    });
    res.status(201).json(messages);
}
