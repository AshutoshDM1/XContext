import type { Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import db from '@/utils/db';
import { code, project } from '@/db/schema';
import { createCodeSchema, updateCodeSchema } from './validation';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';

function canAccessProjectForUser(
  contestData: { userId: string; isPublic: boolean; isPrivate: boolean },
  userId: string,
): boolean {
  return contestData.isPublic || !contestData.isPrivate || contestData.userId === userId;
}

export const createCode = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const validated = createCodeSchema.parse(req.body);

  const projectExists = await db.query.project.findFirst({
    where: eq(project.id, validated.projectId),
    with: {
      contest: true,
    },
  });

  if (
    !projectExists ||
    !canAccessProjectForUser(
      {
        userId: projectExists.contest.userId,
        isPublic: Boolean((projectExists.contest as any).isPublic),
        isPrivate: Boolean((projectExists.contest as any).isPrivate),
      },
      userId,
    )
  ) {
    res.status(404).json({ message: 'Project not found or unauthorized' });
    return;
  }

  const existingCode = await db.query.code.findFirst({
    where: and(eq(code.projectId, validated.projectId), eq(code.userId, userId)),
  });

  if (existingCode) {
    res.status(409).json({ message: 'Code already exists for this project' });
    return;
  }

  const [newCode] = await db
    .insert(code)
    .values({
      userId,
      projectId: validated.projectId,
      code: validated.code,
    })
    .returning();

  res.status(201).json(newCode);
});

export const getCodes = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const codes = await db.query.code.findMany({
    where: eq(code.userId, userId),
    with: {
      project: {
        with: {
          contest: true,
        },
      },
    },
    orderBy: (code, { desc }) => [desc(code.updatedAt)],
  });

  res.json(codes);
});

export const getCodeById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const codeId = Number(req.params.id);

  const codeData = await db.query.code.findFirst({
    where: and(eq(code.id, codeId), eq(code.userId, userId)),
    with: {
      project: {
        with: {
          contest: true,
        },
      },
    },
  });

  if (!codeData) {
    res.status(404).json({ message: 'Code not found' });
    return;
  }

  res.json(codeData);
});

export const getCodeByProjectId = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const projectId = Number(req.params.projectId);

  const projectExists = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: {
      contest: true,
    },
  });

  if (
    !projectExists ||
    !canAccessProjectForUser(
      {
        userId: projectExists.contest.userId,
        isPublic: Boolean((projectExists.contest as any).isPublic),
        isPrivate: Boolean((projectExists.contest as any).isPrivate),
      },
      userId,
    )
  ) {
    res.status(404).json({ message: 'Project not found or unauthorized' });
    return;
  }

  const codeData = await db.query.code.findFirst({
    where: and(eq(code.projectId, projectId), eq(code.userId, userId)),
    with: {
      project: {
        with: {
          contest: true,
        },
      },
    },
  });

  if (!codeData) {
    res.status(404).json({ message: 'Code not found for this project' });
    return;
  }

  res.json(codeData);
});

export const updateCode = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const codeId = Number(req.params.id);
  const validated = updateCodeSchema.parse(req.body);

  const existingCode = await db.query.code.findFirst({
    where: and(eq(code.id, codeId), eq(code.userId, userId)),
  });

  if (!existingCode) {
    res.status(404).json({ message: 'Code not found or unauthorized' });
    return;
  }

  const [updated] = await db.update(code).set(validated).where(eq(code.id, codeId)).returning();

  if (!updated) {
    res.status(404).json({ message: 'Code not found' });
    return;
  }

  res.json(updated);
});

export const updateCodeByProjectId = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const projectId = Number(req.params.projectId);
  const validated = updateCodeSchema.parse(req.body);

  const projectExists = await db.query.project.findFirst({
    where: eq(project.id, projectId),
    with: {
      contest: true,
    },
  });

  if (
    !projectExists ||
    !canAccessProjectForUser(
      {
        userId: projectExists.contest.userId,
        isPublic: Boolean((projectExists.contest as any).isPublic),
        isPrivate: Boolean((projectExists.contest as any).isPrivate),
      },
      userId,
    )
  ) {
    res.status(404).json({ message: 'Project not found or unauthorized' });
    return;
  }

  const existingCode = await db.query.code.findFirst({
    where: and(eq(code.projectId, projectId), eq(code.userId, userId)),
  });

  if (!existingCode) {
    res.status(404).json({ message: 'Code not found for this project' });
    return;
  }

  const [updated] = await db
    .update(code)
    .set(validated)
    .where(eq(code.id, existingCode.id))
    .returning();

  if (!updated) {
    res.status(404).json({ message: 'Code not found' });
    return;
  }

  res.json(updated);
});

export const deleteCode = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const codeId = Number(req.params.id);

  const existingCode = await db.query.code.findFirst({
    where: and(eq(code.id, codeId), eq(code.userId, userId)),
  });

  if (!existingCode) {
    res.status(404).json({ message: 'Code not found or unauthorized' });
    return;
  }

  const [deleted] = await db.delete(code).where(eq(code.id, codeId)).returning();

  if (!deleted) {
    res.status(404).json({ message: 'Code not found' });
    return;
  }

  res.json({ message: 'Code deleted successfully' });
});
