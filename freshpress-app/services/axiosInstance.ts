/**
 * Axios Instance with Auth Interceptors
 *
 * Handles request/response lifecycle, auth token injection,
 * 401 → logout, server errors, and request timeouts.
 *
 * @requirements Req 12.4, 12.5, 12.6
 */

import axios from 'axios';
import { ApiError } from './errors';
import { useAuthStore } from '@/store/authStore';
import { API_BASE_URL, API_TIMEOUT_MS } from '@/constants/config';

// ─── Instance ─────────────────────────────────────────────────────────────────

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Request was cancelled or timed out
    if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') {
      return Promise.reject(new ApiError('TIMEOUT'));
    }

    const response = error.response;

    if (response) {
      // 401 Unauthorized → force logout
      if (response.status === 401) {
        useAuthStore.getState().logout().catch(() => {
          // Ignore logout errors; proceed to redirect
        });
        return Promise.reject(new ApiError('NETWORK', 401, response.data));
      }

      // 5xx Server errors
      if (response.status >= 500) {
        return Promise.reject(
          new ApiError('SERVER_ERROR', response.status, response.data)
        );
      }
    }

    // Network errors (no response received)
    if (!response) {
      return Promise.reject(new ApiError('NETWORK'));
    }

    // Pass through other errors as-is for caller handling
    return Promise.reject(error);
  }
);
