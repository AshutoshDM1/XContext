import { Router } from 'express';
import { createCategory, listCategories } from '@/controllers/category/category.controllers';
import { authenticate } from '@/middleware/authentication';

const router = Router();

router.get('/', listCategories);
router.post('/', authenticate, createCategory);

export default router;
