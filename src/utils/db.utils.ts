/* db */
import DB from '../db/types/Database.js';
import { Kysely, sql, Transaction } from 'kysely';
import { db } from '../db/connection.js';
import camelcaseKeys from 'camelcase-keys';
import { Message } from '../db/types/public/Message.js';

type Connection = Kysely<DB> | Transaction<DB>;

// sql format => run sql => return rows with keys mapped to CamelCase
export function sqlf<T>(
  sqlFragments: TemplateStringsArray,
  ...parameters: unknown[]
) {
  return {
    async execute(conn: Connection) {
      const res = await sql<Record<string, unknown>>(
        sqlFragments,
        ...parameters,
      ).execute(conn);
      return camelcaseKeys(res.rows) as T[];
    },
  };
}

export async function insertDefaultMessages(
  userId: number,
  conn: Connection = db,
) {
  return sqlf<Message>`
    INSERT INTO message(user_id, content)
    VALUES 
      (${userId},  'Hey there, I just wanted to say that I''ve always been in love with you'),
      (${userId},  'Hi, I really needed to get this off my chest. I''m a furry. I hope you''ll accept and love me for who I am'),
      (${userId},  'Hey, I clogged up my toilet again. Is it okay if I come and use yours?'),
      (${userId},  'I really need to borrow some money from you. I can pay you back in a few months'),
      (${userId},  'The police are after me. If they ask you anything just say I moved to Thailand'),
      (${userId}, 'I didn''t want to say anything when I last saw you but your armpits really smell bad')
    RETURNING *
  `.execute(conn);
}
