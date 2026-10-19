/**
 * Order Service — create order, list, detail, cancel, Razorpay.
 *
 * @requirements Req 7.1–7.9, 8.1–8.12
 */

import { axiosInstance } from './axiosInstance';
import type { Order, CartItem, Address } from '@/types';

export interface CreateOrderPayload {
  shopId: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  deliveryAddressId: string;
  pickupInstructions: string;
}

export interface RazorpayCreatePayload {
  grandTotalInr: number;
}
export interface RazorpayOrderResponse {
  id: string;
  amount: number; // in paise
  currency: string;
}
export interface RazorpayVerifyPayload {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}
// ─── Order CRUD ──────────────────────────────────────────────────────────────

/** Create a new order after successful payment. */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await axiosInstance.post<Order>('/v1/orders', payload);
  return response.data;
}
/** List the current user's orders. */
export async function getOrders(): Promise<Order[]> {
  const response = await axiosInstance.get<Order[]>('/v1/orders');
  return response.data;
}
/** Fetch a single order by ID. */
export async function getOrderById(id: string): Promise<Order> {
  const response = await axiosInstance.get<Order>(`/v1/orders/${id}`);
  return response.data;
}
/** Cancel an order (PENDING or CONFIRMED only). */
export async function cancelOrder(id: string): Promise<void> {
  await axiosInstance.post(`/v1/orders/${id}/cancel`);
}
// ─── Razorpay Payment ───────────────────────────────────────────────────────────

/** Create a Razorpay order for the given amount. */
export async function createRazorpayOrder(
  grandTotalInr: number
): Promise<RazorpayOrderResponse> {
  const response = await axiosInstance.post<RazorpayOrderResponse>(
    '/v1/payments/create-order',
    { grandTotalInr });
  return response.data;
}
/** Verify Razorpay payment after checkout succeeds. */
export async function verifyPayment(
  payload: RazorpayVerifyPayload
): Promise<void> {
  await axiosInstance.post('/v1/payments/verify', payload);
}





