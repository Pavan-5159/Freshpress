import { prisma } from '../config/database';
import { AssignmentStatus, OrderStatus, VehicleType } from '@prisma/client';

/**
 * Get or create the agent profile for the user
 */
export async function getAgentProfile(userId: string) {
  let profile = await prisma.agentProfile.findUnique({
    where: { userId },
    include: {
      serviceZone: true,
    }
  });

  if (!profile) {
    profile = await prisma.agentProfile.create({
      data: {
        userId,
        // Using a default generic vehicle if none provided
        vehicleType: VehicleType.BIKE, 
      },
      include: { serviceZone: true }
    });
  }

  return profile;
}

/**
 * Fetch assignments (pickup or delivery) for the agent, optionally filtered by status
 */
export async function getAgentAssignments(agentId: string, status?: AssignmentStatus, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const whereClause: any = { agentId };
  if (status) {
    whereClause.status = status;
  }

  const [assignments, total] = await Promise.all([
    prisma.orderAssignment.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            address: true,
            user: { select: { name: true, phone: true } },
            shop: { select: { name: true, addressLine: true, phone: true } }
          }
        }
      },
    }),
    prisma.orderAssignment.count({ where: whereClause }),
  ]);

  return { assignments, total, page, limit };
}

/**
 * Update the status of an assignment and sync with order status where applicable
 */
export async function updateAssignmentStatus(
  agentId: string, 
  assignmentId: string, 
  status: AssignmentStatus,
  proofPhotoUrl?: string
) {
  const assignment = await prisma.orderAssignment.findUnique({
    where: { id: assignmentId },
    include: { order: true }
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.agentId !== agentId) {
    throw new Error('Unauthorized: Assignment does not belong to you');
  }

  const updateData: any = { status };
  if (proofPhotoUrl) updateData.proofPhotoUrl = proofPhotoUrl;

  // Record timestamps based on status
  if (status === AssignmentStatus.ACCEPTED) updateData.acceptedAt = new Date();
  if (status === AssignmentStatus.COMPLETED) {
    if (assignment.type === 'PICKUP') updateData.pickedAt = new Date();
    if (assignment.type === 'DELIVERY') updateData.deliveredAt = new Date();
  }

  const updatedAssignment = await prisma.orderAssignment.update({
    where: { id: assignmentId },
    data: updateData,
  });

  // Sync with order status if it's completed
  if (status === AssignmentStatus.COMPLETED) {
    let orderStatus: OrderStatus;
    if (assignment.type === 'PICKUP') {
      orderStatus = OrderStatus.PICKED_UP;
    } else {
      orderStatus = OrderStatus.DELIVERED;
    }

    await prisma.order.update({
      where: { id: assignment.orderId },
      data: { status: orderStatus }
    });
  }

  return updatedAssignment;
}

/**
 * Toggle whether the agent is currently online/available for assignments
 */
export async function updateAgentStatus(agentId: string, isOnline: boolean) {
  return prisma.agentProfile.update({
    where: { id: agentId },
    data: { isOnline },
  });
}
