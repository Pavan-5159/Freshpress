import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as vendorService from '../services/vendorService';
import { successResponse, errorResponse } from '../utils/response';
import { OrderStatus } from '@prisma/client';

/** GET /api/v1/vendors/shop */
export const getMyShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const shop = await vendorService.getVendorShop(user.userId);
    successResponse(res, 'Vendor shop fetched', shop);
  } catch (err: any) {
    if (err.message === 'No shop found for this vendor') {
      errorResponse(res, err.message, 404);
      return;
    }
    next(err);
  }
};

/** GET /api/v1/vendors/orders */
export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const status = req.query.status as OrderStatus | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const shop = await vendorService.getVendorShop(user.userId);
    const data = await vendorService.getVendorOrders(shop.id, status, page, limit);

    successResponse(res, 'Vendor orders fetched', data);
  } catch (err: any) {
    if (err.message === 'No shop found for this vendor') {
      errorResponse(res, err.message, 404);
      return;
    }
    next(err);
  }
};

/** PATCH /api/v1/vendors/orders/:id/status */
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status || !Object.values(OrderStatus).includes(status)) {
      errorResponse(res, 'Invalid or missing status', 400);
      return;
    }

    const shop = await vendorService.getVendorShop(user.userId);
    const order = await vendorService.updateOrderStatus(shop.id, orderId, status as OrderStatus);

    successResponse(res, 'Order status updated', order);
  } catch (err: any) {
    if (err.message.includes('Unauthorized') || err.message === 'Order not found') {
      errorResponse(res, err.message, 403);
      return;
    }
    next(err);
  }
};

/** PATCH /api/v1/vendors/shop/status */
export const updateShopStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { isOpen } = req.body;

    if (typeof isOpen !== 'boolean') {
      errorResponse(res, 'isOpen must be a boolean', 400);
      return;
    }

    const shop = await vendorService.getVendorShop(user.userId);
    const updatedShop = await vendorService.updateShopStatus(shop.id, isOpen);

    successResponse(res, 'Shop status updated', updatedShop);
  } catch (err: any) {
    if (err.message === 'No shop found for this vendor') {
      errorResponse(res, err.message, 404);
      return;
    }
    next(err);
  }
};
