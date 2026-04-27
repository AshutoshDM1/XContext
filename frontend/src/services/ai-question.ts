import { baseApi } from './api';
import { toast } from 'sonner';

export type AiQuestionResponse = { question: string };

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
  throw error;
};

export async function postAiQuestion(topic: string): Promise<AiQuestionResponse> {
  try {
    const response = await baseApi.post(
      '/api/v1/ai-question',
      { topic },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      },
    );
    const data = response.data as { message?: string; question?: string };
    if (!data.question) throw new Error('Invalid response from server');
    return { question: data.question };
  } catch (error: unknown) {
    throw handleError(error);
  }
}
