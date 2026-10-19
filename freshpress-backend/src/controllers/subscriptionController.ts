import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as subscriptionService from '../services/subscriptionService';
import { successResponse, errorResponse } from '../utils/response';
import { SubscriptionStatus } from '@prisma/client';

/** POST /api/v1/subscriptions */
export const purchaseSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { planName, itemsLimit, validityDays } = req.body;

    if (!planName || !itemsLimit || !validityDays) {
      errorResponse(res, 'Missing required fields: planName, itemsLimit, validityDays', 400);
      return;
    }

    const subscription = await subscriptionService.createSubscription(user.userId, planName, itemsLimit, validityDays);
    successResponse(res, 'Subscription purchased successfully', subscription, 201);
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/subscriptions */
export const getMySubscriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const status = req.query.status as SubscriptionStatus | undefined;

    const subscriptions = await subscriptionService.getMySubscriptions(user.userId, status);
    successResponse(res, 'Subscriptions fetched', subscriptions);
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/subscriptions/active */
export const getActiveSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const subscription = await subscriptionService.getActiveSubscription(user.userId);
    
    if (!subscription) {
      errorResponse(res, 'No active subscription found', 404);
      return;
    }

    successResponse(res, 'Active subscription fetched', subscription);
  } catch (err) {
    next(err);
  }
};
