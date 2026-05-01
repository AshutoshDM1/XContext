import { getHealthController } from '@/controllers/health/health.controller';
import { Router } from 'express';
import aiQuestionRouter from './ai-question.router';
import contestRouter from './contest.router';
import problemRouter from './problem.router';
import codeRouter from './code.router';
import codeSubmissionRouter from './codeSubmission.router';
import interviewRouter from './interview.router';
import categoryRouter from './category.router';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the XContext API v1' });
});

router.get('/health', getHealthController);
router.use('/ai-question', aiQuestionRouter);
router.use('/contests', contestRouter);
router.use('/categories', categoryRouter);
router.use('/problems', problemRouter);
router.use('/code', codeRouter);
router.use('/code-submissions', codeSubmissionRouter);
router.use('/interviews', interviewRouter);

export default router;
