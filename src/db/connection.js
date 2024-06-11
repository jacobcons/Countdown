import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import Redis from 'ioredis';
const dialect = new PostgresDialect({
    pool: new pg.Pool({
        connectionString: process.env.DB_URL,
    }),
});
export const db = new Kysely({
    dialect,
});
export const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    db: 0,
});
