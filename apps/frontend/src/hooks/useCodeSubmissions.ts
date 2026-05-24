import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCodeSubmission,
  getCodeSubmissions,
  type CreateCodeSubmissionInput,
} from '@/services/codeSubmissions.service';
import { toast } from 'sonner';

export const useCodeSubmissions = (params: { contestId: number; projectId?: number }) => {
  return useQuery({
    queryKey: ['code-submissions', params.contestId, params.projectId ?? 'all'],
    queryFn: () => getCodeSubmissions(params),
    enabled: !!params.contestId,
  });
};

export const useCreateCodeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCodeSubmissionInput) => createCodeSubmission(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['code-submissions'] });
      toast.success('Submitted successfully');
    },
    onError: () => {
      toast.error('Failed to submit');
    },
  });
};
