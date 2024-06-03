import { sql } from 'kysely';
import { db } from './db/connection.js';
import camelcaseKeys from 'camelcase-keys';

/* db */
export async function dbQuery<T>(
  sqlFragments: TemplateStringsArray,
  ...parameters: any[]
): Promise<T[]> {
  const res = await sql<any>(sqlFragments, ...parameters).execute(db);
  return camelcaseKeys(res.rows) as T[];
}

/* errors */
export class CustomError extends Error {
  public statusCode: number;
  public response: any;

  constructor(message: string, statusCode: number, response: any) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
  }
}

export function createError(message: string, statusCode: number): CustomError {
  return new CustomError(message, statusCode, { message });
}
