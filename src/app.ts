import express from 'express';
import { router as authRouter } from './routers/auth.router.js';
import morgan from 'morgan';

const app = express();

app.use(morgan('tiny'));
app.use(express.json());

app.use('/auth', authRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
