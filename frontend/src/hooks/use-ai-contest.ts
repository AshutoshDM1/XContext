import { useMutation } from '@tanstack/react-query';
import { createAiContest, getAiContestNext } from '@/services/ai-contest.service';

export function useAiContest() {
  return useMutation({ mutationKey: ['ai-contest-create'], mutationFn: createAiContest });
}

export function useAiContestNext() {
  return useMutation({ mutationKey: ['ai-contest-next'], mutationFn: getAiContestNext });
}
