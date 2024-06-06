/* db */
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import camelcaseKeys from 'camelcase-keys';
export async function dbQuery(sqlFragments, ...parameters) {
    const res = await sql(sqlFragments, ...parameters).execute(db);
    return camelcaseKeys(res.rows);
}
