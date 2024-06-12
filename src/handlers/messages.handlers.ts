import { Request, Response } from 'express';
import { db } from '../db/connection.js';
import { insertDefaultMessages, sqlf } from '../utils/db.utils.js';
import { TypedRequestBody, TypedRequestParams } from 'zod-express-middleware';
import { messageSchema } from '../schemas/messages.schemas.js';
import { Message } from '../db/types/public/Message.js';
import { idSchema } from '../schemas/ids.schemas.js';
import { sql } from 'kysely';
import { createError } from '../utils/errors.utils.js';
import { z } from 'zod';

export async function getMessages(req: Request, res: Response) {
  const userId = req.user.id;

  const messages = await sqlf<Message>`
    SELECT * 
    FROM message 
    WHERE user_id = ${userId}
  `.execute(db);

  res.json(messages);
}

export async function createMessage(
  req: TypedRequestBody<typeof messageSchema>,
  res: Response,
) {
  const userId = req.user.id;
  const { content } = req.body;

  const [message] = await sqlf<Message>`
    INSERT INTO message(user_id, content)
    VALUES (${userId}, ${content})
    RETURNING *
`.execute(db);

  res.status(201).json(message);
}

export async function updateMessage(
  req: Request<
    z.infer<typeof idSchema>,
    any,
    z.infer<typeof messageSchema>,
    any
  >,
  res: Response,
) {
  const messageId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  const [message] = await sqlf<Message>`
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

export async function deleteMessage(
  req: TypedRequestParams<typeof idSchema>,
  res: Response,
) {
  const messageId = req.params.id;
  const userId = req.user.id;

  const { numAffectedRows } = await sql`
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

export async function restoreDefaultMessages(req: Request, res: Response) {
  const userId = req.user.id;

  const messages = await db.transaction().execute(async (trx) => {
    await sql`
      DELETE FROM message 
      WHERE user_id = ${userId}
    `.execute(trx);
    return insertDefaultMessages(userId, trx);
  });

  res.status(201).json(messages);
}
