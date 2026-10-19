import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as userService from '../services/userService';
import { errorResponse, successResponse } from '../utils/response';

/** PATCH /api/users/me — update current user profile */
export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const { name, email, avatar } = req.body;
    const user = await userService.updateProfile(req.user.userId, { name, email, avatar });
    successResponse(res, 'Profile updated', user);
  } catch (err) {
    next(err);
  }
};
