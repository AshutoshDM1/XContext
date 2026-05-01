import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUserContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  type CreateContestInput,
  type UpdateContestInput,
  getPublicContests,
  joinContest,
} from '../services/contests.service';
import { toast } from 'sonner';

export const useUserContests = () => {
  return useQuery({
    queryKey: ['contests'],
    queryFn: getUserContests,
  });
};

export const usePublicContests = () => {
  return useQuery({
    queryKey: ['public-contests'],
    queryFn: getPublicContests,
  });
};

export const useContest = (id: number) => {
  return useQuery({
    queryKey: ['contests', id],
    queryFn: () => getContestById(id),
    enabled: !!id,
  });
};

export const useCreateContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContestInput) => createContest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      toast.success('Contest created successfully!');
    },
    onError: () => {
      toast.error('Failed to create contest');
    },
  });
};

export const useUpdateContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateContestInput }) =>
      updateContest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['public-contests'] });
      toast.success('Contest updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update contest');
    },
  });
};

export const useDeleteContest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteContest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['public-contests'] });
      toast.success('Contest deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete contest');
    },
  });
};

export const useJoinContest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => joinContest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['public-contests'] });
      toast.success('Joined contest!');
    },
    onError: () => {
      toast.error('Unable to join contest');
    },
  });
};
