import express from 'express';
import { sql } from 'kysely';
import { db } from './db/connection.js';
const app = express();
app.use(express.json());
app.get('/', async (req, res) => {
    const xs = await sql `SELECT * FROM "user"`.execute(db);
    res.json(xs);
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
