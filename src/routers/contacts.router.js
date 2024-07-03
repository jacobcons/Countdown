import express from 'express';
import { getContacts, createContact, updateContact, deleteContact, } from '../handlers/contacts.handlers.js';
import { contactSchema } from '../schemas/contacts.schemas.js';
import { processRequest, processRequestBody, processRequestParams, } from 'zod-express-middleware';
import { idSchema } from '../schemas/misc.schemas.js';
const router = express.Router();
router
    .route('/')
    .get(getContacts)
    .post(processRequestBody(contactSchema), createContact);
router
    .route('/:id')
    .patch(processRequest({ params: idSchema, body: contactSchema }), updateContact)
    .delete(processRequestParams(idSchema), deleteContact);
export default router;
