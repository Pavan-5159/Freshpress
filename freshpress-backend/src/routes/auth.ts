import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/send-otp', authLimiter, authController.sendOtp);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/email', authLimiter, authController.loginWithEmail);
router.post('/social', authLimiter, authController.loginWithSocial);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;