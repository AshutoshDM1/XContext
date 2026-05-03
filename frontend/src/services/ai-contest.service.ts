import { baseApi } from './api';
import { toast } from 'sonner';

export type CreateAiContestInput = {
  about: string;
  language: 'javascript' | 'typescript';
  difficulty: 'light' | 'medium' | 'very_difficult';
  length: 'short' | 'lengthy';
  backendLogic: 'no' | 'yes';
  topics: string[];
};

export type CreateAiContestResponse = {
  contestId: number;
  problemId: number;
};

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type AiContestDraft = Partial<CreateAiContestInput>;

export type AiContestQuestion =
  | { kind: 'text'; id: 'about'; prompt: string; placeholder?: string }
  | {
      kind: 'single';
      id: 'language' | 'difficulty' | 'length' | 'backendLogic';
      prompt: string;
      options: { id: string; label: string }[];
    }
  | {
      kind: 'multi';
      id: 'topics';
      prompt: string;
      options: { id: string; label: string }[];
      min?: number;
      max?: number;
    }
  | { kind: 'confirm'; id: 'confirm'; prompt: string; summary: string };

export type AiContestNextResponse = {
  assistantMessage: string;
  draft: AiContestDraft;
  question: AiContestQuestion;
};

const handleError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
  throw error;
};

export async function getAiContestNext(input: {
  messages: ChatMessage[];
  draft?: AiContestDraft;
}): Promise<AiContestNextResponse> {
  try {
    const response = await baseApi.post('/api/v1/ai-contest/next', input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    const data = response.data as Partial<AiContestNextResponse> & { message?: string };
    if (!data.assistantMessage || !data.question || !data.draft) {
      throw new Error(data.message || 'Invalid response from server');
    }
    return data as AiContestNextResponse;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function createAiContest(
  input: CreateAiContestInput,
): Promise<CreateAiContestResponse> {
  try {
    const response = await baseApi.post('/api/v1/ai-contest/create', input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    const data = response.data as Partial<CreateAiContestResponse> & { message?: string };
    if (!data.contestId) throw new Error(data.message || 'Invalid response from server');
    return { contestId: data.contestId, problemId: data.problemId ?? 0 };
  } catch (error: unknown) {
    throw handleError(error);
  }
}
