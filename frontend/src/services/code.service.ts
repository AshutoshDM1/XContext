/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from './api';
import { toast } from 'sonner';

export interface Code {
  id: number;
  userId: string;
  projectId: number;
  code: Record<string, any> | any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCodeInput {
  projectId: number;
  code: Record<string, any> | any[];
}

export interface UpdateCodeInput {
  code: Record<string, any> | any[];
}

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(error.message);
    return error.message;
  }
  toast.error('An unknown error occurred');
  throw error;
};

export async function getCodes(): Promise<Code[]> {
  try {
    const response = await baseApi.get('/api/v1/code', {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function getCodeById(id: number): Promise<Code> {
  try {
    const response = await baseApi.get(`/api/v1/code/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function getCodeByProjectId(projectId: number): Promise<Code> {
  try {
    const response = await baseApi.get(`/api/v1/code/project/${projectId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    // Don't show toast for 404 - it means no code exists yet (expected)
    if (error?.response?.status === 404) {
      throw error;
    }
    throw handleError(error);
  }
}

export async function createCode(input: CreateCodeInput): Promise<Code> {
  try {
    const response = await baseApi.post('/api/v1/code', input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    // Another tab or Strict Mode may have created the row already
    if (status === 409) {
      return getCodeByProjectId(input.projectId);
    }
    throw handleError(error);
  }
}

export async function updateCode(id: number, input: UpdateCodeInput): Promise<Code> {
  try {
    const response = await baseApi.put(`/api/v1/code/${id}`, input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function updateCodeByProjectId(
  projectId: number,
  input: UpdateCodeInput,
): Promise<Code> {
  try {
    const response = await baseApi.put(`/api/v1/code/project/${projectId}`, input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function deleteCode(id: number): Promise<void> {
  try {
    await baseApi.delete(`/api/v1/code/${id}`, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw handleError(error);
  }
}
