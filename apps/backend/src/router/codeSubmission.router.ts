import { Router } from 'express';
import { authenticate } from '@/middleware/authentication';
import { submissionLimiter } from '@/middleware/rateLimiter';
import {
  createCodeSubmission,
  getCodeSubmissions,
} from '@/controllers/codeSubmission/codeSubmission.controllers';

const router = Router();

router.use(authenticate);

router.post('/', submissionLimiter, createCodeSubmission);
router.get('/', getCodeSubmissions);

export default router;
