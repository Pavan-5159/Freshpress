import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(err instanceof ZodError)) {
    console.error('[Error]:', err);
  } else {
    console.error('[Validation Error]:', err.message);
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  // Handle AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Fallback for unhandled errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({ message });
};
