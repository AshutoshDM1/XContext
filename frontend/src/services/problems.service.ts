import { baseApi } from './api';
import { toast } from 'sonner';

export interface Problem {
  id: number;
  projectId: string;
  problemMarkdown: string;
  contestId: number;
}

export interface CreateProblemInput {
  projectId: string;
  problemMarkdown: string;
  contestId: number;
}

export interface UpdateProblemInput extends Partial<Omit<CreateProblemInput, 'contestId'>> {
  id: number;
}

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(error.message);
    return error.message;
  }
  toast.error('An unknown error occurred');
  throw error;
};

export async function getProblems(contestId?: number): Promise<Problem[]> {
  try {
    const params = contestId ? { contestId } : {};
    const response = await baseApi.get('/api/v1/problems', {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function getProblemById(id: number): Promise<Problem> {
  try {
    const response = await baseApi.get(`/api/v1/problems/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function createProblem(input: CreateProblemInput): Promise<Problem> {
  try {
    const response = await baseApi.post('/api/v1/problems', input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function updateProblem(
  id: number,
  input: Partial<CreateProblemInput>,
): Promise<Problem> {
  try {
    const response = await baseApi.put(`/api/v1/problems/${id}`, input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function deleteProblem(id: number): Promise<void> {
  try {
    await baseApi.delete(`/api/v1/problems/${id}`, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw handleError(error);
  }
}
