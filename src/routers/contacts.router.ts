import express from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from '../handlers/contacts.handlers.js';
import { contactSchema } from '../schemas/contacts.schemas.js';
import {
  processRequestBody,
  processRequestParams,
} from 'zod-express-middleware';
import { idSchema } from '../schemas/ids.schemas.js';

const router = express.Router();
router
  .route('/')
  .get(getContacts)
  .post(processRequestBody(contactSchema), createContact);
router
  .route('/:id')
  .all(processRequestParams(idSchema))
  .patch(processRequestBody(contactSchema), updateContact)
  .delete(deleteContact);

export default router;
