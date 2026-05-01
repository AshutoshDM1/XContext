import type { Request, Response } from 'express';
import { and, desc, eq, sql } from 'drizzle-orm';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';
import db from '@/utils/db';
import {
  codeSubmission,
  interview,
  interviewRating,
  interviewProject,
  interviewQuestionAnswer,
  project,
} from '@/db/schema';
import { generateSingleQuestion } from '@/controllers/ai-question/ai-question.controllers';
import {
  addInterviewQuestionSchema,
  answerInterviewQuestionSchema,
  createInterviewSchema,
  generateInterviewQuestionSchema,
  updateInterviewSchema,
} from './validation';

const MAX_INTERVIEW_QUESTIONS = 8;
const INTERVIEW_QUESTION_SYSTEM = `You are a senior software engineer conducting a codebase interview.
Generate exactly ONE interview question based on the provided context, and also provide a detailed explanation of what the interviewer is looking for.

Output format MUST be Markdown with these sections:
1) "## Question" (the question only)
2) "## What I'm evaluating" (2-5 bullets)
3) "## Context to consider" (short paragraph referencing the provided problem(s)/code)

Rules:
- One question only (no multi-part A/B/C).
- Must be JavaScript/TypeScript focused.
- Must reference something concrete from the provided problem statements and/or the submitted code.
- Do NOT include the answer or hints for how to solve it.
- Avoid repeating previous questions (use the previous Q&A context).`;

function safeStringify(value: unknown, maxChars: number): string {
  try {
    const s = JSON.stringify(value);
    return s.length > maxChars ? `${s.slice(0, maxChars)}…` : s;
  } catch {
    return '[unserializable]';
  }
}

export const createInterview = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = createInterviewSchema.parse(req.body);

  const projects = await db.query.project.findMany({
    where: (p, { inArray }) => inArray(p.id, validated.projectIds),
  });
  if (projects.length !== validated.projectIds.length) {
    res.status(404).json({ message: 'One or more problems not found' });
    return;
  }
  const contestId = projects[0]?.contestId ?? null;
  if (contestId === null || projects.some((p) => p.contestId !== contestId)) {
    res.status(400).json({ message: 'All problems must be from the same contest' });
    return;
  }

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
      contestId,
      title: validated.title ?? `Interview session`,
      description: validated.description ?? 'Interview session initialized',
      status: 'PENDING',
      durationMs: validated.durationMs ?? 10 * 60 * 1000,
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

export const generateInterviewQuestion = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);
  generateInterviewQuestionSchema.parse(req.body ?? {});

  const row = await db.query.interview.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
    with: {
      interviewProjects: {
        with: {
          project: {
            with: {
              contest: true,
            },
          },
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

  const existingCount = row.questionAnswers?.length ?? 0;
  if (existingCount >= MAX_INTERVIEW_QUESTIONS) {
    res.status(400).json({ message: `Max questions reached (${MAX_INTERVIEW_QUESTIONS})` });
    return;
  }

  const contest = row.interviewProjects?.[0]?.project?.contest;
  const contestTitle = contest?.title ?? 'Unknown contest';
  const contestShort = contest?.shortDescription ?? '';
  const contestTopbar = contest?.topbarDescription ?? '';
  const contestTimeLabel = contest?.timeLabel ?? '';
  const problems = (row.interviewProjects ?? []).map((ip) => ({
    problemName: ip.project.projectId,
    problemMarkdown: ip.project.problemMarkdown,
    submissionSequence: (ip.latestCodeSubmission as any)?.sequence,
    codeSnapshot: ip.latestCodeSubmission?.code,
  }));

  const previousQA = (row.questionAnswers ?? []).map((qa) => ({
    sequence: qa.sequence,
    question: qa.question,
    answer: qa.answer ?? '',
  }));
  const nextNumber = existingCount + 1;

  const prompt = [
    `Contest: ${contestTitle}`,
    contestShort ? `Contest short description: ${contestShort}` : '',
    contestTopbar ? `Contest context: ${contestTopbar}` : '',
    contestTimeLabel ? `Contest time label: ${contestTimeLabel}` : '',
    `Question number: ${nextNumber}/${MAX_INTERVIEW_QUESTIONS}`,
    ``,
    `Problems included:`,
    ...problems.map((p, idx) => {
      const md =
        p.problemMarkdown.length > 2500
          ? `${p.problemMarkdown.slice(0, 2500)}…`
          : p.problemMarkdown;
      const code = safeStringify(p.codeSnapshot, 6000);
      return [
        `Problem ${idx + 1}: ${p.problemName} (latest submission #${p.submissionSequence ?? '?'})`,
        `Problem statement (markdown):`,
        md,
        `Code snapshot (json, truncated):`,
        code,
        ``,
      ].join('\n');
    }),
    previousQA.length > 0
      ? [
          `Previous Q&A (avoid repeating and build on this):`,
          ...previousQA.map((qa) =>
            [
              `Q${qa.sequence}:`,
              qa.question,
              qa.answer ? `Answer given:\n${qa.answer}` : `Answer given: (not answered)`,
              ``,
            ].join('\n'),
          ),
        ].join('\n')
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  let questionText: string;
  try {
    questionText = await generateSingleQuestion({
      system: INTERVIEW_QUESTION_SYSTEM,
      prompt,
    });
  } catch (e) {
    console.error(e);
    res.status(503).json({ message: 'Failed to generate question' });
    return;
  }

  // Mark interview started at first question.
  if (!row.startedAt) {
    await db
      .update(interview)
      .set({ startedAt: new Date(), status: 'IN_PROGRESS' })
      .where(and(eq(interview.id, interviewId), eq(interview.userId, userId)));
  }

  const [created] = await db
    .insert(interviewQuestionAnswer)
    .values({
      interviewId,
      sequence: nextNumber,
      question: questionText,
      answer: null,
    })
    .returning();

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
    const updateData: Record<string, unknown> = { ...validated };
    if (validated.completedAt) updateData.completedAt = new Date(validated.completedAt);
    if (validated.status === 'COMPLETED') updateData.completedAt = new Date();
    await db
      .update(interview)
      .set(updateData as any)
      .where(eq(interview.id, interviewId));

    if (validated.status === 'COMPLETED') {
      const row = await db.query.interview.findFirst({
        where: (i, { eq, and }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
      });
      if (row) {
        const existingRating = await db.query.interviewRating.findFirst({
          where: (r, { eq }) => eq(r.interviewId, interviewId),
        });
        if (!existingRating) {
          await db.insert(interviewRating).values({
            interviewId,
            userId,
            contestId: (row as any).contestId ?? null,
            status: 'PENDING',
          });
        }
      }
    }
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
