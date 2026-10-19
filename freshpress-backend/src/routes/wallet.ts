import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getWallet, topUp } from '../controllers/walletController';

const router = Router();

// Protect all wallet routes
router.use(authenticate);

// Get wallet balance and transactions
router.get('/', getWallet);

// Top up wallet balance
router.post('/topup', topUp);

export default router;
