import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import addressRoutes from './addresses';
import orderRoutes from './orders';
import shopRoutes from './shops';
import cartRoutes from './cart';
import paymentRoutes from './payments';
import homeRoutes from './home';
import walletRoutes from './wallet';
import couponRoutes from './coupon';
import vendorRoutes from './vendors';
import agentRoutes from './agents';
import subscriptionRoutes from './subscriptions';
import reviewRoutes from './reviews';
import notificationRoutes from './notifications';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get("/test", (_req, res) => {
    res.json({ message: "API router is working" });
});

router.use(apiLimiter);

router.use('/v1/auth', authRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/addresses', addressRoutes);
router.use('/v1/orders', orderRoutes);
router.use('/v1/shops', shopRoutes);
router.use('/v1/cart', cartRoutes);
router.use('/v1/payments', paymentRoutes);
router.use('/v1/home', homeRoutes);
router.use('/v1/wallet', walletRoutes);
router.use('/v1/coupons', couponRoutes);
router.use('/v1/vendors', vendorRoutes);
router.use('/v1/agents', agentRoutes);
router.use('/v1/subscriptions', subscriptionRoutes);
router.use('/v1/reviews', reviewRoutes);
router.use('/v1/notifications', notificationRoutes);

export default router;