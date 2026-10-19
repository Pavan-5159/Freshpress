import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as shopService from '../services/shopService';
import { successResponse, errorResponse } from '../utils/response';

/** GET /api/shops — list all active shops */
export const listShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const city = req.query.city as string | undefined;
    const shops = await shopService.listShops(city);
    successResponse(res, 'Shops fetched', shops);
  } catch (err) {
    next(err);
  }
};

/** GET /api/shops/nearby — get nearby shops */
export const getNearbyShops = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = parseFloat(req.query.radiusKm as string) || 10;
    const category = req.query.category as string | undefined;

    if (isNaN(lat) || isNaN(lng)) {
      errorResponse(res, 'Valid lat and lng are required', 400);
      return;
    }

    const shops = await shopService.getNearbyShops(lat, lng, radiusKm, category);
    successResponse(res, 'Nearby shops fetched', shops);
  } catch (err) {
    next(err);
  }
};

/** GET /api/shops/:id — get a single shop by ID */
export const getShopById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shop = await shopService.getShopById(req.params.id);
    if (!shop) {
      errorResponse(res, 'Shop not found', 404);
      return;
    }
    successResponse(res, 'Shop fetched', shop);
  } catch (err) {
    next(err);
  }
};

/** GET /api/shops/:id/services — get services for a shop */
export const getShopServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const services = await shopService.getShopServices(req.params.id, category);
    successResponse(res, 'Services fetched', services);
  } catch (err) {
    next(err);
  }
};

/** GET /api/banners — get active banners */
export const getBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const position = req.query.position as string | undefined;
    const banners = await shopService.getBanners(position);
    successResponse(res, 'Banners fetched', banners);
  } catch (err) {
    next(err);
  }
};

/** POST /api/shops — Vendor self-registration with geocoding and dedup */
export const createShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, addressLine, category, cityName, state, pincode } = req.body;
    const user = (req as AuthenticatedRequest).user;

    if (!name || !addressLine) {
      errorResponse(res, 'Name and addressLine are required', 400);
      return;
    }

    const result = await shopService.registerVendorShop({
      name, addressLine, category, cityName, state, pincode, ownerId: user.userId
    });

    if (result.duplicateCandidate) {
      // 409 Conflict with the candidate data
      res.status(409).json({
        success: false,
        message: 'A similar shop already exists. Do you want to claim it?',
        data: result.duplicateCandidate
      });
      return;
    }

    successResponse(res, 'Shop created successfully', result.shop, 201);
  } catch (err: any) {
    next(err);
  }
};

/** POST /api/shops/:id/claim — Claim an existing OSM_IMPORT shop */
export const claimShop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const shopId = req.params.id;

    const shop = await shopService.claimShop(shopId, user.userId);
    successResponse(res, 'Shop claimed successfully', shop);
  } catch (err: any) {
    if (err.message === 'Shop not found' || err.message === 'Shop cannot be claimed') {
      errorResponse(res, err.message, 400);
      return;
    }
    next(err);
  }
};
