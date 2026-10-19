import { Router } from 'express';
import * as cartController from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, cartController.getCart);
router.post('/', authenticate, cartController.addToCart);
router.put('/:id', authenticate, cartController.updateQuantity);
router.delete('/:id', authenticate, cartController.removeFromCart);
router.delete('/', authenticate, cartController.clearCart);

export default router;
