import { Router } from 'express';
import { authenticate } from '@/middleware/authentication';
import {
  createCodeSubmission,
  getCodeSubmissions,
} from '@/controllers/codeSubmission/codeSubmission.controllers';

const router = Router();

router.use(authenticate);

router.post('/', createCodeSubmission);
router.get('/', getCodeSubmissions);

export default router;
