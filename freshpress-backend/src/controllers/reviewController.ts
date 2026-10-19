import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as reviewService from '../services/reviewService';
import { successResponse, errorResponse } from '../utils/response';

/** POST /api/v1/reviews */
export const submitReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { orderId, overallRating, vendorRating, agentRating, serviceRating, comment, images } = req.body;

    if (!orderId || overallRating === undefined) {
      errorResponse(res, 'Missing required fields: orderId, overallRating', 400);
      return;
    }

    const review = await reviewService.submitReview({
      userId: user.userId,
      orderId,
      overallRating,
      vendorRating,
      agentRating,
      serviceRating,
      comment,
      images,
    });

    successResponse(res, 'Review submitted successfully', review, 201);
  } catch (err: any) {
    if (err.message.includes('Unauthorized') || err.message.includes('already been submitted') || err.message.includes('only review delivered')) {
      errorResponse(res, err.message, 400);
      return;
    }
    if (err.message === 'Order not found') {
      errorResponse(res, err.message, 404);
      return;
    }
    next(err);
  }
};

/** GET /api/v1/reviews/shop/:shopId */
export const getShopReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shopId = req.params.shopId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await reviewService.getShopReviews(shopId, page, limit);
    successResponse(res, 'Shop reviews fetched', data);
  } catch (err) {
    next(err);
  }
};
