import { z } from 'zod';

export const createCodeSubmissionSchema = z.object({
  projectId: z.number().int().positive('Valid project ID is required'),
  code: z.any(),
});

export const getCodeSubmissionsSchema = z.object({
  contestId: z.coerce.number().int().positive('Valid contest ID is required'),
  projectId: z.coerce.number().int().positive().optional(),
});

export type CreateCodeSubmissionInput = z.infer<typeof createCodeSubmissionSchema>;
export type GetCodeSubmissionsInput = z.infer<typeof getCodeSubmissionsSchema>;
