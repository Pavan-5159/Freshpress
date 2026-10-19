import { prisma } from '../config/database';
import { SubscriptionStatus } from '@prisma/client';

/**
 * Start a new subscription plan for a user
 */
export async function createSubscription(userId: string, planName: string, itemsLimit: number, validityDays: number) {
  const validFrom = new Date();
  const validTill = new Date();
  validTill.setDate(validTill.getDate() + validityDays);

  return prisma.subscription.create({
    data: {
      userId,
      planName,
      itemsLimit,
      validFrom,
      validTill,
      status: SubscriptionStatus.ACTIVE,
    }
  });
}

/**
 * Fetch subscriptions for a user
 */
export async function getMySubscriptions(userId: string, status?: SubscriptionStatus) {
  const whereClause: any = { userId };
  if (status) {
    whereClause.status = status;
  }

  return prisma.subscription.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get the active subscription for a user (if any)
 */
export async function getActiveSubscription(userId: string) {
  const now = new Date();
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      validFrom: { lte: now },
      validTill: { gte: now },
    },
    orderBy: { validTill: 'desc' }
  });
}
