export type ContestStatus = 'LIVE' | 'ENDED';

export interface Project {
  projectId: string;
  problemMarkdown: string;
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
