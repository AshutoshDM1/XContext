import type { Request, Response } from 'express';

const asyncHandler = (fn: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error(error as Error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export default asyncHandler;
