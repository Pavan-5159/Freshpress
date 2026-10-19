import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as couponService from '../services/couponService';
import { successResponse, errorResponse } from '../utils/response';

/** GET /api/v1/coupons — list all active coupons */
export const listActive = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const coupons = await couponService.getActiveCoupons();
    successResponse(res, 'Active coupons fetched successfully', coupons);
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/coupons/validate — validate a coupon against an order amount */
export const validate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { code, orderAmount } = req.body;
    
    if (!code || typeof code !== 'string') {
      errorResponse(res, 'Invalid coupon code', 400);
      return;
    }

    if (orderAmount === undefined || typeof orderAmount !== 'number' || orderAmount < 0) {
      errorResponse(res, 'Invalid order amount', 400);
      return;
    }

    const result = await couponService.validateCoupon(code, orderAmount, req.user.userId);
    successResponse(res, 'Coupon is valid', result);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to validate coupon', 400);
  }
};

/** POST /api/v1/coupons — create a new coupon (Admin only) */
export const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      code, type, value, minOrderAmount, maxDiscount,
      usageLimit, perUserLimit, firstOrderOnly,
      validFrom, validTill, applicableCategoryIds
    } = req.body;

    if (!code || !type || value === undefined || !validFrom || !validTill) {
      errorResponse(res, 'Missing required fields (code, type, value, validFrom, validTill)', 400);
      return;
    }

    const coupon = await couponService.createCoupon({
      code, type, value, minOrderAmount, maxDiscount,
      usageLimit, perUserLimit, firstOrderOnly,
      validFrom: new Date(validFrom),
      validTill: new Date(validTill),
      applicableCategoryIds
    });

    successResponse(res, 'Coupon created successfully', coupon);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to create coupon', 400);
  }
};
