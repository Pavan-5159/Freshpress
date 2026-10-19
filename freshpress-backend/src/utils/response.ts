import { Response } from 'express';
import { ApiResponse } from '../types';

export const successResponse = <T>(res: Response, message: string, data: T, statusCode: number = 200): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

export const errorResponse = (res: Response, message: string, statusCode: number = 400, error?: unknown): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error: error instanceof Error ? error.message : (error as string) || undefined,
  };
  res.status(statusCode).json(response);
};

export const paginatedResponse = <T>(
  res: Response,
  message: string,
  data: T[],
  total: number,
  page: number,
  limit: number
): void => {
  const totalPages = Math.ceil(total / limit);
  const response: ApiResponse<T[]> = {
    success: true,
    message,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
  res.status(200).json(response);
};
