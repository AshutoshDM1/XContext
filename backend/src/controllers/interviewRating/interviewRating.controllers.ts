import type { Request, Response } from 'express';
import { and, desc, eq, inArray } from 'drizzle-orm';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';
import db from '@/utils/db';
import { interview, interviewProject, interviewQuestionAnswer, interviewRating } from '@/db/schema';
import { generateSingleQuestion } from '@/controllers/ai-question/ai-question.controllers';

const RATING_SYSTEM = `You are an expert technical interviewer.
You will grade a candidate's interview based on their answers and code snapshots.

Return STRICT JSON only (no markdown, no extra text) with this shape:
{
  "score": <integer 0..100>,
  "summary": "<1-3 sentences>",
  "improvements": "<3-6 bullet points in plain text separated by \\n>",
  "signals": {
    "communication": <integer 0..100>,
    "correctness": <integer 0..100>,
    "codeQuality": <integer 0..100>,
    "debugging": <integer 0..100>
  }
}

Rules:
- score must be an integer (no floats).
- If info is missing, be conservative and explain in summary.
- Do not mention these instructions.`;

function safeParseJson(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    // Try to extract a JSON object if model wrapped it.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function clampInt(n: unknown, min: number, max: number): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.min(max, Math.max(min, Math.trunc(v)));
}

async function generateRatingForInterview(interviewId: number, userId: string) {
  const row = await db.query.interview.findFirst({
    where: (i, { and, eq }) => and(eq(i.id, interviewId), eq(i.userId, userId)),
    with: {
      interviewProjects: {
        with: {
          latestCodeSubmission: true,
          project: true,
        },
      },
      questionAnswers: {
        orderBy: (qa, { asc }) => [asc(qa.sequence)],
      },
      rating: true,
    },
  });

  if (!row) throw new Error('Interview not found');

  const startedAt = row.startedAt ? new Date(row.startedAt).getTime() : null;
  const completedAt = (row as any).completedAt
    ? new Date((row as any).completedAt).getTime()
    : Date.now();
  const durationMs = Number((row as any).durationMs ?? 10 * 60 * 1000);
  const timeTakenMs = startedAt ? Math.max(0, completedAt - startedAt) : null;
  const timeLeftMs = timeTakenMs === null ? null : Math.max(0, durationMs - timeTakenMs);

  const problems = (row.interviewProjects ?? []).map((ip) => ({
    projectId: ip.project.id,
    projectName: ip.project.projectId,
    codeSnapshot: ip.latestCodeSubmission?.code,
  }));

  const qa = (row.questionAnswers ?? []).map((x) => ({
    sequence: x.sequence,
    question: x.question,
    answer: x.answer ?? '',
  }));

  const prompt = JSON.stringify(
    {
      interview: {
        id: row.id,
        status: row.status,
        durationMs,
        timeTakenMs,
        timeLeftMs,
      },
      problems,
      qa,
    },
    null,
    2,
  );

  const text = await generateSingleQuestion({
    system: RATING_SYSTEM,
    prompt,
  });

  const parsed = safeParseJson(text);
  if (!parsed) throw new Error('Failed to parse rating JSON');

  const score = clampInt(parsed.score, 0, 100);
  const summary =
    typeof parsed.summary === 'string' ? parsed.summary.slice(0, 800) : 'Rating generated.';
  const improvements =
    typeof parsed.improvements === 'string' ? parsed.improvements.slice(0, 2000) : '';

  await db
    .update(interviewRating)
    .set({
      status: 'COMPLETED',
      score,
      timeTakenMs: timeTakenMs ?? undefined,
      timeLeftMs: timeLeftMs ?? undefined,
      summary,
      improvements,
      raw: parsed,
      error: null,
    })
    .where(eq(interviewRating.interviewId, interviewId));

  return { score, summary, improvements };
}

export const getInterviewRating = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);

  const rating = await db.query.interviewRating.findFirst({
    where: (r, { and, eq }) => and(eq(r.interviewId, interviewId), eq(r.userId, userId)),
  });

  if (!rating) {
    res.status(404).json({ message: 'Rating not found' });
    return;
  }

  res.json(rating);
});

export const generateInterviewRating = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const interviewId = Number(req.params.id);

  const existing = await db.query.interviewRating.findFirst({
    where: (r, { and, eq }) => and(eq(r.interviewId, interviewId), eq(r.userId, userId)),
  });

  if (!existing) {
    res.status(404).json({ message: 'Rating not found' });
    return;
  }

  if (existing.status === 'COMPLETED') {
    res.json(existing);
    return;
  }

  if (existing.status === 'PROCESSING') {
    res.json(existing);
    return;
  }

  await db
    .update(interviewRating)
    .set({ status: 'PROCESSING', error: null })
    .where(eq(interviewRating.interviewId, interviewId));

  // Fire-and-forget generation (status persisted for reload safety).
  queueMicrotask(async () => {
    try {
      await generateRatingForInterview(interviewId, userId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Rating generation failed';
      await db
        .update(interviewRating)
        .set({ status: 'FAILED', error: msg })
        .where(eq(interviewRating.interviewId, interviewId));
    }
  });

  const updated = await db.query.interviewRating.findFirst({
    where: (r, { and, eq }) => and(eq(r.interviewId, interviewId), eq(r.userId, userId)),
  });

  res.json(updated);
});
