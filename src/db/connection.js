import pg from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
const dialect = new PostgresDialect({
    pool: new pg.Pool({
        connectionString: process.env.DB_URL,
    }),
});
// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely({
    dialect,
});
