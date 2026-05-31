import { Router } from 'express';
import {
  createContest,
  getContests,
  getContestById,
  updateContest,
  deleteContest,
  getPublicContests,
  joinContest,
  getContestLeaderboard,
} from '@/controllers/contest/contest.controllers';
import { authenticate, optionalAuthenticate } from '@/middleware/authentication';
import {
  cacheMiddleware,
  CACHE_KEYS,
  getPrivateContestsKey,
  getSingleContestCacheKey,
} from '@/middleware/cache';

const router = Router();

// Public routes
router.get('/public', cacheMiddleware(CACHE_KEYS.publicContests, { ttl: 600 }), getPublicContests);
router.get(
  '/:id',
  optionalAuthenticate,
  cacheMiddleware(getSingleContestCacheKey, { ttl: 300 }),
  getContestById,
);
router.post('/:id/join', optionalAuthenticate, joinContest);
router.get('/:id/leaderboard', optionalAuthenticate, getContestLeaderboard);

// Private routes
router.use(authenticate);
router.post('/', createContest);
router.get(
  '/',
  cacheMiddleware((req) => getPrivateContestsKey((req as any).user.id), { ttl: 300 }),
  getContests,
);
router.put('/:id', updateContest);
router.delete('/:id', deleteContest);

export default router;
