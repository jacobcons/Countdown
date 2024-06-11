import { db, redis } from './connection.js';
import { sql } from 'kysely';
import { insertDefaultMessages } from '../utils/db.utils.js';
// clear db
await sql `TRUNCATE TABLE message RESTART IDENTITY CASCADE`.execute(db);
await sql `TRUNCATE TABLE contact RESTART IDENTITY CASCADE`.execute(db);
await sql `TRUNCATE TABLE task RESTART IDENTITY CASCADE`.execute(db);
await sql `TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`.execute(db);
await redis.flushall();
// insert users
await sql `
  INSERT INTO "user"(google_id, email, name, access_token, refresh_token) 
  VALUES 
    ('115363395831265500963', 'jacobcons@gmail.com', 'Jacob', '1', '1//03SJA1gUk3hv6CgYIARAAGAMSNwF-L9Ir9Z9looe6X3ruxKp9mOdz29rvQy4U9zRM1MEFiIuzQPp2yLhJTD-Xb_qm1guv6N-NlMA'),
    ('107607028239165399930', 'yuri31450@gmail.com', 'Yuri Smith', '1', '1//03ARUhwSdDhOGCgYIARAAGAMSNwF-L9IrlhYCNrHvakyyvULK3c5E73MHdB7_ev_A_Q4YF9ZpGr7kcIcvgwUGa45ppZWa-9dSLKs');
`.execute(db);
await sql `
  INSERT INTO contact(user_id, email)
  VALUES 
    (2, 'jacobcons@gmail.com'),
    (1, 'yuri31450@gmail.com');
`.execute(db);
await insertDefaultMessages(1, db);
await insertDefaultMessages(2, db);
await redis.set('sessionToken:ukAuhLw3uxFtRKNSDFghew==', '1');
await redis.set('sessionToken:T0I1MaonQQPQ917mKozsRg==', '2');
process.exit(0);
