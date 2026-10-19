import { prisma } from '../config/database';
import { OrderStatus, ShopStatus } from '@prisma/client';

/**
 * Get the primary shop owned by the vendor (user)
 */
export async function getVendorShop(userId: string) {
  const shop = await prisma.shop.findFirst({
    where: { ownerId: userId },
    include: {
      serviceCategories: {
        include: { services: true }
      }
    }
  });
  
  if (!shop) {
    throw new Error('No shop found for this vendor');
  }
  return shop;
}

/**
 * Fetch orders for a specific shop, optionally filtered by status
 */
export async function getVendorOrders(shopId: string, status?: OrderStatus, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const whereClause: any = { shopId };
  if (status) {
    whereClause.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        address: true,
        user: { select: { name: true, phone: true } }
      },
    }),
    prisma.order.count({ where: whereClause }),
  ]);

  return { orders, total, page, limit };
}

/**
 * Update the status of an order (e.g., ACCEPTED, IN_PROCESS, READY_FOR_DELIVERY)
 */
export async function updateOrderStatus(shopId: string, orderId: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  if (order.shopId !== shopId) {
    throw new Error('Unauthorized: Order does not belong to your shop');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}

/**
 * Toggle the open/closed status of a shop
 */
export async function updateShopStatus(shopId: string, isOpen: boolean) {
  return prisma.shop.update({
    where: { id: shopId },
    data: { isOpen },
  });
}
