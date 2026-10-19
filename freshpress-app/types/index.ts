/**
 * FreshPress Customer App — Data Models
 *
 * Central type definitions for all domain entities.
 * These interfaces are used across stores, services, and UI components.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Represents an authenticated customer.
 * @requirements Req 1.4 — User profile data returned on successful OTP verification
 */
export interface User {
  id: string;
  phone: string;           // 10-digit, stored without country code
  name: string;            // max 50 characters
  profilePhotoUrl: string | null;
  fcmToken: string | null;
  createdAt: string;       // ISO 8601
}

// ─── Shop ────────────────────────────────────────────────────────────────────

/**
 * Represents a laundry/pressing shop returned by the API.
 * @requirements Req 2.4 — Shop card data fields; Req 3.3 — Shop detail fields
 */
export interface Shop {
  id: string;
  name: string;
  coverPhotoUrl: string;
  address: string;
  latitude: number;
  longitude: number;
  distanceKm: number;      // rounded to 1 decimal, computed by API
  serviceTypes: string[];  // e.g. ['Wash & Fold', 'Dry Clean']
  averageRating: number;   // 1.0–5.0
  reviewCount: number;
  turnaroundHours: number;
  operatingHours: {
    open: string;          // HH:mm
    close: string;         // HH:mm
  };
  isOpen: boolean;
}

// ─── Service Items ────────────────────────────────────────────────────────────

/**
 * A single menu item offered by a shop.
 * @requirements Req 4.1 — Service item list fields; Req 4.2 — Price display
 */
export interface ServiceItem {
  id: string;
  shopId: string;
  category: string;        // e.g. 'Shirts', 'Pants'
  name: string;
  description: string;     // max 150 characters
  priceInr: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

/**
 * A single item in the customer's cart.
 * @requirements Req 5.1 — Cart item structure; Req 5.4 — Line total calculation;
 *               Req 5.5 — Quantity constraints (1–99)
 */
export interface CartItem {
  serviceItem: ServiceItem;
  quantity: number;        // 1–99
  lineTotal: number;       // serviceItem.priceInr * quantity
}

/**
 * The customer's current cart state.
 * @requirements Req 5.1 — Cart belongs to one shop; Req 5.2 — Cart summary;
 *               Req 5.3 — Tax calculation; Req 5.4 — Grand total;
 *               Req 5.5 — Pickup instructions
 */
export interface Cart {
  shopId: string | null;
  shopName: string | null;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;       // subtotal * TAX_RATE
  grandTotal: number;      // subtotal + taxAmount
  pickupInstructions: string; // max 200 characters
  deliveryAddressId: string | null;
}

// ─── Address ──────────────────────────────────────────────────────────────────

/**
 * A saved delivery address for a customer.
 * @requirements Req 6.1 — Saved address fields and default address management
 */
export interface Address {
  id: string;
  customerId: string;
  label: string;           // 'Home' | 'Work' | custom (max 50 chars)
  formattedAddress: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// ─── Order ────────────────────────────────────────────────────────────────────

/**
 * All possible statuses an order can be in, from placement to delivery.
 * @requirements Req 8.2 — Order status values displayed in timeline
 */
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'IN_PROGRESS'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

/**
 * Represents a placed order, including items, payment, status, and delivery details.
 * @requirements Req 7.1 — Order creation payload; Req 8.2 — Order detail display
 */
export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  shopName: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: OrderStatus;
  statusTimestamps: Partial<Record<OrderStatus, string>>;
  paymentMethod: 'UPI' | 'CARD' | 'WALLET';
  razorpayOrderId: string;
  deliveryAddress: Address;
  pickupInstructions: string;
  turnaroundMinutes: number;
  createdAt: string;
  ratingSubmitted: boolean;
}

// ─── Ratings & Reviews ────────────────────────────────────────────────────────

/**
 * A star rating submitted by a customer for a completed order.
 * @requirements Req 10.1 — Rating submission (1–5 stars)
 */
export interface Rating {
  id: string;
  orderId: string;
  customerId: string;
  shopId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

/**
 * A full review (stars + text + photos) left by a customer for a shop.
 * @requirements Req 10.1 — Review display; Req 10.2 — Review text and photo submission
 */
export interface Review {
  id: string;
  ratingId: string;
  customerId: string;
  customerName: string;
  shopId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  text: string;            // max 500 characters
  photoUrls: string[];     // max 3
  createdAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * The set of order lifecycle events that can trigger push notifications.
 * @requirements Req 9.6 — Per-event notification preference toggles
 */
export type NotificationEventType =
  | 'ORDER_CONFIRMED'
  | 'ORDER_PICKED_UP'
  | 'ORDER_READY'
  | 'OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED';

/**
 * Stores the customer's opt-in/opt-out state for each notification event type.
 * @requirements Req 9.6 — Per-event notification preferences (true = enabled)
 */
export interface NotificationPreferences {
  customerId: string;
  preferences: Record<NotificationEventType, boolean>; // true = enabled
}

// ─── Banners ──────────────────────────────────────────────────────────────────

/**
 * A promotional banner displayed in the Home Feed carousel.
 * @requirements Req 2.5 — Banner carousel with optional deep-link tap destination
 */
export interface Banner {
  id: string;
  imageUrl: string;
  deepLinkUrl?: string;    // optional tap destination
}
