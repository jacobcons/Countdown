import DB from './types/Database.js'; // this is the Database interface we defined earlier
import pg from 'pg';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import Redis from 'ioredis';

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DB_URL,
  }),
});
export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

export const redis = new Redis(`${process.env.REDIS_URL}/0`);
