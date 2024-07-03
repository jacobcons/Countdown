import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../handlers/tasks.handlers.js';
import {
  createTaskSchema,
  updateTaskSchema,
} from '../schemas/tasks.schemas.js';
import {
  processRequest,
  processRequestBody,
  processRequestParams,
} from 'zod-express-middleware';
import { idSchema } from '../schemas/misc.schemas.js';

const router = express.Router();

router
  .route('/')
  .get(getTasks)
  .post(processRequestBody(createTaskSchema), createTask);
router
  .route('/:id')
  .patch(
    processRequest({ params: idSchema, body: updateTaskSchema }),
    updateTask,
  )
  .delete(processRequestParams(idSchema), deleteTask);

export default router;
