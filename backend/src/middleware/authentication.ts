import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/utils/auth';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    admin: boolean;
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

    (req as AuthenticatedRequest).user = session.user as unknown as AuthenticatedRequest['user'];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid session' });
  }
};

/**
 * Best-effort session loading.
 * - If session exists, attaches req.user.
 * - If not, continues without failing.
 * Use for routes that are public but can behave differently for signed-in users.
 */
export const optionalAuthenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user) {
      (req as AuthenticatedRequest).user = session.user as unknown as AuthenticatedRequest['user'];
    }
  } catch {
    /* ignore */
  }
  next();
};
