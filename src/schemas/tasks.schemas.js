import { z } from 'zod';
export const createTaskSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    finish_timestamp: z.string().datetime(),
});
export const updateTaskSchema = z
    .object({
    title: z.string(),
    description: z.string(),
    finish_timestamp: z.string().datetime(),
    completed: z.boolean(),
})
    .partial();
