import { baseApi } from './api';
import { toast } from 'sonner';

export interface Category {
  id: number;
  name: string;
  slug: string;
}

const handleError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error(error.message);
    return error.message;
  }
  toast.error('An unknown error occurred');
  throw error;
};

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await baseApi.get('/api/v1/categories', {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}

export async function createCategory(input: { name: string; slug?: string }): Promise<Category> {
  try {
    const response = await baseApi.post('/api/v1/categories', input, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    throw handleError(error);
  }
}
