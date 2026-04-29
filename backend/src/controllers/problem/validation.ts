import { z } from 'zod';

export const createProblemSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required').max(100),
  problemMarkdown: z.string().min(1, 'Problem markdown is required'),
  contestId: z.number().int().positive('Valid contest ID is required'),
});

export const updateProblemSchema = createProblemSchema.partial().extend({
  id: z.number().int().positive(),
});

export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
