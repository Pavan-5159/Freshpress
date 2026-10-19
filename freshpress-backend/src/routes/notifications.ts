import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', notificationController.getMyNotifications);

// Mark a specific notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
