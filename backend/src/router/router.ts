import { getHelloController } from '@/controllers/router.controller';
import { Router } from 'express';

const router = Router();

router.get('/', getHelloController);

export default router;
