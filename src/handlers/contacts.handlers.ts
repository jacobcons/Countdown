import { Request, Response } from 'express';
import { db, redis } from '../db/connection.js';
import { dbQuery } from '../utils/db.utils.js';
import {
  TypedRequest,
  TypedRequestBody,
  TypedRequestParams,
} from 'zod-express-middleware';
import { contactSchema } from '../schemas/contacts.schemas.js';
import { Contact } from '../db/types/public/Contact.js';
import { idSchema } from '../schemas/ids.schemas.js';
import { sql } from 'kysely';
import { createError } from '../utils/errors.utils.js';
import { ParamsDictionary } from 'express-serve-static-core';
import { z } from 'zod';

export function getContacts(req: Request, res: Response) {}

export async function createContact(
  req: TypedRequestBody<typeof contactSchema>,
  res: Response,
) {
  const { id } = req.user;
  const { email } = req.body;
  const [contact] =
    await dbQuery<Contact>`INSERT INTO contact(user_id, email) VALUES (${id}, ${email}) RETURNING *`;
  res.status(201).json(contact);
}

export function updateContact(
  req: Request<
    z.infer<typeof idSchema>,
    any,
    z.infer<typeof contactSchema>,
    any
  >,
  res: Response,
) {
  const contactId = req.params.id;
  const userId = req.user.id;
  const { email } = req.body;
}

export async function deleteContact(
  req: TypedRequestParams<typeof idSchema>,
  res: Response,
) {
  const contactId = req.params.id;
  const userId = req.user.id;
  const { numAffectedRows } =
    await sql`DELETE FROM contact WHERE id = ${contactId} AND user_id = ${userId}`.execute(
      db,
    );
  if (!numAffectedRows) {
    throw createError(
      `contact<${contactId}> belonging to user<${userId}> not found`,
      404,
    );
  }
  res.status(204).end();
}