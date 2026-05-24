import { toast } from 'sonner';
import { baseApi } from './api';

export type InterviewStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type InterviewQuestionAnswer = {
  id: number;
  interviewId: number;
  sequence: number;
  question: string;
  answer: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Interview = {
  id: number;
  userId: string;
  contestId?: number | null;
  title: string;
  description: string;
  status: InterviewStatus;
  durationMs?: number;
  startedAt: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InterviewProject = {
  id: number;
  interviewId: number;
  projectId: number;
  latestCodeSubmissionId: number;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    projectId: string;
    problemMarkdown: string;
    contestId: number;
  };
  latestCodeSubmission: {
    id: number;
    userId: string;
    projectId: number;
    code: unknown;
    sequence: number;
    createdAt: string;
    updatedAt: string;
  };
};

export type InterviewDetails = Interview & {
  interviewProjects: InterviewProject[];
  questionAnswers: InterviewQuestionAnswer[];
};

export type InterviewListItem = Interview & {
  interviewProjects: Array<{
    id: number;
    project: { id: number; projectId: string };
  }>;
};

export type CreateInterviewInput = {
  projectIds: number[];
  title?: string;
  description?: string;
  durationMs?: number;
};

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(error.message);
    return error.message;
  }
  toast.error('An unknown error occurred');
  throw error;
};

export async function createInterview(input: CreateInterviewInput): Promise<Interview> {
  try {
    const response = await baseApi.post('/api/v1/interviews', input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function getInterviewById(id: number): Promise<InterviewDetails> {
  try {
    const response = await baseApi.get(`/api/v1/interviews/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function getInterviews(): Promise<InterviewListItem[]> {
  try {
    const response = await baseApi.get('/api/v1/interviews', { withCredentials: true });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function generateInterviewQuestion(
  interviewId: number,
): Promise<InterviewQuestionAnswer> {
  try {
    const response = await baseApi.post(
      `/api/v1/interviews/${interviewId}/generate-question`,
      {},
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    );
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function answerInterviewQuestion(params: {
  interviewId: number;
  questionAnswerId: number;
  answer: string;
}): Promise<InterviewQuestionAnswer> {
  try {
    const response = await baseApi.put(
      `/api/v1/interviews/${params.interviewId}/questions/${params.questionAnswerId}/answer`,
      { answer: params.answer },
      { headers: { 'Content-Type': 'application/json' }, withCredentials: true },
    );
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function updateInterview(
  interviewId: number,
  input: Partial<Pick<Interview, 'status' | 'title' | 'description'>>,
): Promise<Interview> {
  try {
    const response = await baseApi.put(`/api/v1/interviews/${interviewId}`, input, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export type InterviewRatingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type InterviewRating = {
  id: number;
  interviewId: number;
  userId: string;
  contestId?: number | null;
  status: InterviewRatingStatus;
  score?: number | null;
  timeTakenMs?: number | null;
  timeLeftMs?: number | null;
  summary?: string | null;
  improvements?: string | null;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getInterviewRating(interviewId: number): Promise<InterviewRating> {
  try {
    const response = await baseApi.get(`/api/v1/interviews/${interviewId}/rating`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function generateInterviewRating(interviewId: number): Promise<InterviewRating> {
  try {
    const response = await baseApi.post(
      `/api/v1/interviews/${interviewId}/rating/generate`,
      {},
      { withCredentials: true },
    );
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}
