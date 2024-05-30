import express from 'express';
import { sql, InferResult } from 'kysely';
import { db } from './db/connection.js';
import { User } from './db/types.js';

const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
  const xs = await sql<InferResult>`SELECT id FROM "user"`.execute(db);
  const user = xs.rows[0];
  res.json(user);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
