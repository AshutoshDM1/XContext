import { Router } from 'express';
import {
  createContest,
  getContests,
  getContestById,
  updateContest,
  deleteContest,
  getPublicContests,
  joinContest,
} from '@/controllers/contest/contest.controllers';
import { authenticate, optionalAuthenticate } from '@/middleware/authentication';

const router = Router();

// Public routes
router.get('/public', getPublicContests);
router.get('/:id', optionalAuthenticate, getContestById);
router.post('/:id/join', optionalAuthenticate, joinContest);

// Private routes
router.use(authenticate);
router.post('/', createContest);
router.get('/', getContests);
router.put('/:id', updateContest);
router.delete('/:id', deleteContest);

export default router;
