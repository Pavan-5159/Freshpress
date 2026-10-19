/**
 * Auth Service
 */

import { axiosInstance } from './axiosInstance';
import type { User } from '@/types';

export interface OtpRequestPayload {
  phone: string;
}

export interface OtpVerifyPayload {
  phone: string;
  otp: string;
}

export interface OtpVerifyResponse {
  user: User;
  token: string;
}

// Request OTP
export async function requestOtp(
  payload: OtpRequestPayload
): Promise<void> {
  await axiosInstance.post('/v1/auth/send-otp', payload);
}

// Verify OTP
export async function verifyOtp(
  payload: OtpVerifyPayload
): Promise<OtpVerifyResponse> {
  const response = await axiosInstance.post(
    '/v1/auth/verify-otp',
    payload
  );

  return {
    token: response.data.tokens?.accessToken || response.data.token,
    user: response.data.user,
  };
}

// Get Logged-in User Profile
export async function getProfile(): Promise<User> {
  const response = await axiosInstance.get('/v1/auth/me');
  return response.data.data;
}

export async function loginWithEmail(email: string, password?: string): Promise<OtpVerifyResponse> {
  const response = await axiosInstance.post('/v1/auth/email', { email, password });
  return {
    token: response.data.tokens?.accessToken || response.data.token,
    user: response.data.user,
  };
}

export async function loginWithSocial(provider: string, token: string): Promise<OtpVerifyResponse> {
  const response = await axiosInstance.post('/v1/auth/social', { provider, token });
  return {
    token: response.data.tokens?.accessToken || response.data.token,
    user: response.data.user,
  };
}
