import type { Request, Response } from 'express';
import { createGateway, generateText } from 'ai';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';
import db from '@/utils/db';
import { contest, project } from '@/db/schema';
import {
  aiContestModelOutputSchema,
  aiContestNextRequestSchema,
  aiContestNextResponseSchema,
  createAiContestRequestSchema,
  type AiContestDraft,
  type AiContestModelOutput,
} from './validation';

const DEFAULT_MODEL = 'google/gemini-2.5-flash';

const apiKey = process.env.AI_GATEWAY_API_KEY;
if (!apiKey) {
  throw new Error('AI Gateway is not configured (AI_GATEWAY_API_KEY).');
}

const AI_CONTEST_SYSTEM = `You are generating a private coding contest and ONE problem for a user.

You MUST output ONLY valid JSON (no markdown, no prose). The JSON must match this TypeScript type:

type Output = {
  contest: {
    title: string;              // <= 200 chars
    shortDescription: string;   // <= 500 chars
    topbarDescription?: string; // <= 500 chars (optional)
  };
  problem: {
    projectId: string;          // slug-like id, e.g. "ai-problem-1"
    problemMarkdown: string;    // Markdown spec for the problem
  };
};

Constraints:
- Create exactly ONE problem.
- problemMarkdown MUST be markdown and must include:
  - A concise problem statement
  - Requirements (bullet list)
  - Input/Output section (even if the app is not CLI, describe interfaces)
  - Edge cases
  - Evaluation criteria
  - If backendLogic=yes: include routes/handlers/contracts; otherwise avoid backend requirements.
- Do not include solution code.
- Keep it aligned to the chosen language and the chosen topics.`;

function extractJson(text: string) {
  const t = text.trim();
  if (t.startsWith('{') && t.endsWith('}')) return t;
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return t.slice(start, end + 1);
}

const AI_CONTEST_NEXT_SYSTEM = `You are an agent that helps a user create a private coding contest.

You MUST output ONLY valid JSON that matches this TypeScript type:

type Draft = {
  about?: string;
  language?: "javascript" | "typescript";
  difficulty?: "light" | "medium" | "very_difficult";
  length?: "short" | "lengthy";
  backendLogic?: "no" | "yes";
  topics?: string[];
};

type Question =
  | { kind: "text"; id: "about"; prompt: string; placeholder?: string }
  | { kind: "single"; id: "language"; prompt: string; options: {id:string; label:string}[] }
  | { kind: "single"; id: "difficulty"; prompt: string; options: {id:string; label:string}[] }
  | { kind: "single"; id: "length"; prompt: string; options: {id:string; label:string}[] }
  | { kind: "single"; id: "backendLogic"; prompt: string; options: {id:string; label:string}[] }
  | { kind: "multi"; id: "topics"; prompt: string; options: {id:string; label:string}[]; min?: number; max?: number }
  | { kind: "confirm"; id: "confirm"; prompt: string; summary: string };

type Output = { assistantMessage: string; draft: Draft; question: Question };

Rules:
- Ask ONE question at a time.
- Use the draft + chat context to infer values when the user already answered implicitly.
- If a required field is missing, ask for it explicitly.
- Keep options restricted to supported values:
  - language: javascript/typescript
  - difficulty: light/medium/very_difficult
  - length: short/lengthy
  - backendLogic: no/yes
- For topics you can propose 6-10 options based on what the user said, but keep them short ids (kebab-case) and labels human friendly.
- When all required fields are present (about, language, difficulty, length, backendLogic, topics[>=1]) return kind="confirm" with a concise summary.`;

function mergeDraft(
  base: AiContestDraft | undefined,
  patch: AiContestDraft | undefined,
): AiContestDraft {
  return {
    ...(base ?? {}),
    ...(patch ?? {}),
    ...(patch?.topics ? { topics: patch.topics } : {}),
  };
}

export const getAiContestNextController = asyncHandler(async (req: Request, res: Response) => {
  const input = aiContestNextRequestSchema.parse(req.body);

  const gateway = createGateway({ apiKey });
  const prompt = JSON.stringify(
    {
      draft: input.draft ?? {},
      messages: input.messages,
    },
    null,
    2,
  );

  try {
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: AI_CONTEST_NEXT_SYSTEM,
      prompt,
    });

    const jsonText = extractJson(text);
    if (!jsonText) {
      res.status(503).json({ message: 'AI returned invalid JSON' });
      return;
    }
    const parsed = JSON.parse(jsonText) as unknown;
    const next = aiContestNextResponseSchema.parse(parsed);

    // Ensure we never "forget" already-collected data on the client.
    res.json({
      assistantMessage: next.assistantMessage,
      question: next.question,
      draft: mergeDraft(input.draft, next.draft),
    });
  } catch (error) {
    console.error(error);
    res.status(503).json({ message: 'Failed to generate next question' });
  }
});

export const createAiContestController = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const input = createAiContestRequestSchema.parse(req.body);

  const gateway = createGateway({ apiKey });
  const prompt = JSON.stringify(input, null, 2);

  let modelJson: AiContestModelOutput;
  try {
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: AI_CONTEST_SYSTEM,
      prompt: `User answers (JSON):\n${prompt}`,
    });

    const jsonText = extractJson(text);
    if (!jsonText) {
      res.status(503).json({ message: 'AI returned invalid JSON' });
      return;
    }

    const parsed = JSON.parse(jsonText) as unknown;
    modelJson = aiContestModelOutputSchema.parse(parsed);
  } catch (error) {
    console.error(error);
    res.status(503).json({ message: 'Failed to generate contest' });
    return;
  }

  const title = modelJson.contest.title.trim();
  const shortDescription = modelJson.contest.shortDescription.trim();
  const topbarDescription = modelJson.contest.topbarDescription?.trim();

  const [newContest] = await db
    .insert(contest)
    .values({
      userId,
      title,
      shortDescription,
      topbarDescription: topbarDescription || shortDescription,
      isPrivate: true,
      isPublic: false,
      status: 'LIVE',
      participantCount: 0,
      timeLabel: 'Always open',
    })
    .returning();

  if (!newContest) {
    res.status(500).json({ message: 'Failed to create contest' });
    return;
  }

  const [newProblem] = await db
    .insert(project)
    .values({
      contestId: newContest.id,
      projectId: modelJson.problem.projectId,
      problemMarkdown: modelJson.problem.problemMarkdown,
    })
    .returning();

  if (!newProblem) {
    res.status(500).json({ message: 'Failed to create problem' });
    return;
  }

  res.status(201).json({
    contestId: newContest.id,
    problemId: newProblem.id,
  });
});
