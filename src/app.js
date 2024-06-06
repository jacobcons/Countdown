import express from 'express';
import 'express-async-errors';
import authRouter from './routers/auth.router.js';
import tasksRouter from './routers/tasks.router.js';
import contactsRouter from './routers/contacts.router.js';
import messagesRouter from './routers/messages.router.js';
import morgan from 'morgan';
import { errorHandler, notFound } from './middlewares/errors.middlewares.js';
import { verifySessionToken } from './middlewares/auth.middlewares.js';
const app = express();
app.use(morgan('tiny'));
app.use(express.json());
app.use('/auth', authRouter);
// protected routes
app.use(verifySessionToken);
app.use('/tasks', tasksRouter);
app.use('/contacts', contactsRouter);
app.use('/messages', messagesRouter);
app.use(notFound, errorHandler);
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app listening on port ${port}`);
});
