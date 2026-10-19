import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as cartService from '../services/cartService';
import { successResponse, errorResponse } from '../utils/response';

/** GET /api/cart — list cart items */
export const getCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const items = await cartService.getCartItems(req.user.userId);
    successResponse(res, 'Cart fetched', items);
  } catch (err) {
    next(err);
  }
};

/** POST /api/cart — add item to cart */
export const addToCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const { serviceId, shopId, quantity = 1 } = req.body;
    if (!serviceId || !shopId) {
      errorResponse(res, 'serviceId and shopId are required', 400);
      return;
    }
    const item = await cartService.addToCart({
      userId: req.user.userId,
      serviceId,
      shopId,
      quantity: parseInt(quantity, 10) || 1,
    });
    successResponse(res, 'Item added to cart', item, 201);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/cart/:id — update cart item quantity */
export const updateQuantity = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const { quantity } = req.body;
    const item = await cartService.updateCartQuantity({
      userId: req.user.userId,
      cartItemId: req.params.id,
      quantity: parseInt(quantity, 10) || 0,
    });
    successResponse(res, 'Cart updated', item);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/cart/:id — remove item from cart */
export const removeFromCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const item = await cartService.removeFromCart(req.params.id, req.user.userId);
    successResponse(res, 'Item removed from cart', item);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/cart — clear cart */
export const clearCart = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    await cartService.clearCart(req.user.userId);
    successResponse(res, 'Cart cleared', null);
  } catch (err) {
    next(err);
  }
};
