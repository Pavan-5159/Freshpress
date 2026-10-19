// ─── Order ──────────────────────────────────────────────────────────
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_WASH = 'IN_WASH',
  IN_IRON = 'IN_IRON',
  IN_DRY_CLEAN = 'IN_DRY_CLEAN',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// ─── Payment ────────────────────────────────────────────────────────
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// ─── Delivery ───────────────────────────────────────────────────────
export enum DeliveryType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  SAME_DAY = 'SAME_DAY',
}

// ─── Default pagination ─────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
