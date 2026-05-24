import type { Request, Response } from 'express';

const getHealthController = (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the XContext API v1' });
};

export { getHealthController };
