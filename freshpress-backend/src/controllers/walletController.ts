import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as walletService from '../services/walletService';
import { successResponse, errorResponse } from '../utils/response';

/** GET /api/v1/wallet — fetch wallet and transactions */
export const getWallet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const wallet = await walletService.getWallet(req.user.userId);
    successResponse(res, 'Wallet fetched successfully', wallet);
  } catch (error) {
    next(error);
  }
};

/** POST /api/v1/wallet/topup — add funds to wallet */
export const topUp = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }

    const { amount } = req.body;
    if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
      errorResponse(res, 'Invalid amount. Must be a positive number.', 400);
      return;
    }

    const wallet = await walletService.topUpWallet(req.user.userId, amount);
    successResponse(res, 'Wallet topped up successfully', wallet);
  } catch (error: any) {
    errorResponse(res, error.message || 'Failed to top up wallet', 400);
  }
};
