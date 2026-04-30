'use client';

import { useQuery } from '@tanstack/react-query';
import { getInterviews, type InterviewListItem } from '@/services/interviews.service';

export const useInterviewsList = () => {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => getInterviews(),
  });
};

export type { InterviewListItem };
