import express, { Request, Response } from 'express';
import 'express-async-errors';
import authRouter from './routers/auth.router.js';
import tasksRouter from './routers/tasks.router.js';
import contactsRouter from './routers/contacts.router.js';
import messagesRouter from './routers/messages.router.js';
import morgan from 'morgan';
import { errorHandler, notFound } from './middlewares/errors.middlewares.js';
import { verifySessionToken } from './middlewares/auth.middlewares.js';
import helmet from 'helmet';
import apiDocs from '../docs/apiDocs.json' with { type: 'json' };
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

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
