import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Profile (protected)
router.patch('/me', authenticate, userController.updateProfile);

export default router;
