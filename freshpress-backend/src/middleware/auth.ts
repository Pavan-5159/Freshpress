import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    (req as AuthenticatedRequest).user = payload;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(user.role as Role)) {
      return res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
    }

    next();
  };
};
