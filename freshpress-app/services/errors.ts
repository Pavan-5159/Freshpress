/**
 * API Error Types and Custom Error Class
 *
 * @requirements Req 12.4, 12.5, 12.6
 */

/** Known API error codes emitted by our Axios interceptors. */
export type ApiErrorCode = 'SERVER_ERROR' | 'TIMEOUT' | 'NETWORK';

/** Custom error class thrown by the API layer. */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly httpStatus?: number,
    public readonly data?: unknown
  ) {
    super(`API Error [${code}]${httpStatus ? ` (HTTP ${httpStatus})` : ''}`);
    this.name = 'ApiError';
  }
}
