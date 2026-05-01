import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createCategory, getCategories } from '@/services/categories.service';
import { toast } from 'sonner';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; slug?: string }) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created');
    },
    onError: () => {
      toast.error('Failed to create category');
    },
  });
};
