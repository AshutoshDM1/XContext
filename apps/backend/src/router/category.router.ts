import { Router } from 'express';
import { createCategory, listCategories } from '@/controllers/category/category.controllers';
import { authenticate } from '@/middleware/authentication';
import { cacheMiddleware, CACHE_KEYS } from '@/middleware/cache';

const router = Router();

router.get('/', cacheMiddleware(CACHE_KEYS.categories, { ttl: 3600 }), listCategories);
router.post('/', authenticate, createCategory);

export default router;
