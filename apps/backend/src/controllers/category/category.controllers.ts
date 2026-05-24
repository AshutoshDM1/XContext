import type { Request, Response } from 'express';
import db from '@/utils/db';
import { category } from '@/db/schema';
import asyncHandler from '@/utils/asyncHandler';
import type { AuthenticatedRequest } from '@/middleware/authentication';
import { createCategorySchema, slugify } from './validation';

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await db.query.category.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
  });
  res.json(rows);
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  if (!user?.isAdmin) {
    res.status(403).json({ message: 'Only admins can create categories' });
    return;
  }

  const validated = createCategorySchema.parse(req.body);
  const slug = validated.slug ?? slugify(validated.name);

  if (!slug) {
    res.status(400).json({ message: 'Invalid category name' });
    return;
  }

  const existing = await db.query.category.findFirst({
    where: (c, { eq }) => eq(c.slug, slug),
  });

  if (existing) {
    res.status(409).json({ message: 'Category already exists' });
    return;
  }

  const [created] = await db
    .insert(category)
    .values({
      name: validated.name.trim(),
      slug,
    })
    .returning();

  res.status(201).json(created);
});
