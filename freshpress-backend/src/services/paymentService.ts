import { prisma } from '../config/database';

export interface CreatePaymentOrderData {
  amount: number;
  currency?: string;
  receipt?: string;
}

export interface VerifyPaymentData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

/** Create a Razorpay order (placeholder — integrate Razorpay SDK in production) */
export async function createPaymentOrder(data: CreatePaymentOrderData) {
  // TODO: Integrate with Razorpay SDK:
  // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
  // const order = await razorpay.orders.create({ amount: data.amount * 100, currency: data.currency || 'INR', receipt: data.receipt });
  // return order;
  console.warn('[PAYMENT_SERVICE] Using stubbed createPaymentOrder. Razorpay not integrated.');

  return {
    id: `order_${Date.now()}`,
    amount: data.amount * 100,
    currency: data.currency || 'INR',
    status: 'created',
  };
}

/** Verify Razorpay payment (placeholder) */
export async function verifyPayment(data: VerifyPaymentData) {
  // TODO: Implement Razorpay signature verification
  // const crypto = require('crypto');
  // const body = data.razorpayOrderId + '|' + data.razorpayPaymentId;
  // const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(body).digest('hex');
  // if (expected !== data.razorpaySignature) throw new Error('Invalid signature');
  console.warn('[PAYMENT_SERVICE] Using stubbed verifyPayment. Razorpay not integrated.');

  return {
    verified: false, // Default to false for safety until integrated
    razorpayOrderId: data.razorpayOrderId,
    razorpayPaymentId: data.razorpayPaymentId,
  };
}
