import type { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import db from '@/utils/db';
import { project, contest } from '@/db/schema';
import { createProblemSchema, updateProblemSchema } from './validation';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';

export const createProblem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = createProblemSchema.parse(req.body);

  const contestExists = await db.query.contest.findFirst({
    where: and(eq(contest.id, validated.contestId), eq(contest.userId, userId)),
  });

  if (!contestExists) {
    res.status(404).json({ message: 'Contest not found or unauthorized' });
    return;
  }

  const [newProblem] = await db.insert(project).values(validated).returning();

  res.status(201).json(newProblem);
});

export const getProblems = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const contestId = req.query.contestId ? Number(req.query.contestId) : undefined;

  if (contestId) {
    const contestExists = await db.query.contest.findFirst({
      where: and(eq(contest.id, contestId), eq(contest.userId, userId)),
    });

    if (!contestExists) {
      res.status(404).json({ message: 'Contest not found or unauthorized' });
      return;
    }

    const problems = await db.query.project.findMany({
      where: eq(project.contestId, contestId),
      orderBy: (project, { asc }) => [asc(project.id)],
    });

    res.json(problems);
    return;
  }

  const userContests = await db.query.contest.findMany({
    where: eq(contest.userId, userId),
    with: {
      projects: true,
    },
  });

  const allProblems = userContests.flatMap((c) => c.projects);
  res.json(allProblems);
});

export const getProblemById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const problemId = Number(req.params.id);

  const problem = await db.query.project.findFirst({
    where: eq(project.id, problemId),
    with: {
      contest: true,
    },
  });

  if (!problem || problem.contest.userId !== userId) {
    res.status(404).json({ message: 'Problem not found or unauthorized' });
    return;
  }

  res.json(problem);
});

export const updateProblem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const problemId = Number(req.params.id);
  const validated = updateProblemSchema.parse({ ...req.body, id: problemId });

  const existingProblem = await db.query.project.findFirst({
    where: eq(project.id, problemId),
    with: {
      contest: true,
    },
  });

  if (!existingProblem || existingProblem.contest.userId !== userId) {
    res.status(404).json({ message: 'Problem not found or unauthorized' });
    return;
  }

  const { id, ...updateData } = validated;
  const [updated] = await db
    .update(project)
    .set(updateData)
    .where(eq(project.id, problemId))
    .returning();

  if (!updated) {
    res.status(404).json({ message: 'Problem not found' });
    return;
  }

  res.json(updated);
});

export const deleteProblem = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const problemId = Number(req.params.id);

  const existingProblem = await db.query.project.findFirst({
    where: eq(project.id, problemId),
    with: {
      contest: true,
    },
  });

  if (!existingProblem || existingProblem.contest.userId !== userId) {
    res.status(404).json({ message: 'Problem not found or unauthorized' });
    return;
  }

  const [deleted] = await db.delete(project).where(eq(project.id, problemId)).returning();

  if (!deleted) {
    res.status(404).json({ message: 'Problem not found' });
    return;
  }

  res.json({ message: 'Problem deleted successfully' });
});
