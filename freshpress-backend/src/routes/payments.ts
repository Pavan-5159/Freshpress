import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';

const router = Router();

router.post('/create-order', paymentController.createPaymentOrder);
router.post('/verify', paymentController.verifyPayment);

export default router;
