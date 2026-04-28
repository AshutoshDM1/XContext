import { z } from 'zod';

export const projectSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  problemMarkdown: z.string().min(1, 'Problem markdown is required'),
});

export const createContestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  shortDescription: z.string().min(1, 'Short description is required').max(500),
  topbarDescription: z.string().max(500).optional(),
  status: z.enum(['LIVE', 'ENDED']).default('LIVE'),
  participantCount: z.number().int().min(0).default(0),
  timeLabel: z.string().min(1, 'Time label is required').max(100),
  projects: z
    .array(projectSchema)
    .min(1, 'At least one project required')
    .max(3, 'Maximum 3 projects allowed'),
});

export const updateContestSchema = createContestSchema.partial();

export type CreateContestInput = z.infer<typeof createContestSchema>;
export type UpdateContestInput = z.infer<typeof updateContestSchema>;
