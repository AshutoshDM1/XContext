import { baseApi } from './api';
import { toast } from 'sonner';

export interface Project {
  projectId: string;
  problemMarkdown: string;
}

export interface Contest {
  id: number;
  userId: string;
  title: string;
  shortDescription: string;
  topbarDescription?: string;
  status: 'LIVE' | 'ENDED';
  participantCount: number;
  timeLabel: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateContestInput {
  title: string;
  shortDescription: string;
  topbarDescription?: string;
  status?: 'LIVE' | 'ENDED';
  participantCount?: number;
  timeLabel: string;
  projects: Project[];
}

export interface UpdateContestInput extends Partial<CreateContestInput> {}

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(error.message);
    return error.message;
  }
  toast.error('An unknown error occurred');
  throw error;
};

export async function getAllContests(): Promise<Contest[]> {
  try {
    const response = await baseApi.get('/api/v1/contests', {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function getContestById(id: number): Promise<Contest> {
  try {
    const response = await baseApi.get(`/api/v1/contests/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function createContest(input: CreateContestInput): Promise<Contest> {
  try {
    const response = await baseApi.post('/api/v1/contests', input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function updateContest(id: number, input: UpdateContestInput): Promise<Contest> {
  try {
    const response = await baseApi.put(`/api/v1/contests/${id}`, input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function deleteContest(id: number): Promise<void> {
  try {
    await baseApi.delete(`/api/v1/contests/${id}`, {
      withCredentials: true,
    });
  } catch (error: unknown) {
    throw handleError(error);
  }
}
