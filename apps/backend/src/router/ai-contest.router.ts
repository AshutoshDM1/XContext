import { Router } from 'express';
import { authenticate } from '@/middleware/authentication';
import { aiLimiter } from '@/middleware/rateLimiter';
import {
  createAiContestController,
  getAiContestNextController,
  previewAiContestController,
} from '@/controllers/ai-contest/ai-contest.controllers';

const router = Router();

router.use(authenticate);
router.use(aiLimiter);
router.post('/next', getAiContestNextController);
router.post('/create', createAiContestController);
router.post('/preview', previewAiContestController);

export default router;
