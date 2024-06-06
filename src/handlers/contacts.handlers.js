import { db } from '../db/connection.js';
import { dbQuery } from '../utils/db.utils.js';
import { sql } from 'kysely';
import { createError } from '../utils/errors.utils.js';
export function getContacts(req, res) { }
export async function createContact(req, res) {
    const { id } = req.user;
    const { email } = req.body;
    const [contact] = await dbQuery `INSERT INTO contact(user_id, email) VALUES (${id}, ${email}) RETURNING *`;
    res.status(201).json(contact);
}
export function updateContact(req, res) {
    const contactId = req.params.id;
    const userId = req.user.id;
    const { email } = req.body;
}
export async function deleteContact(req, res) {
    const contactId = req.params.id;
    const userId = req.user.id;
    const { numAffectedRows } = await sql `DELETE FROM contact WHERE id = ${contactId} AND user_id = ${userId}`.execute(db);
    if (!numAffectedRows) {
        throw createError(`contact<${contactId}> belonging to user<${userId}> not found`, 404);
    }
    res.status(204).end();
}
