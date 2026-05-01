export type ContestStatus = 'LIVE' | 'ENDED';

export interface Project {
  id?: number;
  projectId: string;
  problemMarkdown: string;
  contestId?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ContestCategory {
  contestId: number;
  categoryId: number;
  category: Category;
}

export interface Contest {
  id: number;
  userId: string;
  title: string;
  shortDescription: string;
  topbarDescription?: string;
  isPrivate: boolean;
  isPublic: boolean;
  status: ContestStatus;
  participantCount: number;
  timeLabel: string;
  startsAt?: string | null;
  endsAt?: string | null;
  projects: Project[];
  contestCategories?: ContestCategory[];
  createdAt: string;
  updatedAt: string;
}
