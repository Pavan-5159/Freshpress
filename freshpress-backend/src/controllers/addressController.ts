import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as addressService from '../services/addressService';
import { successResponse, errorResponse } from '../utils/response';

/** GET /api/addresses — list all addresses for the user */
export const getAddresses = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const addresses = await addressService.getUserAddresses(req.user.userId);
    successResponse(res, 'Addresses fetched', addresses);
  } catch (err) {
    next(err);
  }
};

/** POST /api/addresses — create a new address */
export const createAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const address = await addressService.createAddress({
      userId: req.user.userId,
      ...req.body,
    });
    successResponse(res, 'Address created', address, 201);
  } catch (err) {
    next(err);
  }
};

/** GET /api/addresses/:id — get a single address */
export const getAddressById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const address = await addressService.getAddressById(req.params.id, req.user.userId);
    successResponse(res, 'Address fetched', address);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/addresses/:id — update an address */
export const updateAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const address = await addressService.updateAddress(req.params.id, req.user.userId, req.body);
    successResponse(res, 'Address updated', address);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/addresses/:id — delete an address */
export const deleteAddress = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Unauthorized', 401);
      return;
    }
    const address = await addressService.deleteAddress(req.params.id, req.user.userId);
    successResponse(res, 'Address deleted', address);
  } catch (err) {
    next(err);
  }
};
