import { prisma } from '../config/database';
import { OrderStatus } from '@prisma/client';

export interface SubmitReviewData {
  userId: string;
  orderId: string;
  vendorRating?: number;
  agentRating?: number;
  serviceRating?: number;
  overallRating: number;
  comment?: string;
  images?: string[];
}

/**
 * Submit a review for a completed order
 */
export async function submitReview(data: SubmitReviewData) {
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: { review: true }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.userId !== data.userId) {
    throw new Error('Unauthorized: You can only review your own orders');
  }

  if (order.status !== OrderStatus.DELIVERED) {
    throw new Error('You can only review delivered orders');
  }

  if (order.review) {
    throw new Error('A review has already been submitted for this order');
  }

  const review = await prisma.review.create({
    data: {
      orderId: data.orderId,
      userId: data.userId,
      overallRating: data.overallRating,
      vendorRating: data.vendorRating,
      agentRating: data.agentRating,
      serviceRating: data.serviceRating,
      comment: data.comment,
      images: data.images || [],
    }
  });

  // If a shop was attached to this order, we might want to update its average rating.
  // We'll calculate the new average rating for the shop async.
  if (order.shopId) {
    updateShopAverageRating(order.shopId).catch(console.error);
  }

  return review;
}

/**
 * Fetch reviews for a specific shop
 */
export async function getShopReviews(shopId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        order: {
          shopId: shopId
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    }),
    prisma.review.count({
      where: {
        order: { shopId: shopId }
      }
    })
  ]);

  return { reviews, total, page, limit };
}

/**
 * Helper to update the shop's average rating
 */
async function updateShopAverageRating(shopId: string) {
  const agg = await prisma.review.aggregate({
    where: { order: { shopId } },
    _avg: { overallRating: true },
    _count: { id: true }
  });

  const averageRating = agg._avg.overallRating || 0;
  
  await prisma.shop.update({
    where: { id: shopId },
    data: { ratingAvg: averageRating }
  });
}
