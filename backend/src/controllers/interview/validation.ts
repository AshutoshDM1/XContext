import { z } from 'zod';

export const createInterviewSchema = z.object({
  projectIds: z.array(z.number().int().positive()).min(1, 'Select at least one problem'),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
});

export const updateInterviewSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const addInterviewQuestionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
});

export const answerInterviewQuestionSchema = z.object({
  answer: z.string().min(1, 'Answer is required'),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type AddInterviewQuestionInput = z.infer<typeof addInterviewQuestionSchema>;
export type AnswerInterviewQuestionInput = z.infer<typeof answerInterviewQuestionSchema>;
