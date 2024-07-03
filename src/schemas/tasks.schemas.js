import { z } from 'zod';
import { strSchema } from './misc.schemas.js';
export const createTaskSchema = z.object({
    title: strSchema,
    description: strSchema.optional(),
    finishTimestamp: z.string().datetime(),
});
export const updateTaskSchema = z
    .object({
    title: strSchema,
    description: strSchema.nullable(),
    finishTimestamp: z.string().datetime(),
    completed: z
        .boolean()
        .refine((val) => val === true, { message: 'Value must be true' }),
})
    .partial();
