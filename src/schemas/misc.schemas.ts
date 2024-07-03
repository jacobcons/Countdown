import { z } from 'zod';

export const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const strSchema = z.string().trim().min(1);
