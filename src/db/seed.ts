import { db, redis } from './connection.js';
import { sql } from 'kysely';
import { insertDefaultMessages } from '../utils/db.utils.js';

// clear db
await sql`TRUNCATE TABLE message RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE contact RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE task RESTART IDENTITY CASCADE`.execute(db);
await sql`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`.execute(db);
await redis.flushall();

// insert users
await sql`
  INSERT INTO "user"(google_id, email, name, access_token, refresh_token) 
  VALUES 
    ('115363395831265500963', 'jacobcons@gmail.com', 'Jacob', '1', ${process.env.REFRESH_TOKEN_USER_1}),
    ('107607028239165399930', 'yuri31450@gmail.com', 'Yuri Smith', '1', ${process.env.REFRESH_TOKEN_USER_2});
`.execute(db);

// insert contacts for each user
await sql`
  INSERT INTO contact(user_id, email)
  VALUES 
    (2, 'jacobcons@gmail.com'),
    (1, 'yuri31450@gmail.com');
`.execute(db);

// insert default messages for each user
await insertDefaultMessages(1, db);
await insertDefaultMessages(2, db);

// insert session tokens for each user
await redis.set('sessionToken:ukAuhLw3uxFtRKNSDFghew==', '1');
await redis.set('sessionToken:T0I1MaonQQPQ917mKozsRg==', '2');

process.exit(0);
