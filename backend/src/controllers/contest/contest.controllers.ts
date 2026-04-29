import type { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import db from '@/utils/db';
import { contest, project } from '@/db/schema';
import { createContestSchema, updateContestSchema } from './validation';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';

const PUBLIC_CONTEST_OWNER_USER_ID = '6yjaFy0Cmi4Y5CciAwC0bmBagpcizFVY';

export const createContest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = createContestSchema.parse(req.body);

  const { projects, ...contestData } = validated;

  const [newContest] = await db
    .insert(contest)
    .values({
      userId,
      ...contestData,
      topbarDescription: contestData.topbarDescription || contestData.shortDescription,
    })
    .returning();

  if (!newContest) {
    res.status(500).json({ message: 'Failed to create contest' });
    return;
  }

  if (projects && projects.length > 0) {
    await db.insert(project).values(
      projects.map((p) => ({
        projectId: p.projectId,
        problemMarkdown: p.problemMarkdown,
        contestId: newContest.id,
      })),
    );
  }

  const contestWithProjects = await db.query.contest.findFirst({
    where: eq(contest.id, newContest.id),
    with: {
      projects: true,
    },
  });

  res.status(201).json(contestWithProjects);
});

export const getContests = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const contests = await db.query.contest.findMany({
    where: eq(contest.userId, userId),
    with: {
      projects: true,
    },
    orderBy: (contest, { desc }) => [desc(contest.createdAt)],
  });

  res.json(contests);
});

export const getPublicContests = asyncHandler(async (req: Request, res: Response) => {
  const contests = await db.query.contest.findMany({
    where: eq(contest.userId, PUBLIC_CONTEST_OWNER_USER_ID),
    with: {
      projects: true,
    },
    orderBy: (contest, { desc }) => [desc(contest.createdAt)],
  });

  res.json(contests);
});

export const getContestById = asyncHandler(async (req: Request, res: Response) => {
  const contestId = Number(req.params.id);
  const contestData = await db.query.contest.findFirst({
    where: (c, { eq }) => eq(c.id, contestId),
    with: {
      projects: true,
    },
  });

  if (!contestData) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  // Public contests are readable by everyone
  if (contestData.userId === PUBLIC_CONTEST_OWNER_USER_ID) {
    res.json(contestData);
    return;
  }

  // Private contests require auth and ownership
  const userId = (req as Partial<AuthenticatedRequest>).user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (contestData.userId !== userId) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  res.json(contestData);
});

export const updateContest = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const contestId = Number(req.params.id);
  const validated = updateContestSchema.parse(req.body);

  const existingContest = await db.query.contest.findFirst({
    where: (c, { eq, and }) => and(eq(c.id, contestId), eq(c.userId, userId)),
  });

  if (!existingContest) {
    res.status(404).json({ message: 'Contest not found or unauthorized' });
    return;
  }

  const { projects, ...contestData } = validated;

  if (Object.keys(contestData).length > 0) {
    await db.update(contest).set(contestData).where(eq(contest.id, contestId));
  }

  if (projects) {
    await db.delete(project).where(eq(project.contestId, contestId));

    if (projects.length > 0) {
      await db.insert(project).values(
        projects.map((p) => ({
          projectId: p.projectId,
          problemMarkdown: p.problemMarkdown,
          contestId,
        })),
      );
    }
  }

  const updated = await db.query.contest.findFirst({
    where: eq(contest.id, contestId),
    with: {
      projects: true,
    },
  });

  res.json(updated);
});

export const deleteContest = asyncHandler(async (req: Request, res: Response) => {
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
