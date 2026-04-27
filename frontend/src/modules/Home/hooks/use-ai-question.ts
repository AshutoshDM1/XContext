import { useMutation } from '@tanstack/react-query';
import { postAiQuestion } from '../api/ai-question';

export function useAiQuestion() {
  return useMutation({ mutationKey: ['ai-question'], mutationFn: postAiQuestion });
}
