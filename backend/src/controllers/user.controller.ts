import { usersTable } from '@/db/schema';
import db from '@/utils/db';
import type { Request, Response } from 'express';

const getUsersController = async (req: Request, res: Response) => {
  try {
    const users = await db.select().from(usersTable);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export { getUsersController };
