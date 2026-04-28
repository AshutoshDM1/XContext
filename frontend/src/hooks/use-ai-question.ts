import { useMutation } from '@tanstack/react-query';
import { postAiQuestion } from '../services/ai-question.service';

export function useAiQuestion() {
  return useMutation({ mutationKey: ['ai-question'], mutationFn: postAiQuestion });
}
