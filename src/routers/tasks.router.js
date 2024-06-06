import express from 'express';
import { getTasks, createTask, updateTask, deleteTask, } from '../handlers/tasks.handlers.js';
import { createTaskSchema, updateTaskSchema, } from '../schemas/tasks.schemas.js';
import { validateRequestBody, validateRequestParams, } from 'zod-express-middleware';
import { idSchema } from '../schemas/ids.schemas.js';
const router = express.Router();
router
    .route('/')
    .get(getTasks)
    .post(validateRequestBody(createTaskSchema), createTask);
router
    .route('/:id')
    .all(validateRequestParams(idSchema))
    .patch(validateRequestBody(updateTaskSchema), updateTask)
    .delete(deleteTask);
export default router;
