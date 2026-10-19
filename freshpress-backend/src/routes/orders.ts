import { Router } from 'express';
import * as orderController from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, orderController.getMyOrders);
router.post('/', authenticate, orderController.createOrder);
router.get('/all', authenticate, authorize(Role.ADMIN), orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);
router.patch('/:id/status', authenticate, authorize(Role.ADMIN), orderController.updateOrderStatus);

export default router;
