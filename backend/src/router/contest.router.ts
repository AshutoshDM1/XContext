import { Router } from 'express';
import {
  createContest,
  getContests,
  getContestById,
  updateContest,
  deleteContest,
} from '@/controllers/contest/contest.controllers';
import { authenticate } from '@/middleware/authentication';

const router = Router();

router.use(authenticate);

router.post('/', createContest);
router.get('/', getContests);
router.get('/:id', getContestById);
router.put('/:id', updateContest);
router.delete('/:id', deleteContest);

export default router;
