import { create } from 'zustand';

type ContestContextState = {
  selectedProblemId: string | null;
  contestId: number | null;
  setSelectedProblem: (problemId: string, contestId: number) => void;
  clearContext: () => void;
};

export const useContestContext = create<ContestContextState>((set) => ({
  selectedProblemId: null,
  contestId: null,
  setSelectedProblem: (problemId: string, contestId: number) => {
    set({ selectedProblemId: problemId, contestId });
  },
  clearContext: () => {
    set({ selectedProblemId: null, contestId: null });
  },
}));
