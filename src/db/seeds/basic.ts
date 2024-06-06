import { db } from '../connection.js';
import { sql } from 'kysely';

await sql`TRUNCATE TABLE contact RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE task RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`.execute(db);

await sql`INSERT INTO "user"(google_id, email, access_token, refresh_token) VALUES ('a', 'b', 'c', 'd')`.execute(
  db,
);

process.exit(0);
