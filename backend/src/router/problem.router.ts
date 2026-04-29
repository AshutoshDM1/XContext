import { Router } from 'express';
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from '@/controllers/problem/problem.controllers';
import { authenticate } from '@/middleware/authentication';

const router = Router();

router.use(authenticate);

router.post('/', createProblem);
router.get('/', getProblems);
router.get('/:id', getProblemById);
router.put('/:id', updateProblem);
router.delete('/:id', deleteProblem);

export default router;
