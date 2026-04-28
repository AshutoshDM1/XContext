import { create } from 'zustand';
import { MOCK_LIVE_CONTESTS, MOCK_YOUR_CONTESTS } from '@/data/mock-contests';

export type ContestStatus = 'LIVE' | 'ENDED';

export interface Project {
  projectId: string;
  problemMarkdown: string;
}

export interface Contest {
  id: string;
  title: string;
  shortDescription: string;
  topbarDescription: string;
  status: ContestStatus;
  participantCount: number;
  timeLabel: string;
  projects: Project[]; // min 1, max 3
}

interface ContestStore {
  yourContests: Contest[];
  liveContests: Contest[];
  setYourContests: (contests: Contest[]) => void;
  setLiveContests: (contests: Contest[]) => void;
  addYourContest: (contest: Contest) => void;
  addLiveContest: (contest: Contest) => void;
  removeYourContest: (contestId: string) => void;
  removeLiveContest: (contestId: string) => void;
  getContestById: (contestId: string) => Contest | undefined;
}

export const useContestStore = create<ContestStore>((set, get) => ({
  yourContests: MOCK_YOUR_CONTESTS,
  liveContests: MOCK_LIVE_CONTESTS,

  setYourContests: (contests) => set({ yourContests: contests }),

  setLiveContests: (contests) => set({ liveContests: contests }),

  addYourContest: (contest) =>
    set((state) => ({
      yourContests: [...state.yourContests, contest],
    })),

  addLiveContest: (contest) =>
    set((state) => ({
      liveContests: [...state.liveContests, contest],
    })),

  removeYourContest: (contestId) =>
    set((state) => ({
      yourContests: state.yourContests.filter((c) => c.id !== contestId),
    })),

  removeLiveContest: (contestId) =>
    set((state) => ({
      liveContests: state.liveContests.filter((c) => c.id !== contestId),
    })),

  getContestById: (contestId) => {
    const state = get();
    return (
      state.yourContests.find((c) => c.id === contestId) ||
      state.liveContests.find((c) => c.id === contestId)
    );
  },
}));
