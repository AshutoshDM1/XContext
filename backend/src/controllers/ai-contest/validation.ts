import { z } from 'zod';

export const createAiContestRequestSchema = z.object({
  about: z.string().min(1).max(2000).trim(),
  language: z.enum(['javascript', 'typescript']),
  difficulty: z.enum(['light', 'medium', 'very_difficult']),
  length: z.enum(['short', 'lengthy']),
  backendLogic: z.enum(['no', 'yes']),
  topics: z.array(z.string().min(1).max(80)).min(1).max(6),
});

export type CreateAiContestRequest = z.infer<typeof createAiContestRequestSchema>;

export const aiContestModelOutputSchema = z.object({
  contest: z.object({
    title: z.string().min(1).max(200),
    shortDescription: z.string().min(1).max(500),
    topbarDescription: z.string().min(1).max(500).optional(),
  }),
  problem: z.object({
    projectId: z.string().min(1).max(80),
    problemMarkdown: z.string().min(1).max(20_000),
  }),
});

export type AiContestModelOutput = z.infer<typeof aiContestModelOutputSchema>;

export const aiContestDraftSchema = createAiContestRequestSchema.partial().extend({
  topics: z.array(z.string().min(1).max(80)).max(6).optional(),
});

export type AiContestDraft = z.infer<typeof aiContestDraftSchema>;

export const aiContestChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

export type AiContestChatMessage = z.infer<typeof aiContestChatMessageSchema>;

export const aiContestNextRequestSchema = z.object({
  messages: z.array(aiContestChatMessageSchema).max(50),
  draft: aiContestDraftSchema.optional(),
});

export type AiContestNextRequest = z.infer<typeof aiContestNextRequestSchema>;

export const aiContestQuestionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('text'),
    id: z.string().min(1).max(60),
    prompt: z.string().min(1).max(500),
    placeholder: z.string().max(200).optional(),
  }),
  z.object({
    kind: z.literal('single'),
    id: z.string().min(1).max(60),
    prompt: z.string().min(1).max(500),
    options: z
      .array(z.object({ id: z.string().min(1).max(60), label: z.string().min(1).max(120) }))
      .min(2)
      .max(10),
  }),
  z.object({
    kind: z.literal('multi'),
    id: z.string().min(1).max(60),
    prompt: z.string().min(1).max(500),
    options: z
      .array(z.object({ id: z.string().min(1).max(60), label: z.string().min(1).max(120) }))
      .min(2)
      .max(12),
    min: z.number().int().min(1).max(6).optional(),
    max: z.number().int().min(1).max(6).optional(),
  }),
  z.object({
    kind: z.literal('confirm'),
    id: z.string().min(1).max(60),
    prompt: z.string().min(1).max(500),
    summary: z.string().min(1).max(1500),
  }),
]);

export type AiContestQuestion = z.infer<typeof aiContestQuestionSchema>;

export const aiContestNextResponseSchema = z.object({
  assistantMessage: z.string().min(1).max(1500),
  draft: aiContestDraftSchema,
  question: aiContestQuestionSchema,
});

export type AiContestNextResponse = z.infer<typeof aiContestNextResponseSchema>;
