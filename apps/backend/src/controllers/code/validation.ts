import { z } from 'zod';

export const createCodeSchema = z.object({
  projectId: z.number().int().positive('Valid project ID is required'),
  code: z.any(),
});

export const updateCodeSchema = z.object({
  code: z.any(),
});

export type CreateCodeInput = z.infer<typeof createCodeSchema>;
export type UpdateCodeInput = z.infer<typeof updateCodeSchema>;
