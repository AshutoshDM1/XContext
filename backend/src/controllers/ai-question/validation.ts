import { z } from 'zod';

export const getAiQuestionSchema = z.object({
  topic: z.string().min(1).max(500).trim(),
});

export type GetAiQuestionSchema = z.infer<typeof getAiQuestionSchema>;
