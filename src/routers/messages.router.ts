import express from 'express';
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
} from '../handlers/messages.handlers.js';
import { messageSchema } from '../schemas/messages.schemas.js';
import {
  validateRequestBody,
  validateRequestParams,
} from 'zod-express-middleware';
import { idSchema } from '../schemas/ids.schemas.js';

const router = express.Router();
router
  .route('/')
  .get(getMessages)
  .post(validateRequestBody(messageSchema), createMessage);
router
  .route('/:id')
  .all(validateRequestParams(idSchema))
  .patch(validateRequestBody(messageSchema), updateMessage)
  .delete(deleteMessage);

export default router;
