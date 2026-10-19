import { prisma } from '../config/database';
import { OrderStatus, PaymentMethod, PaymentStatus, PaymentGateway } from '@prisma/client';

export interface OrderItemInput {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderData {
  userId: string;
  addressId: string;
  shopId: string;
  items: OrderItemInput[];
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
}

/** Generate a unique order number */
function generateOrderNumber(): string {
  const prefix = 'FP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/** Create a new order with items and total calculation */
export async function createOrder(data: CreateOrderData) {
  if (!data.items || data.items.length === 0) {
    throw new Error('Order must contain at least one item');
  }

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const orderNumber = generateOrderNumber();
  const tax = 0;
  const deliveryFee = 0;
  const total = subtotal + tax + deliveryFee;

  const address = await prisma.address.findUnique({ where: { id: data.addressId } });
  if (!address) throw new Error('Address not found');

  const addressSnapshot = {
    street: address.street,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    lat: address.lat,
    lng: address.lng,
  };

  let gateway: PaymentGateway = PaymentGateway.RAZORPAY;
  if (data.paymentMethod === PaymentMethod.CASH) gateway = PaymentGateway.CASH;
  if (data.paymentMethod === PaymentMethod.WALLET) gateway = PaymentGateway.WALLET;

  return prisma.order.create({
    data: {
      userId: data.userId,
      addressId: data.addressId,
      shopId: data.shopId,
      orderNumber,
      subtotal,
      tax,
      deliveryFee,
      total,
      status: OrderStatus.PENDING,
      specialInstructions: data.notes,
      pickupAddressSnapshot: addressSnapshot,
      deliveryAddressSnapshot: addressSnapshot,
      items: {
        create: data.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        })),
      },
      payments: {
        create: {
          amount: total,
          method: data.paymentMethod,
          status: PaymentStatus.PENDING,
          gateway,
        }
      }
    },
    include: {
      items: true,
      address: true,
    },
  });
}

/** Get all orders for a user with pagination */
export async function getUserOrders(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        address: true,
      },
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return { orders, total, page, limit };
}

/** Get a single order by ID, ensuring ownership */
export async function getOrderById(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      address: true,
      assignments: { orderBy: { createdAt: 'desc' } }, // Replaced tracking with assignments
    },
  });

  if (!order) throw new Error('Order not found');
  if (order.userId !== userId) throw new Error('Unauthorized');

  return order;
}

/** Update order status (admin only) */
export async function updateOrderStatus(orderId: string, status: OrderStatus, description?: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return order;
}

/** Cancel a pending order */
export async function cancelOrder(orderId: string, userId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Order not found');
  if (order.userId !== userId) throw new Error('Unauthorized');
  if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.ACCEPTED) {
    throw new Error('Order cannot be cancelled at this stage');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
  });
}

/** Get all orders (admin) */
export async function getAllOrders(page = 1, limit = 20, status?: string) {
  const skip = (page - 1) * limit;
  const where = status ? { status: status as OrderStatus } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        address: true,
        user: { select: { id: true, name: true, phone: true, email: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, limit };
}
