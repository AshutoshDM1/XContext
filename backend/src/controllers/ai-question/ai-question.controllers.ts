import { createGateway, generateText } from 'ai';
import type { Request, Response } from 'express';
import { getAiQuestionSchema } from './validation';
import asyncHandler from '@/utils/asyncHandler';

const JS_TS_QUESTION_SYSTEM = `You are an expert JavaScript and TypeScript educator.
Write exactly one technical question that tests real understanding of the user's topic.

Requirements:
- The question must be strictly about JavaScript and/or TypeScript as they apply to that topic.
- Do not pivot to other languages unless the topic is explicitly about interop, in which case keep the focus on JS/TS.
- One question only: no bullet lists of questions, no "Part A / Part B".
- Do not include the answer, hints, or explanations.
- Output plain text only: no markdown headings, no quotes wrapping the whole question.`;

const DEFAULT_MODEL = 'google/gemini-2.5-flash';

const apiKey = process.env.AI_GATEWAY_API_KEY;
if (!apiKey) {
  throw new Error('AI Gateway is not configured (AI_GATEWAY_API_KEY).');
}

export const getAiQuestionController = asyncHandler(async (req: Request, res: Response) => {
  const { topic } = getAiQuestionSchema.parse(req.body);

  try {
    const gateway = createGateway({ apiKey });
    const { text } = await generateText({
      model: gateway(DEFAULT_MODEL),
      system: JS_TS_QUESTION_SYSTEM,
      prompt: `Topic: ${topic}`,
    });
    res.json({ question: text.trim() });
  } catch (error) {
    console.error(error);
    res.status(503).json({ message: 'Failed to generate question' });
    return;
  }
});
