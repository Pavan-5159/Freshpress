import { axiosInstance } from './axiosInstance';

export interface Coupon {
  id: string;
  code: string;
  type: 'FLAT' | 'PERCENTAGE';
  value: string;
  minOrderAmount: string | null;
  validTill: string;
}

export interface CouponValidationResult {
  couponId: string;
  code: string;
  type: string;
  discountAmount: number;
  finalAmount: number;
}

export const getActiveCoupons = async (): Promise<Coupon[]> => {
  const response = await axiosInstance.get('/v1/coupons');
  return response.data.data;
};

export const validateCoupon = async (code: string, orderAmount: number): Promise<CouponValidationResult> => {
  const response = await axiosInstance.post('/v1/coupons/validate', { code, orderAmount });
  return response.data.data;
};
