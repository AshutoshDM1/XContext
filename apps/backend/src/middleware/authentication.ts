import type { Request, Response, NextFunction } from 'express';
import { auth } from '@/utils/auth';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
    [key: string]: any;
  };
}

function normalizeUser(user: any): AuthenticatedRequest['user'] {
  const isAdmin = Boolean(user?.isAdmin ?? user?.admin ?? false);
  return {
    ...user,
    isAdmin,
    // keep legacy key for older call sites (if any)
    admin: isAdmin,
  };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session || !session.user) {
      res.status(401).json({ message: 'Unauthorized: No valid session' });
      return;
    }

    (req as AuthenticatedRequest).user = normalizeUser(session.user);
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
      (req as AuthenticatedRequest).user = normalizeUser(session.user);
    }
  } catch {
    /* ignore */
  }
  next();
};
