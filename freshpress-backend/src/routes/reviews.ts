import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as reviewController from '../controllers/reviewController';

const router = Router();

// Get reviews for a specific shop (public)
router.get('/shop/:shopId', reviewController.getShopReviews);

// Submit a new review (requires authentication)
router.post('/', authenticate, reviewController.submitReview);

export default router;
