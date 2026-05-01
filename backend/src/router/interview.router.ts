import { Router } from 'express';
import { authenticate } from '@/middleware/authentication';
import {
  addInterviewQuestion,
  answerInterviewQuestion,
  createInterview,
  deleteInterview,
  generateInterviewQuestion,
  getInterviewById,
  getInterviews,
  updateInterview,
} from '@/controllers/interview/interview.controllers';
import {
  generateInterviewRating,
  getInterviewRating,
} from '@/controllers/interviewRating/interviewRating.controllers';

const router = Router();

router.use(authenticate);

router.post('/', createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);

router.post('/:id/generate-question', generateInterviewQuestion);
router.post('/:id/questions', addInterviewQuestion);
router.put('/:id/questions/:questionAnswerId/answer', answerInterviewQuestion);

router.get('/:id/rating', getInterviewRating);
router.post('/:id/rating/generate', generateInterviewRating);

export default router;
