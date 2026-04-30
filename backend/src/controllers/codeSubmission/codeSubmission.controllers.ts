import type { Request, Response } from 'express';
import { and, eq, desc, sql } from 'drizzle-orm';
import db from '@/utils/db';
import { code, codeSubmission, contest, project } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';
import { createCodeSubmissionSchema, getCodeSubmissionsSchema } from './validation';

const PUBLIC_CONTEST_OWNER_USER_ID = '6yjaFy0Cmi4Y5CciAwC0bmBagpcizFVY';

function canAccessProjectForUser(projectContestOwnerId: string, userId: string): boolean {
  return projectContestOwnerId === userId || projectContestOwnerId === PUBLIC_CONTEST_OWNER_USER_ID;
}

export const createCodeSubmission = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = createCodeSubmissionSchema.parse(req.body);

  const proj = await db.query.project.findFirst({
    where: eq(project.id, validated.projectId),
    with: { contest: true },
  });

  if (!proj || !canAccessProjectForUser(proj.contest.userId, userId)) {
    res.status(404).json({ message: 'Project not found or unauthorized' });
    return;
  }

  // Upsert current working code snapshot for this user+project.
  const existingCode = await db.query.code.findFirst({
    where: and(eq(code.userId, userId), eq(code.projectId, validated.projectId)),
  });

  if (existingCode) {
    await db
      .update(code)
      .set({ code: validated.code })
      .where(and(eq(code.userId, userId), eq(code.projectId, validated.projectId)));
  } else {
    await db.insert(code).values({
      userId,
      projectId: validated.projectId,
      code: validated.code,
    });
  }

  const nextSeqRows = await db
    .select({ maxSeq: sql<number | null>`max(${codeSubmission.sequence})` })
    .from(codeSubmission)
    .where(
      and(eq(codeSubmission.userId, userId), eq(codeSubmission.projectId, validated.projectId)),
    );
  const maxSeq = nextSeqRows[0]?.maxSeq ?? null;
  const nextSequence = (maxSeq ?? 0) + 1;

  const [created] = await db
    .insert(codeSubmission)
    .values({
      userId,
      projectId: validated.projectId,
      code: validated.code,
      sequence: nextSequence,
    })
    .returning();

  res.status(201).json(created);
});

export const getCodeSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const { contestId, projectId } = getCodeSubmissionsSchema.parse(req.query);

  const contestRow = await db.query.contest.findFirst({
    where: eq(contest.id, contestId),
  });

  if (!contestRow) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  if (contestRow.userId !== PUBLIC_CONTEST_OWNER_USER_ID && contestRow.userId !== userId) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  const rows = await db
    .select({
      id: codeSubmission.id,
      userId: codeSubmission.userId,
      projectId: codeSubmission.projectId,
      sequence: codeSubmission.sequence,
      projectName: project.projectId,
      createdAt: codeSubmission.createdAt,
      updatedAt: codeSubmission.updatedAt,
    })
    .from(codeSubmission)
    .innerJoin(project, eq(project.id, codeSubmission.projectId))
    .innerJoin(contest, eq(contest.id, project.contestId))
    .where(
      and(
        eq(codeSubmission.userId, userId),
        eq(contest.id, contestId),
        ...(projectId ? [eq(codeSubmission.projectId, projectId)] : []),
      ),
    )
    .orderBy(desc(codeSubmission.createdAt));

  res.json(rows);
});
