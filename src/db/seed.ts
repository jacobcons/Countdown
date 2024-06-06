import { db, redis } from './connection.js';
import { sql } from 'kysely';

// clear db
await sql`TRUNCATE TABLE message RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE contact RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE task RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`.execute(db);

// insert users
await sql`
  INSERT INTO "user"(google_id, email, access_token, refresh_token) 
  VALUES ('115363395831265500963', 'jacobcons@gmail.com', '', 'd')
`.execute(db);

process.exit(0);
