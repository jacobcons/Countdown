import { z } from 'zod';
export const createTaskSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    finishTimestamp: z.string().datetime(),
});
export const updateTaskSchema = z
    .object({
    title: z.string(),
    description: z.string(),
    finishTimestamp: z.string().datetime(),
    completed: z
        .boolean()
        .refine((val) => val === true, { message: 'Value must be true' }),
})
    .partial();
