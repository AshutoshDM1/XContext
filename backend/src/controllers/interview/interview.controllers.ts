import type { Request, Response } from 'express';
import { and, desc, eq, sql } from 'drizzle-orm';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';
import db from '@/utils/db';
import {
  codeSubmission,
  interview,
  interviewProject,
  interviewQuestionAnswer,
  project,
} from '@/db/schema';
import {
  addInterviewQuestionSchema,
  answerInterviewQuestionSchema,
  createInterviewSchema,
  updateInterviewSchema,
} from './validation';

export const createInterview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = createInterviewSchema.parse(req.body);

  const latestSubmissions = await Promise.all(
    validated.projectIds.map(async (projectId) => {
      const latest = await db.query.codeSubmission.findFirst({
        where: and(eq(codeSubmission.userId, userId), eq(codeSubmission.projectId, projectId)),
        orderBy: (cs, { desc }) => [desc(cs.createdAt)],
      });
      return { projectId, latest };
    }),
  );

  const missing = latestSubmissions.filter((x) => !x.latest).map((x) => x.projectId);
  if (missing.length > 0) {
    res.status(404).json({
      message: 'No submissions found for some selected problems',
      missingProjectIds: missing,
    });
    return;
  }

  const [created] = await db
    .insert(interview)
    .values({
      userId,
      title: validated.title ?? `Interview session`,
      description: validated.description ?? 'Interview session initialized',
      status: 'PENDING',
    })
    .returning();

  if (!created) {
    res.status(500).json({ message: 'Failed to create interview' });
    return;
  }

  await db.insert(interviewProject).values(
    latestSubmissions.map((x) => ({
      interviewId: created.id,
      projectId: x.projectId,
      latestCodeSubmissionId: x.latest!.id,
    })),
  );

  res.status(201).json(created);
});

export const getInterviews = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const rows = await db.query.interview.findMany({
    where: eq(interview.userId, userId),
    with: {
      interviewProjects: {
        with: { project: true },
      },
    },
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });

  res.json(rows);
});

export const getInterviewById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);

  const row = await db.query.interview.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
    with: {
      interviewProjects: {
        with: {
          project: true,
          latestCodeSubmission: true,
        },
      },
      questionAnswers: {
        orderBy: (qa, { asc }) => [asc(qa.sequence)],
      },
    },
  });

  if (!row) {
    res.status(404).json({ message: 'Interview not found' });
    return;
  }

  res.json(row);
});

export const updateInterview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);
  const validated = updateInterviewSchema.parse(req.body);

  const existing = await db.query.interview.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
  });
  if (!existing) {
    res.status(404).json({ message: 'Interview not found' });
    return;
  }

  if (Object.keys(validated).length > 0) {
    await db.update(interview).set(validated).where(eq(interview.id, interviewId));
  }

  const updated = await db.query.interview.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
  });

  res.json(updated);
});

export const deleteInterview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);

  const [deleted] = await db
    .delete(interview)
    .where(and(eq(interview.id, interviewId), eq(interview.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ message: 'Interview not found' });
    return;
  }

  res.json({ message: 'Interview deleted successfully' });
});

export const addInterviewQuestion = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);
  const validated = addInterviewQuestionSchema.parse(req.body);

  const existingInterview = await db.query.interview.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
  });
  if (!existingInterview) {
    res.status(404).json({ message: 'Interview not found' });
    return;
  }

  const maxSeqRows = await db
    .select({ maxSeq: sql<number | null>`max(${interviewQuestionAnswer.sequence})` })
    .from(interviewQuestionAnswer)
    .where(eq(interviewQuestionAnswer.interviewId, interviewId));

  const maxSeq = maxSeqRows[0]?.maxSeq ?? null;
  const nextSequence = (maxSeq ?? 0) + 1;

  const [created] = await db
    .insert(interviewQuestionAnswer)
    .values({
      interviewId,
      sequence: nextSequence,
      question: validated.question,
      answer: null,
    })
    .returning();

  res.status(201).json(created);
});

export const answerInterviewQuestion = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);
  const questionAnswerId = Number(req.params.questionAnswerId);
  const validated = answerInterviewQuestionSchema.parse(req.body);

  const existingInterview = await db.query.interview.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
  });
  if (!existingInterview) {
    res.status(404).json({ message: 'Interview not found' });
    return;
  }

  const existingQa = await db.query.interviewQuestionAnswer.findFirst({
    where: (qa, { and, eq }) => and(eq(qa.id, questionAnswerId), eq(qa.interviewId, interviewId)),
  });
  if (!existingQa) {
    res.status(404).json({ message: 'Question not found' });
    return;
  }

  await db
    .update(interviewQuestionAnswer)
    .set({ answer: validated.answer })
    .where(eq(interviewQuestionAnswer.id, questionAnswerId));

  const updated = await db.query.interviewQuestionAnswer.findFirst({
    where: eq(interviewQuestionAnswer.id, questionAnswerId),
  });

  res.json(updated);
});
