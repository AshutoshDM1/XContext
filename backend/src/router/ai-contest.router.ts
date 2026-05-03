import { Router } from 'express';
import { authenticate } from '@/middleware/authentication';
import {
  createAiContestController,
  getAiContestNextController,
} from '@/controllers/ai-contest/ai-contest.controllers';

const router = Router();

router.use(authenticate);
router.post('/next', getAiContestNextController);
router.post('/create', createAiContestController);

export default router;
