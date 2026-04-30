import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createInterview,
  getInterviewById,
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
