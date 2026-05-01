import type { Request, Response } from 'express';
import { and, eq, inArray, sql } from 'drizzle-orm';
import db from '@/utils/db';
import {
  category,
  contest,
  contestCategory,
  interview,
  interviewRating,
  project,
} from '@/db/schema';
import { user } from '@/db/auth-schema';
import { createContestSchema, updateContestSchema } from './validation';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';

function canReadContestForUser(
  contestData: { userId: string; isPublic: boolean; isPrivate: boolean },
  user?: Partial<AuthenticatedRequest>['user'],
) {
  if (contestData.isPublic) return true;
  if (!contestData.isPrivate) return true;
  if (!user) return false;
  return contestData.userId === user.id || Boolean((user as any).isAdmin);
}

function isWithinLiveWindow(contestData: {
  status: string;
  startsAt?: Date | null;
  endsAt?: Date | null;
}) {
  if (contestData.status !== 'LIVE') return false;
  const now = Date.now();
  const s = contestData.startsAt ? contestData.startsAt.getTime() : null;
  const e = contestData.endsAt ? contestData.endsAt.getTime() : null;
  if (s && now < s) return false;
  if (e && now > e) return false;
  return true;
}

export const createContest = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId, isAdmin } = (req as AuthenticatedRequest).user;
  const validated = createContestSchema.parse(req.body);

  const {
    projects,
    categoryIds,
    isPublic: requestedIsPublic,
    isPrivate: _requestedIsPrivate,
    ...contestData
  } = validated;

  if (requestedIsPublic && !isAdmin) {
    res.status(403).json({ message: 'Only admins can create public contests' });
    return;
  }

  const startsAt = contestData.startsAt ? new Date(contestData.startsAt) : undefined;
  const endsAt = contestData.endsAt ? new Date(contestData.endsAt) : undefined;
  const timeLabel = contestData.timeLabel ?? (startsAt || endsAt ? 'Scheduled' : 'Always open');

  const [newContest] = await db
    .insert(contest)
    .values({
      userId,
      ...contestData,
      startsAt,
      endsAt,
      timeLabel,
      topbarDescription: contestData.topbarDescription || contestData.shortDescription,
      isPrivate: true,
      isPublic: isAdmin ? Boolean(requestedIsPublic) : false,
    })
    .returning();

  if (!newContest) {
    res.status(500).json({ message: 'Failed to create contest' });
    return;
  }

  if (categoryIds && categoryIds.length > 0) {
    const uniqueIds = Array.from(new Set(categoryIds)).slice(0, 3);
    const existing = await db
      .select({ id: category.id })
      .from(category)
      .where(inArray(category.id, uniqueIds));

    if (existing.length !== uniqueIds.length) {
      res.status(400).json({ message: 'One or more categories do not exist' });
      return;
    }

    await db.insert(contestCategory).values(
      uniqueIds.map((categoryId) => ({
        contestId: newContest.id,
        categoryId,
      })),
    );
  }

  if (projects && projects.length > 0) {
    await db.insert(project).values(
      projects.map((p) => ({
        projectId: p.projectId,
        problemMarkdown: p.problemMarkdown,
        contestId: newContest.id,
      })),
    );
  }

  const contestWithProjects = await db.query.contest.findFirst({
    where: eq(contest.id, newContest.id),
    with: {
      projects: true,
      contestCategories: {
        with: {
          category: true,
        },
      },
    },
  });

  res.status(201).json(contestWithProjects);
});

export const getContests = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const contests = await db.query.contest.findMany({
    where: eq(contest.userId, userId),
    with: {
      projects: true,
      contestCategories: {
        with: {
          category: true,
        },
      },
    },
    orderBy: (contest, { desc }) => [desc(contest.createdAt)],
  });

  res.json(contests);
});

export const getPublicContests = asyncHandler(async (_req: Request, res: Response) => {
  const contests = await db.query.contest.findMany({
    where: eq(contest.isPublic, true),
    with: {
      projects: true,
      contestCategories: {
        with: {
          category: true,
        },
      },
    },
    orderBy: (contest, { desc }) => [desc(contest.createdAt)],
  });

  res.json(contests);
});

export const getContestById = asyncHandler(async (req: Request, res: Response) => {
  const contestId = Number(req.params.id);
  const contestData = await db.query.contest.findFirst({
    where: (c, { eq }) => eq(c.id, contestId),
    with: {
      projects: true,
      contestCategories: {
        with: {
          category: true,
        },
      },
    },
  });

  if (!contestData) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  // Public contests are readable by everyone.
  if (contestData.isPublic) {
    res.json(contestData);
    return;
  }

  // Shared (non-private) contests are accessible via direct link.
  if (!contestData.isPrivate) {
    res.json(contestData);
    return;
  }

  // Private contests require auth and ownership (or admin).
  const user = (req as Partial<AuthenticatedRequest>).user;
  const userId = user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  if (contestData.userId !== userId && !user?.isAdmin) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  res.json(contestData);
});

export const joinContest = asyncHandler(async (req: Request, res: Response) => {
  const contestId = Number(req.params.id);
  if (!Number.isFinite(contestId)) {
    res.status(400).json({ message: 'Invalid contest id' });
    return;
  }

  const contestRow = await db.query.contest.findFirst({
    where: (c, { eq }) => eq(c.id, contestId),
  });

  if (!contestRow) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  const user = (req as Partial<AuthenticatedRequest>).user;
  if (
    !canReadContestForUser(
      {
        userId: contestRow.userId,
        isPublic: Boolean((contestRow as any).isPublic),
        isPrivate: Boolean((contestRow as any).isPrivate),
      },
      user,
    )
  ) {
    // Avoid leaking existence for private contests.
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  if (
    !isWithinLiveWindow({
      status: String((contestRow as any).status),
      startsAt: (contestRow as any).startsAt ?? null,
      endsAt: (contestRow as any).endsAt ?? null,
    })
  ) {
    res.status(403).json({ message: 'Contest is not live' });
    return;
  }

  const [updated] = await db
    .update(contest)
    .set({ participantCount: sql`${contest.participantCount} + 1` })
    .where(eq(contest.id, contestId))
    .returning();

  res.json({ participantCount: updated?.participantCount ?? (contestRow as any).participantCount });
});

export const getContestLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const contestId = Number(req.params.id);
  if (!Number.isFinite(contestId)) {
    res.status(400).json({ message: 'Invalid contest id' });
    return;
  }

  const contestRow = await db.query.contest.findFirst({
    where: (c, { eq }) => eq(c.id, contestId),
  });

  if (!contestRow) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  const viewer = (req as Partial<AuthenticatedRequest>).user;
  if (
    !canReadContestForUser(
      {
        userId: contestRow.userId,
        isPublic: Boolean((contestRow as any).isPublic),
        isPrivate: Boolean((contestRow as any).isPrivate),
      },
      viewer,
    )
  ) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  // Latest interview score per user (only COMPLETED ratings).
  // Postgres DISTINCT ON picks the latest interview per user for this contest.
  const rows = await db.execute(sql`
    with latest as (
      select distinct on (r.user_id)
        r.user_id as "userId",
        u.name as "name",
        u.email as "email",
        u.image as "image",
        r.score as "score",
        r.time_taken_ms as "timeTakenMs",
        r.time_left_ms as "timeLeftMs",
        i.completed_at as "completedAt",
        i.id as "interviewId"
      from ${interviewRating} r
      join ${interview} i on i.id = r.interview_id
      join ${user} u on u.id = r.user_id
      where r.contest_id = ${contestId}
        and r.status = 'COMPLETED'
      order by r.user_id, i.completed_at desc nulls last, r.updated_at desc
    )
    select *
    from latest
    order by "score" desc nulls last, "timeTakenMs" asc nulls last, "completedAt" desc nulls last
    limit 200;
  `);

  res.json({
    contestId,
    contestTitle: (contestRow as any).title,
    entries: rows.rows,
  });
});

export const updateContest = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId, isAdmin } = (req as AuthenticatedRequest).user;
  const contestId = Number(req.params.id);
  const validated = updateContestSchema.parse(req.body);

  const existingContest = await db.query.contest.findFirst({
    where: (c, { eq, and }) => and(eq(c.id, contestId), eq(c.userId, userId)),
  });

  if (!existingContest) {
    res.status(404).json({ message: 'Contest not found or unauthorized' });
    return;
  }

  const { projects, categoryIds, ...contestData } = validated;

  if ('isPublic' in contestData && !isAdmin) {
    res.status(403).json({ message: 'Only admins can change public visibility' });
    return;
  }

  if (contestData.isPublic === true) {
    contestData.isPrivate = false;
  }
  if (contestData.isPrivate === true) {
    contestData.isPublic = false;
  }

  // Convert ISO strings to Date for DB.
  const startsAt = contestData.startsAt ? new Date(contestData.startsAt) : undefined;
  const endsAt = contestData.endsAt ? new Date(contestData.endsAt) : undefined;

  const updateData: Record<string, unknown> = {
    ...contestData,
    ...(contestData.startsAt !== undefined ? { startsAt } : {}),
    ...(contestData.endsAt !== undefined ? { endsAt } : {}),
  };

  if (Object.keys(contestData).length > 0) {
    await db
      .update(contest)
      .set(updateData as any)
      .where(eq(contest.id, contestId));
  }

  if (categoryIds) {
    const uniqueIds = Array.from(new Set(categoryIds)).slice(0, 3);
    if (uniqueIds.length > 0) {
      const existing = await db
        .select({ id: category.id })
        .from(category)
        .where(inArray(category.id, uniqueIds));

      if (existing.length !== uniqueIds.length) {
        res.status(400).json({ message: 'One or more categories do not exist' });
        return;
      }
    }

    await db.delete(contestCategory).where(eq(contestCategory.contestId, contestId));
    if (uniqueIds.length > 0) {
      await db.insert(contestCategory).values(
        uniqueIds.map((categoryId) => ({
          contestId,
          categoryId,
        })),
      );
    }
  }

  if (projects) {
    await db.delete(project).where(eq(project.contestId, contestId));

    if (projects.length > 0) {
      await db.insert(project).values(
        projects.map((p) => ({
          projectId: p.projectId,
          problemMarkdown: p.problemMarkdown,
          contestId,
        })),
      );
    }
  }

  const updated = await db.query.contest.findFirst({
    where: eq(contest.id, contestId),
    with: {
      projects: true,
      contestCategories: {
        with: {
          category: true,
        },
      },
    },
  });

  res.json(updated);
});

export const deleteContest = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId, isAdmin } = (req as AuthenticatedRequest).user;
  const contestId = Number(req.params.id);

  const existing = await db.query.contest.findFirst({
    where: eq(contest.id, contestId),
  });

  if (!existing) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }
  if (existing.userId !== userId && !isAdmin) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  const [deleted] = await db.delete(contest).where(eq(contest.id, contestId)).returning();

  if (!deleted) {
    res.status(404).json({ message: 'Contest not found' });
    return;
  }

  res.json({ message: 'Contest deleted successfully' });
});
