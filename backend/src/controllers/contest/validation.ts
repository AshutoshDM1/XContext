import { z } from 'zod';

export const projectSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  problemMarkdown: z.string().min(1, 'Problem markdown is required'),
});

const contestBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  shortDescription: z.string().min(1, 'Short description is required').max(500),
  topbarDescription: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  categoryIds: z
    .array(z.number().int().positive())
    .max(3, 'Maximum 3 categories allowed')
    .optional(),
  status: z.enum(['LIVE', 'ENDED']).default('LIVE'),
  // Server-controlled (incremented by join endpoint)
  participantCount: z.number().int().min(0).default(0).optional(),
  // Optional live window (ISO strings). When omitted → always open.
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  // Legacy label (optional now)
  timeLabel: z.string().max(100).optional(),
  projects: z
    .array(projectSchema)
    .min(1, 'At least one project required')
    .max(3, 'Maximum 3 projects allowed'),
});

function refineLiveWindow(val: { startsAt?: string; endsAt?: string }, ctx: z.RefinementCtx) {
  if (val.startsAt && val.endsAt) {
    const s = new Date(val.startsAt).getTime();
    const e = new Date(val.endsAt).getTime();
    if (Number.isFinite(s) && Number.isFinite(e) && e <= s) {
      ctx.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'End time must be after start time',
      });
    }
  }
}

export const createContestSchema = contestBaseSchema.superRefine(refineLiveWindow);

// Zod v4: .partial() cannot be used on schemas containing refinements.
export const updateContestSchema = contestBaseSchema.partial().superRefine(refineLiveWindow);

export type CreateContestInput = z.infer<typeof createContestSchema>;
export type UpdateContestInput = z.infer<typeof updateContestSchema>;
