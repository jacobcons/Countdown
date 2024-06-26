import { db } from '../db/connection.js';
import { sqlf } from '../utils/db.utils.js';
import { sql } from 'kysely';
export async function getContacts(req, res) {
    const userId = req.user.id;
    const contacts = await sqlf `
    SELECT * 
    FROM contact 
    WHERE user_id = ${userId}
  `.execute(db);
    res.json(contacts);
}
export async function createContact(req, res) {
    const userId = req.user.id;
    const { email } = req.body;
    const [contact] = await sqlf `
    INSERT INTO contact(user_id, email) 
    VALUES (${userId}, ${email}) 
    RETURNING *
  `.execute(db);
    res.status(201).json(contact);
}
export async function updateContact(req, res) {
    const contactId = req.params.id;
    const userId = req.user.id;
    const { email } = req.body;
    const [contact] = await sqlf `
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
export async function deleteContact(req, res) {
    const contactId = req.params.id;
    const userId = req.user.id;
    const { numAffectedRows } = await sql `
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
