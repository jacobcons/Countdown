import { sql } from 'kysely';
import { db } from './db/connection.js';
import camelcaseKeys from 'camelcase-keys';
/* db */
export async function dbQuery(sqlFragments, ...parameters) {
    const res = await sql(sqlFragments, ...parameters).execute(db);
    return camelcaseKeys(res.rows);
}
/* errors */
export class CustomError extends Error {
    statusCode;
    response;
    constructor(message, statusCode, response) {
        super(message);
        this.statusCode = statusCode;
        this.response = response;
    }
}
export function createError(message, statusCode) {
    return new CustomError(message, statusCode, { message });
}
