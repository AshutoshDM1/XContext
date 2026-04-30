import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  answerInterviewQuestion,
  createInterview,
  generateInterviewQuestion,
  getInterviewById,
  updateInterview,
  type CreateInterviewInput,
} from '@/services/interviews.service';

export const useInterview = (interviewId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['interview', interviewId],
    queryFn: () => getInterviewById(interviewId),
    enabled: options?.enabled ?? !!interviewId,
  });
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateInterviewInput) => createInterview(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.setQueryData(['interview', data.id], data);
      toast.success('Interview initialized');
    },
    onError: () => {
      toast.error('Failed to start interview');
    },
  });
};

export const useGenerateInterviewQuestion = (interviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateInterviewQuestion(interviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
    },
    onError: () => toast.error('Failed to generate question'),
  });
};

export const useAnswerInterviewQuestion = (interviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { questionAnswerId: number; answer: string }) =>
      answerInterviewQuestion({
        interviewId,
        questionAnswerId: input.questionAnswerId,
        answer: input.answer,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
      toast.success('Answer saved');
    },
    onError: () => toast.error('Failed to save answer'),
  });
};

export const useUpdateInterview = (interviewId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' }) =>
      updateInterview(interviewId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', interviewId] });
    },
  });
};
