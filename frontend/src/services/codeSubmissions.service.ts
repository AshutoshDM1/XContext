import { baseApi } from './api';
import { toast } from 'sonner';
import type { FileSystemTree } from '@webcontainer/api';

export type CodeSubmission = {
  id: number;
  userId: string;
  projectId: number;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCodeSubmissionInput = {
  projectId: number;
  code: FileSystemTree;
};

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(error.message);
    return error.message;
  }
  toast.error('An unknown error occurred');
  throw error;
};

export async function createCodeSubmission(
  input: CreateCodeSubmissionInput,
): Promise<CodeSubmission> {
  try {
    const response = await baseApi.post('/api/v1/code-submissions', input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function getCodeSubmissions(params: {
  contestId: number;
  projectId?: number;
}): Promise<CodeSubmission[]> {
  try {
    const response = await baseApi.get('/api/v1/code-submissions', {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}
