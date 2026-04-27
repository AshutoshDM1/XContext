import { getAiQuestionController } from '@/controllers/ai-question/ai-question.controllers';
import { Router } from 'express';

const aiQuestionRouter = Router();

aiQuestionRouter.post('/', getAiQuestionController);

export default aiQuestionRouter;
