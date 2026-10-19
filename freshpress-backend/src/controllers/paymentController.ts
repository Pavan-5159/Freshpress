import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as paymentService from '../services/paymentService';
import { successResponse, errorResponse } from '../utils/response';

/** POST /api/payments/create-order — create a Razorpay order */
export const createPaymentOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, currency, receipt } = req.body;
    if (!amount || isNaN(parseFloat(amount))) {
      errorResponse(res, 'Valid amount is required', 400);
      return;
    }
    const order = await paymentService.createPaymentOrder({
      amount: parseFloat(amount),
      currency,
      receipt,
    });
    successResponse(res, 'Payment order created', order);
  } catch (err) {
    next(err);
  }
};

/** POST /api/payments/verify — verify Razorpay payment */
export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      errorResponse(res, 'All payment fields are required', 400);
      return;
    }
    const result = await paymentService.verifyPayment({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    successResponse(res, 'Payment verified', result);
  } catch (err) {
    next(err);
  }
};
