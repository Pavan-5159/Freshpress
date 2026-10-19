import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listActive, validate, create } from '../controllers/couponController';

const router = Router();

// Protect all coupon routes
router.use(authenticate);

// Get active coupons
router.get('/', listActive);

// Validate a coupon against an order amount
router.post('/validate', validate);

// Create a new coupon (Admin only)
router.post('/', authorize('ADMIN'), create);

export default router;
