import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as agentService from '../services/agentService';
import { successResponse, errorResponse } from '../utils/response';
import { AssignmentStatus } from '@prisma/client';

/** GET /api/v1/agents/profile */
export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const profile = await agentService.getAgentProfile(user.userId);
    successResponse(res, 'Agent profile fetched', profile);
  } catch (err) {
    next(err);
  }
};

/** GET /api/v1/agents/assignments */
export const getMyAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const status = req.query.status as AssignmentStatus | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const profile = await agentService.getAgentProfile(user.userId);
    const data = await agentService.getAgentAssignments(profile.id, status, page, limit);

    successResponse(res, 'Agent assignments fetched', data);
  } catch (err) {
    next(err);
  }
};

/** PATCH /api/v1/agents/assignments/:id/status */
export const updateAssignmentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const assignmentId = req.params.id;
    const { status, proofPhotoUrl } = req.body;

    if (!status || !Object.values(AssignmentStatus).includes(status)) {
      errorResponse(res, 'Invalid or missing status', 400);
      return;
    }

    const profile = await agentService.getAgentProfile(user.userId);
    const assignment = await agentService.updateAssignmentStatus(profile.id, assignmentId, status as AssignmentStatus, proofPhotoUrl);

    successResponse(res, 'Assignment status updated', assignment);
  } catch (err: any) {
    if (err.message.includes('Unauthorized') || err.message === 'Assignment not found') {
      errorResponse(res, err.message, 403);
      return;
    }
    next(err);
  }
};

/** PATCH /api/v1/agents/status */
export const updateAgentStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;
    const { isOnline } = req.body;

    if (typeof isOnline !== 'boolean') {
      errorResponse(res, 'isOnline must be a boolean', 400);
      return;
    }

    const profile = await agentService.getAgentProfile(user.userId);
    const updatedProfile = await agentService.updateAgentStatus(profile.id, isOnline);

    successResponse(res, 'Agent status updated', updatedProfile);
  } catch (err: any) {
    next(err);
  }
};
