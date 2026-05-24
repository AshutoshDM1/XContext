import { useMutation } from '@tanstack/react-query';
import { createAiContest, getAiContestNext, previewAiContest } from '@/services/ai-contest.service';

export function useAiContest() {
  return useMutation({ mutationKey: ['ai-contest-create'], mutationFn: createAiContest });
}

export function useAiContestPreview() {
  return useMutation({ mutationKey: ['ai-contest-preview'], mutationFn: previewAiContest });
}

export function useAiContestNext() {
  return useMutation({ mutationKey: ['ai-contest-next'], mutationFn: getAiContestNext });
}
