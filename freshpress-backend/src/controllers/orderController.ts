import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as orderService from '../services/orderService';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

/** POST /api/orders — create a new order */
export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const order = await orderService.createOrder({
      userId: req.user.userId,
      ...req.body,
    });
    successResponse(res, 'Order created successfully', order, 201);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders — list user's orders */
export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const result = await orderService.getUserOrders(req.user.userId, page, limit);
    paginatedResponse(res, 'Orders fetched', result.orders, result.total, page, limit);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/:id — get a single order by ID */
export const getOrderById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const order = await orderService.getOrderById(req.params.id, req.user.userId);
    successResponse(res, 'Order fetched', order);
  } catch (err) {
    next(err);
  }
};

/** POST /api/orders/:id/cancel — cancel a pending order */
export const cancelOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const order = await orderService.cancelOrder(req.params.id, req.user.userId);
    successResponse(res, 'Order cancelled', order);
  } catch (err) {
    next(err);
  }
};

/** GET /api/orders/all — admin: list all orders */
export const getAllOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const status = (req.query.status as string) || undefined;
    const result = await orderService.getAllOrders(page, limit, status);
    paginatedResponse(res, 'All orders fetched', result.orders, result.total, page, limit);
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/orders/:id/status — admin: update order status */
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> =>
  {
  try {
    const { status, description } = req.body;
    if (!status) {
      errorResponse(res, 'Status is required', 400);
      return;
    }
    const order = await orderService.updateOrderStatus(req.params.id, status, description);
    successResponse(res, 'Order status updated', order);
  } catch (err) {
    next(err);
  }
};
