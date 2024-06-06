import { sql } from 'kysely';
import { db } from '../db/connection.js';
import camelcaseKeys from 'camelcase-keys';
// sql format => run sql => return rows with keys mapped to CamelCase
export function sqlf(sqlFragments, ...parameters) {
    return {
        async execute(conn) {
            const res = await sql(sqlFragments, ...parameters).execute(conn);
            return camelcaseKeys(res.rows);
        },
    };
}
export async function insertDefaultMessages(userId, conn = db) {
    return sqlf `
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
