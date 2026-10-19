import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as vendorController from '../controllers/vendorController';

const router = Router();

// All vendor routes require authentication
router.use(authenticate);

// Get the vendor's own shop details
router.get('/shop', vendorController.getMyShop);

// Toggle shop open/closed status
router.patch('/shop/status', vendorController.updateShopStatus);

// Get orders assigned to the vendor's shop
router.get('/orders', vendorController.getMyOrders);

// Update order status (e.g. ACCEPTED, IN_PROCESS)
router.patch('/orders/:id/status', vendorController.updateOrderStatus);

export default router;
