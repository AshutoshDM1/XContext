import { Router } from 'express';
import {
  createCode,
  getCodes,
  getCodeById,
  getCodeByProjectId,
  updateCode,
  updateCodeByProjectId,
  deleteCode,
} from '@/controllers/code/code.controllers';
import { authenticate } from '@/middleware/authentication';

const router = Router();

router.use(authenticate);

router.post('/', createCode);
router.get('/', getCodes);
router.get('/:id', getCodeById);
router.get('/project/:projectId', getCodeByProjectId);
router.put('/:id', updateCode);
router.put('/project/:projectId', updateCodeByProjectId);
router.delete('/:id', deleteCode);

export default router;
