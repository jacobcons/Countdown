import { z } from 'zod';
import { strSchema } from './misc.schemas.js';
export const messageSchema = z.object({
    content: strSchema,
});
