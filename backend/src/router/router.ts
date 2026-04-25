import { getHealthController } from '@/controllers/health.controller';
import { getUsersController } from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API v1' });
});

router.get('/health', getHealthController);
router.get('/users', getUsersController);

export default router;
