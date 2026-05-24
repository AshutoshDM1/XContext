import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  type CreateProblemInput,
} from '../services/problems.service';
import { toast } from 'sonner';

export const useProblems = (contestId?: number) => {
  return useQuery({
    queryKey: contestId ? ['problems', contestId] : ['problems'],
    queryFn: () => getProblems(contestId),
  });
};

export const useProblem = (id: number) => {
  return useQuery({
    queryKey: ['problems', id],
    queryFn: () => getProblemById(id),
    enabled: !!id,
  });
};

export const useCreateProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProblemInput) => createProblem(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['problems', variables.contestId] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      toast.success('Problem created successfully!');
    },
    onError: () => {
      toast.error('Failed to create problem');
    },
  });
};

export const useUpdateProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<CreateProblemInput> }) =>
      updateProblem(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      toast.success('Problem updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update problem');
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProblem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      toast.success('Problem deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete problem');
    },
  });
};
