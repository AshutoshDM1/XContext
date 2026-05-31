import { getAiQuestionController } from '@/controllers/ai-question/ai-question.controllers';
import { aiLimiter } from '@/middleware/rateLimiter';
import { Router } from 'express';

const aiQuestionRouter = Router();

aiQuestionRouter.post('/', aiLimiter, getAiQuestionController);

export default aiQuestionRouter;
