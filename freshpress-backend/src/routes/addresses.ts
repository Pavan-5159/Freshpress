import { Router } from 'express';
import * as addressController from '../controllers/addressController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, addressController.getAddresses);
router.post('/', authenticate, addressController.createAddress);
router.get('/:id', authenticate, addressController.getAddressById);
router.put('/:id', authenticate, addressController.updateAddress);
router.delete('/:id', authenticate, addressController.deleteAddress);

export default router;
