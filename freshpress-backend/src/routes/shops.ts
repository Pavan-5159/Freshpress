import { Router } from 'express';
import * as shopController from '../controllers/shopController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', shopController.listShops);
router.post('/', authenticate, authorize('VENDOR', 'ADMIN'), shopController.createShop);
router.get('/nearby', shopController.getNearbyShops);
router.get('/banners', shopController.getBanners);
router.get('/:id', shopController.getShopById);
router.get('/:id/services', shopController.getShopServices);
router.post('/:id/claim', authenticate, authorize('VENDOR', 'ADMIN'), shopController.claimShop);

export default router;
