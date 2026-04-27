import { getHealthController } from '@/controllers/health/health.controller';
import { Router } from 'express';
import aiQuestionRouter from './ai-question.router';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API v1' });
});

router.get('/health', getHealthController);
router.use('/ai-question', aiQuestionRouter);

export default router;
