import { Router } from 'express';
import { authenticate } from '@/middleware/authentication';
import {
  addInterviewQuestion,
  answerInterviewQuestion,
  createInterview,
  deleteInterview,
  getInterviewById,
  getInterviews,
  updateInterview,
} from '@/controllers/interview/interview.controllers';

const router = Router();

router.use(authenticate);

router.post('/', createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

router.post('/:id/questions', addInterviewQuestion);
router.put('/:id/questions/:questionAnswerId/answer', answerInterviewQuestion);

export default router;
