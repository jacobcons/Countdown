import express from 'express';
import {
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  restoreDefaultMessages,
} from '../handlers/messages.handlers.js';
import { messageSchema } from '../schemas/messages.schemas.js';
import {
  processRequest,
  processRequestBody,
  processRequestParams,
} from 'zod-express-middleware';
import { idSchema } from '../schemas/ids.schemas.js';

const router = express.Router();
router
  .route('/')
  .get(getMessages)
  .post(processRequestBody(messageSchema), createMessage);
router
  .route('/:id')
  .patch(
    processRequest({ params: idSchema, body: messageSchema }),
    updateMessage,
  )
  .delete(processRequestParams(idSchema), deleteMessage);
router.post('/restore-default', restoreDefaultMessages);

export default router;
