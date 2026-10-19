/**
 * App-wide constants and environment variable exports.
 *
 * Requirements: 1.2, 2.2, 3.2, 5.4, 7.2, 12.6
 */

// ─── Tax / Pricing ────────────────────────────────────────────────────────────

/** Tax rate applied to the cart subtotal (5%). Req 5.4 */
export const TAX_RATE = 0.05;

// ─── Search ───────────────────────────────────────────────────────────────────

/** Debounce delay (ms) before firing a search query. Req 3.2 */
export const SEARCH_DEBOUNCE_MS = 300;

/** Maximum number of recent searches persisted to AsyncStorage. Req 3.5 */
export const MAX_RECENT_SEARCHES = 5;

// ─── OTP / Auth ───────────────────────────────────────────────────────────────

/** Cooldown in seconds before the "Resend OTP" action is re-enabled. Req 1.13 */
export const OTP_RESEND_COOLDOWN_S = 30;

/** OTP validity window in minutes. Req 1.6 */
export const OTP_EXPIRY_MINUTES = 5;

// ─── Address ──────────────────────────────────────────────────────────────────

/** Maximum number of saved delivery addresses per customer. Req 6.1 */
export const MAX_ADDRESSES = 5;

// ─── UI / Animation ───────────────────────────────────────────────────────────

/** Auto-scroll interval for the banner carousel (ms). Req 2.5 */
export const BANNER_AUTOSCROLL_MS = 4000;

/** Number of skeleton placeholder cards shown during shop list loading. Req 2.9 */
export const SKELETON_COUNT = 4;

// ─── Network ──────────────────────────────────────────────────────────────────

/** Request timeout for all API calls (ms). Req 12.6 */
export const API_TIMEOUT_MS = 10_000;

// ─── Environment Variables ────────────────────────────────────────────────────

/**
 * Base URL for the API Gateway.
 * Populated from EXPO_PUBLIC_API_BASE_URL in the environment.
 * Req 12.6
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

/**
 * WebSocket server URL used by socket.io-client.
 * Populated from EXPO_PUBLIC_WS_URL in the environment.
 * Req 8.3, 8.8
 */
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? '';

/**
 * Razorpay publishable key ID used when opening the checkout sheet.
 * Populated from EXPO_PUBLIC_RAZORPAY_KEY_ID in the environment.
 * Req 7.2
 */
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '';
