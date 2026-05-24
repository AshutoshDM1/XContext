import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCodes,
  getCodeById,
  getCodeByProjectId,
  createCode,
  updateCode,
  updateCodeByProjectId,
  deleteCode,
  type CreateCodeInput,
  type UpdateCodeInput,
} from '../services/code.service';
import { toast } from 'sonner';

export const useCodes = () => {
  return useQuery({
    queryKey: ['code'],
    queryFn: getCodes,
  });
};

export const useCode = (id: number) => {
  return useQuery({
    queryKey: ['code', id],
    queryFn: () => getCodeById(id),
    enabled: !!id,
  });
};

export const useCodeByProject = (projectId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['code', 'project', projectId],
    queryFn: () => getCodeByProjectId(projectId),
    enabled: options?.enabled ?? !!projectId,
    retry: false, // Don't retry 404s
  });
};

export const useCreateCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCodeInput) => createCode(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['code'] });
      queryClient.invalidateQueries({ queryKey: ['code', 'project', variables.projectId] });
      toast.success('Code created successfully!');
    },
    onError: () => {
      toast.error('Failed to create code');
    },
  });
};

export const useUpdateCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateCodeInput }) => updateCode(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code'] });
      toast.success('Code updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update code');
    },
  });
};

export const useUpdateCodeByProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: number; input: UpdateCodeInput }) =>
      updateCodeByProjectId(projectId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['code'] });
      queryClient.invalidateQueries({ queryKey: ['code', 'project', variables.projectId] });
      toast.success('Code updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update code');
    },
  });
};

export const useDeleteCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['code'] });
      toast.success('Code deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete code');
    },
  });
};
