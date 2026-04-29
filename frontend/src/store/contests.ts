export type ContestStatus = 'LIVE' | 'ENDED';

export interface Project {
  id?: number;
  projectId: string;
  problemMarkdown: string;
  contestId?: number;
}

export interface Contest {
  id: number;
  userId: string;
  title: string;
  shortDescription: string;
  topbarDescription?: string;
  status: ContestStatus;
  participantCount: number;
  timeLabel: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}
