import { z } from "zod";

export const createMemorySchema = z.object({
  bookId: z.string().uuid(),
  title: z.string().min(1).max(200),
  story: z.string().max(5000).optional().default(""),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
  location: z.string().max(300).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  perspective: z.string().max(5000).optional(),
});

export type CreateMemoryPayload = z.infer<typeof createMemorySchema>;
