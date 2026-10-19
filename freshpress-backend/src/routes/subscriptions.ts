import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as subscriptionController from '../controllers/subscriptionController';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

// Purchase a new subscription
router.post('/', subscriptionController.purchaseSubscription);

// Get all subscriptions for the user
router.get('/', subscriptionController.getMySubscriptions);

// Get the user's active subscription
router.get('/active', subscriptionController.getActiveSubscription);

export default router;
