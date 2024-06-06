import { z } from 'zod';

export const contactSchema = z.object({
  email: z.string().email(),
});
