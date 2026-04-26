import { getHealthController } from '@/controllers/health.controller';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API v1' });
});

router.get('/health', getHealthController);

export default router;
