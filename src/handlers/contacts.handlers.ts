import { Request, Response } from 'express';
import { db } from '../db/connection.js';
import { sqlf } from '../utils/db.utils.js';
import { TypedRequestBody, TypedRequestParams } from 'zod-express-middleware';
import { contactSchema } from '../schemas/contacts.schemas.js';
import { Contact } from '../db/types/public/Contact.js';
import { idSchema } from '../schemas/ids.schemas.js';
import { sql } from 'kysely';
import { z } from 'zod';

export async function getContacts(req: Request, res: Response) {
  const userId = req.user.id;

  const contacts = await sqlf<Contact>`
    SELECT * 
    FROM contact 
    WHERE user_id = ${userId}
  `.execute(db);

  res.json(contacts);
}

export async function createContact(
  req: TypedRequestBody<typeof contactSchema>,
  res: Response,
) {
  const userId = req.user.id;
  const { email } = req.body;

  const [contact] = await sqlf<Contact>`
    INSERT INTO contact(user_id, email) 
    VALUES (${userId}, ${email}) 
    RETURNING *
  `.execute(db);

  res.status(201).json(contact);
}

export async function updateContact(
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

  const [contact] = await sqlf<Contact>`
    UPDATE contact 
    SET email = ${email} 
    WHERE id = ${contactId} AND user_id = ${userId}
    RETURNING *
  `.execute(db);

  if (!contact) {
    return res.status(404).json({
      message: `contact<${contactId}> belonging to user<${userId}> not found`,
    });
  }

  res.json(contact);
}

export async function deleteContact(
  req: TypedRequestParams<typeof idSchema>,
  res: Response,
) {
  const contactId = req.params.id;
  const userId = req.user.id;

  const { numAffectedRows } = await sql`
    DELETE FROM contact 
    WHERE id = ${contactId} AND user_id = ${userId}
  `.execute(db);

  if (!numAffectedRows) {
    return res.status(404).json({
      message: `contact<${contactId}> belonging to user<${userId}> not found`,
    });
  }

  res.status(204).end();
}
