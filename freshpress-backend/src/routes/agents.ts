import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as agentController from '../controllers/agentController';

const router = Router();

// All agent routes require authentication
router.use(authenticate);

// Get the agent's profile details
router.get('/profile', agentController.getMyProfile);

// Toggle agent online/offline status
router.patch('/status', agentController.updateAgentStatus);

// Get assignments for the agent
router.get('/assignments', agentController.getMyAssignments);

// Update assignment status (e.g. ACCEPTED, PICKED_UP, DELIVERED)
router.patch('/assignments/:id/status', agentController.updateAssignmentStatus);

export default router;
