import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import db from '@/utils/db';
import { contest } from '@/db/schema';
import { createContestSchema, updateContestSchema } from './validation';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';

export const createContest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = createContestSchema.parse(req.body);

  const [newContest] = await db
    .insert(contest)
    .values({
      userId,
      ...validated,
      topbarDescription: validated.topbarDescription || validated.shortDescription,
    })
    .returning();

  res.status(201).json(newContest);
});

export const getContests = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const contests = await db.query.contest.findMany({
    where: eq(contest.userId, userId),
    orderBy: (contest, { desc }) => [desc(contest.createdAt)],
  });

  res.json(contests);
});

export const getContestById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const contestData = await db.query.contest.findFirst({
    where: (c, { eq, and }) => and(eq(c.id, Number(req.params.id)), eq(c.userId, userId)),
  });

  if (!contestData) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  res.json(contestData);
});

export const updateContest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = updateContestSchema.parse(req.body);

  const [updated] = await db
    .update(contest)
    .set(validated)
    .where(eq(contest.id, Number(req.params.id)))
    .returning();

  if (!updated) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  res.json(updated);
});

export const deleteContest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const [deleted] = await db
    .delete(contest)
    .where(eq(contest.id, Number(req.params.id)))
    .returning();

  if (!deleted) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  res.json({ message: 'Contest deleted successfully' });
});
