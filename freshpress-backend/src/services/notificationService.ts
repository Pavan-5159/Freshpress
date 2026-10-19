import { prisma } from '../config/database';

import { NotificationType } from '@prisma/client';

/** Create a notification for a user */
export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system';
  data?: string;
}) {
  const typeMap: Record<string, NotificationType> = {
    order: NotificationType.ORDER_UPDATE,
    promo: NotificationType.PROMOTIONAL,
    system: NotificationType.SYSTEM,
  };

  return prisma.notification.create({ 
    data: {
      userId: data.userId,
      title: data.title,
      body: data.message,
      type: typeMap[data.type] || NotificationType.SYSTEM,
      data: data.data ? JSON.parse(data.data) : undefined,
    } 
  });
}

/** Get notifications for a user */
export async function getUserNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { notifications, total, page, limit };
}

/** Mark a notification as read */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) throw new Error('Notification not found');
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/** Mark all notifications as read for a user */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
