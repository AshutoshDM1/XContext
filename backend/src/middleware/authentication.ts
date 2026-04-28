import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/utils/auth';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    [key: string]: any;
  };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user) {
      res.status(401).json({ message: 'Unauthorized: No valid session' });
      return;
    }

    (req as AuthenticatedRequest).user = session.user as any;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid session' });
  }
};
