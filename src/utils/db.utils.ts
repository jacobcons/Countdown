/* db */
import { sql } from 'kysely';
import { db } from '../db/connection.js';
import camelcaseKeys from 'camelcase-keys';

export async function dbQuery<T>(
  sqlFragments: TemplateStringsArray,
  ...parameters: unknown[]
): Promise<T[]> {
  const res = await sql<Record<string, unknown>>(
    sqlFragments,
    ...parameters,
  ).execute(db);
  return camelcaseKeys(res.rows) as T[];
}
