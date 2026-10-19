import { z } from 'zod';

// ─── User ─────────────────────────────────────────────────────────────
export const registerUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(6).max(100),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[0-9]{10}$/).optional(),
});

// ─── Address ────────────────────────────────────────────────────────
export const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
  landmark: z.string().max(255).optional(),
  isDefault: z.boolean().optional(),
});

// ─── Order Item ─────────────────────────────────────────────────────
export const orderItemSchema = z.object({
  serviceId: z.string().cuid(),
  quantity: z.number().int().positive().default(1),
  specialInstructions: z.string().max(500).optional(),
});

// ─── Order ──────────────────────────────────────────────────────────
export const createOrderSchema = z.object({
  addressId: z.string().cuid(),
  items: z.array(orderItemSchema).min(1, 'At least one item required'),
  deliveryType: z.enum(['STANDARD', 'EXPRESS', 'SAME_DAY']).default('STANDARD'),
  scheduledPickupDate: z.coerce.date().optional(),
  specialInstructions: z.string().max(1000).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PICKUP_SCHEDULED',
    'PICKED_UP',
    'IN_WASH',
    'IN_IRON',
    'IN_DRY_CLEAN',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
});

// ─── Pagination ─────────────────────────────────────────────────────
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
