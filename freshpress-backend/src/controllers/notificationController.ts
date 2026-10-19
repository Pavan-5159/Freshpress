import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as notificationService from '../services/notificationService';
import { successResponse, errorResponse } from '../utils/response';

/** GET /api/v1/notifications */
export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const data = await notificationService.getUserNotifications(user.userId, page, limit);
    successResponse(res, 'Notifications fetched', data);
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/v1/notifications/:id/read */
export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const notificationId = req.params.id;

    const notification = await notificationService.markAsRead(notificationId, user.userId);
    successResponse(res, 'Notification marked as read', notification);
  } catch (err: any) {
    if (err.message === 'Notification not found') {
      errorResponse(res, err.message, 404);
      return;
    }
    next(err);
  }
};

/** PATCH /api/v1/notifications/read-all */
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const result = await notificationService.markAllAsRead(user.userId);
    
    successResponse(res, 'All notifications marked as read', result);
  } catch (err) {
    next(err);
  }
};
