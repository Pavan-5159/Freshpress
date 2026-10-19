import { prisma } from '../config/database';
import { CouponType } from '@prisma/client';

export interface CreateCouponData {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  firstOrderOnly?: boolean;
  applicableCategoryIds?: string[];
  validFrom: Date;
  validTill: Date;
}

/** Get all currently active coupons */
export async function getActiveCoupons() {
  const now = new Date();
  return prisma.coupon.findMany({
    where: {
      isActive: true,
      validFrom: { lte: now },
      validTill: { gte: now }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/** Validate a coupon code and calculate discount */
export async function validateCoupon(code: string, orderAmount: number, userId: string) {
  const now = new Date();
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!coupon) {
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isActive || coupon.validFrom > now || coupon.validTill < now) {
    throw new Error('Coupon is expired or inactive');
  }

  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    throw new Error(`Minimum order amount of ₹${coupon.minOrderAmount} required`);
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('Coupon usage limit reached');
  }

  // Check per-user limit
  if (coupon.perUserLimit) {
    const userUsageCount = await prisma.order.count({
      where: {
        userId,
        couponId: coupon.id
      }
    });

    if (userUsageCount >= coupon.perUserLimit) {
      throw new Error(`You have already used this coupon ${coupon.perUserLimit} time(s)`);
    }
  }

  // Check first order only
  if (coupon.firstOrderOnly) {
    const userOrderCount = await prisma.order.count({
      where: { userId }
    });

    if (userOrderCount > 0) {
      throw new Error('This coupon is only valid for your first order');
    }
  }

  // Calculate discount
  let discountAmount = 0;
  const value = Number(coupon.value);
  
  if (coupon.type === 'FLAT') {
    discountAmount = value;
  } else if (coupon.type === 'PERCENTAGE') {
    discountAmount = (orderAmount * value) / 100;
  }

  // Apply max discount cap if percentage
  if (coupon.type === 'PERCENTAGE' && coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
    discountAmount = Number(coupon.maxDiscount);
  }

  // Ensure discount doesn't exceed order amount
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discountAmount,
    finalAmount: orderAmount - discountAmount
  };
}

/** Create a new coupon (Admin only) */
export async function createCoupon(data: CreateCouponData) {
  const existing = await prisma.coupon.findUnique({
    where: { code: data.code.toUpperCase() }
  });

  if (existing) {
    throw new Error('Coupon code already exists');
  }

  return prisma.coupon.create({
    data: {
      ...data,
      code: data.code.toUpperCase()
    }
  });
}
