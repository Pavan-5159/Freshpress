# Design Document: FreshPress Customer App

## Overview

FreshPress is a React Native (Expo Router) mobile application that connects customers with local laundry and cloth-pressing shops. The app is architecturally modelled on food-delivery platforms (Zomato-style): customers discover nearby shops, browse service menus, build a cart, pay via Razorpay, and track orders in real time over WebSocket.

The reference implementation (`zomato_clone-master`) is a React/Vite web app that demonstrates the multi-tab shop detail pattern (Overview / Order Online / Reviews / Photos / Menu), a hero header with shop metadata, and a category-grouped item list with Add/quantity controls. FreshPress adapts these conventions to the React Native + Expo Router paradigm.

### Key Technology Decisions

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React Native + Expo SDK 51 | Managed workflow simplifies builds; Expo Router gives file-based routing |
| Routing | Expo Router v3 (file-based) | Familiar Next.js-style DX; supports layouts and dynamic segments |
| State — client | Zustand | Minimal boilerplate; supports middleware (persist); easy testing |
| State — server | TanStack Query v5 | Caching, background refetch, retry, paginated queries out of box |
| HTTP client | Axios | Interceptor support for auth + 401 redirect; configurable timeout |
| Real-time | socket.io-client | Matches backend; namespaced events; built-in reconnection support |
| Payments | react-native-razorpay | Official community wrapper; supports UPI, card, wallets |
| Push | expo-notifications + @react-native-firebase/messaging | Expo for permission/foreground; FCM for token registration |
| Maps | react-native-maps | Mature library; supports marker animation for delivery tracking |
| Auth storage | expo-secure-store | Encrypted on-device storage for JWT |
| Local cache | @react-native-async-storage/async-storage | Cart persistence, recent searches, address cache |
| Forms | react-hook-form + zod | Lightweight validation; good RN support |
| Images | expo-image-picker | Managed API for camera roll; file size validation |
| Location | expo-location | Geocoding + GPS permission handling |
| Connectivity | @react-native-community/netinfo | Reliable network state for offline banner |


---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                 FreshPress App                  │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │          Expo Router (file-based)        │    │
│  │  Root _layout.tsx  (auth guard + FCM)   │    │
│  │  ┌───────────┐   ┌───────────────────┐  │    │
│  │  │ (auth)    │   │ (tabs) + overlays  │  │    │
│  │  │ /index    │   │ Home/Search/Orders │  │    │
│  │  │ /otp      │   │ Profile + Shop +   │  │    │
│  │  └───────────┘   │ Cart + Checkout    │  │    │
│  │                  └───────────────────┘  │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────┐  ┌────────────────────────┐    │
│  │   Zustand   │  │   TanStack Query       │    │
│  │  authStore  │  │  shops, orders,        │    │
│  │  cartStore  │  │  reviews, addresses    │    │
│  │  notifStore │  └────────────────────────┘    │
│  └─────────────┘                                │
│                                                 │
│  ┌──────────────────────────────────────────┐   │
│  │            Services Layer                │   │
│  │  Axios instance  │  socket.io-client     │   │
│  │  authService     │  orderService         │   │
│  │  shopService     │  addressService       │   │
│  │  ratingService   │  notificationService  │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                         │
                    HTTPS / WSS
                         │
              ┌──────────────────┐
              │   API Gateway    │
              │  (rate limit,    │
              │   JWT, RBAC)     │
              └──────────────────┘
                    │   │
          ┌─────────┘   └──────────┐
     Microservices          WebSocket
  Auth / Orders / Pay    Tracking / Status
  Notify / Tracking
```


### Navigation Architecture

Expo Router uses the file system as the routing manifest. The root `_layout.tsx` acts as the auth guard:

```
app/
  _layout.tsx          ← Root layout: loads JWT from SecureStore,
  │                       redirects (auth) ↔ (tabs), registers FCM,
  │                       sets up notification tap handler
  │
  (auth)/
  │   index.tsx        ← Phone number entry screen
  │   otp.tsx          ← OTP verification screen
  │
  (tabs)/
  │   _layout.tsx      ← Bottom Tab Navigator + FloatingCartBar overlay
  │   index.tsx        ← Home Feed
  │   search.tsx       ← Search tab
  │   orders/
  │       index.tsx    ← Orders list
  │       [id].tsx     ← Order detail + WebSocket + map
  │   profile/
  │       index.tsx    ← Profile tab
  │       edit.tsx     ← Edit name / photo
  │       addresses.tsx ← Saved addresses
  │       notifications.tsx ← Notification prefs
  │
  shop/
  │   [id].tsx         ← Shop detail (menu + reviews)
  │
  cart/
  │   index.tsx        ← Cart review screen
  │
  checkout/
      index.tsx        ← Checkout + Razorpay trigger
      confirmation.tsx ← Success screen with order ID
```

**Auth guard flow** (root `_layout.tsx`):
1. On mount, read JWT from `expo-secure-store`.
2. If absent or expired → `router.replace('/(auth)')`.
3. If valid → `router.replace('/(tabs)')`.
4. Axios 401 interceptor also calls the same logout action.

**Floating Cart Bar** is rendered as an `<Animated.View>` with `position: 'absolute'` inside the `(tabs)/_layout.tsx`, layered above the `<Tabs>` component via `zIndex`. It reads from `cartStore` and is only visible when `items.length > 0`.


---

## Components and Interfaces

### Shared Component Catalogue

All shared components live under `components/`. Each exports a named TypeScript component with typed props.

#### `ShopCard`
Displays a single shop in a list (Home Feed, Search results). Modelled on the Zomato reference's `ExploreOptionsNearMe` card structure.

```typescript
interface ShopCardProps {
  shop: Shop;
  onPress: (shopId: string) => void;
  style?: ViewStyle;
}
```

Layout: thumbnail image (100 % width, 160 px height) → shop name (bold) → service-type pills (up to 3) → row of [star rating | turnaround estimate | distance]. Uses `SkeletonCard` as a loading placeholder.

#### `ServiceItemRow`
Single row in the shop's service menu. Mirrors the Zomato `MenuComponent` item row pattern.

```typescript
interface ServiceItemRowProps {
  item: ServiceItem;
  quantity: number;         // 0 = not in cart
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}
```

When `quantity === 0`, renders an "ADD" button. When `quantity > 0`, renders `QuantityStepper`.

#### `FloatingCartBar`
Absolutely positioned bar above the tab bar.

```typescript
interface FloatingCartBarProps {
  itemCount: number;
  grandTotal: number;
  onPress: () => void;
}
```

Animates in/out with `Animated.timing` (200 ms fade + translateY). Hidden when `itemCount === 0`.

#### `SkeletonCard`
Shimmer placeholder matching `ShopCard` dimensions. Uses `expo-linear-gradient` for the shimmer sweep animation.

```typescript
interface SkeletonCardProps {
  style?: ViewStyle;
}
```

#### `BannerCarousel`
Horizontally auto-scrolling promotional banners using `FlatList` with `horizontal` + `pagingEnabled`.

```typescript
interface BannerCarouselProps {
  banners: Banner[];
  autoScrollIntervalMs?: number; // default 4000
}
```

#### `FilterChip` / `FilterChipRow`

```typescript
interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  iconUri?: string;
}

interface FilterChipRowProps {
  chips: Array<{ id: string; label: string; iconUri?: string }>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}
```

`FilterChipRow` renders a horizontal `ScrollView` (no scroll indicator). Tapping an already-selected chip deselects it (sets `selectedId` to `null`).

#### `QuantityStepper`

```typescript
interface QuantityStepperProps {
  value: number;
  min?: number;   // default 1
  max?: number;   // default 99
  onIncrement: () => void;
  onDecrement: () => void;
}
```

#### `StarRating`

```typescript
interface StarRatingProps {
  value: number;          // 1–5, supports 0.5 increments for display
  interactive?: boolean;  // default false
  onChange?: (v: number) => void;
  size?: number;          // default 16
}
```

Renders filled/half/empty star icons from `@expo/vector-icons/MaterialIcons`.

#### `OrderStatusTimeline`

```typescript
type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PICKED_UP'
  | 'IN_PROGRESS' | 'READY' | 'OUT_FOR_DELIVERY'
  | 'DELIVERED' | 'CANCELLED';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  timestamps: Partial<Record<OrderStatus, string>>; // ISO timestamps
}
```

Vertical list of steps; completed steps are filled, current step is highlighted, future steps are greyed out.

#### `InAppNotificationBanner`

```typescript
interface InAppNotificationBannerProps {
  title: string;
  body: string;
  onDismiss: () => void;
  onPress?: () => void;
}
```

Rendered via a React Native `Modal`-less absolute overlay at the top of the screen. Auto-dismisses after 4 000 ms using `setTimeout`; the timer is cleared if the user taps the dismiss icon.

#### `NoInternetBanner`

```typescript
interface NoInternetBannerProps {
  visible: boolean;
}
```

A fixed-height `Animated.View` that slides down from under the status bar when `visible` is `true`. Reads from `NetInfo` subscriber managed in root `_layout.tsx`.

#### `AddressCard`

```typescript
interface AddressCardProps {
  address: Address;
  isDefault: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```


### Screen-Level Component Breakdown

#### Auth Screens

`(auth)/index.tsx` — Phone Entry
- `TextInput` (numeric keyboard, maxLength 10) validated with zod
- Inline error `Text` under input
- "Send OTP" `TouchableOpacity`; disabled + loading indicator while request in flight
- Error states: invalid format (1.11), API error (1.12)

`(auth)/otp.tsx` — OTP Verification
- `OtpInput` from `react-native-otp-entry` (6 boxes)
- Countdown timer for resend cooldown (30 s, Req 1.13)
- "Resend OTP" tappable after cooldown expires (Req 1.6)
- Inline error for wrong OTP (Req 1.5), expiry message (Req 1.6)

#### Home Feed — `(tabs)/index.tsx`

Structure (top → bottom):
1. Location header row (city/area name + change icon)
2. `BannerCarousel` — renders immediately (Req 2.5)
3. `FilterChipRow` — renders immediately (Req 2.6)
4. Shop list: `FlatList` of `ShopCard`; 4 × `SkeletonCard` while loading (Req 2.9)
5. Pull-to-refresh via `refreshControl` prop (Req 2.8)

#### Shop Detail — `shop/[id].tsx`

Mirrors the Zomato `RestaurantPage` tabbed layout (Overview / Order Online / Reviews):
- Hero section: cover photo, name, average rating, review count, hours, ETA
- Segmented control for "Menu" tab and "Reviews" tab
- Menu tab: `SectionList` grouped by category; each row is `ServiceItemRow`
- Reviews tab: `FlatList` of review cards + "Load more" (Req 4.8, 4.9)
- Conflict dialog when adding from different shop (Req 4.10–4.12)

#### Cart — `cart/index.tsx`

- `FlatList` of cart items, each with `QuantityStepper`
- Price summary block (subtotal, tax, grand total)
- `TextInput` for pickup instructions (Req 5.7)
- Address section with "Change" CTA (Req 5.8)
- "Proceed to Checkout" button (Req 5.9)

#### Checkout — `checkout/index.tsx`

- Read-only summary of items, address, grand total
- "Pay Now" button → launches Razorpay sheet
- Loading overlay during payment processing (Req 7.8)

#### Order Detail — `(tabs)/orders/[id].tsx`

- Order metadata (ID, items, price, payment method)
- `OrderStatusTimeline`
- Map section (react-native-maps) shown only when status = `OUT_FOR_DELIVERY` (Req 8.5)
- "Cancel Order" action shown for `PENDING` / `CONFIRMED` (Req 8.9)
- Rating prompt shown when status = `DELIVERED` (Req 8.7)
- "Reconnecting…" overlay when WebSocket is down (Req 8.8)


---

## Data Models

All data models are TypeScript interfaces defined in `types/index.ts`.

```typescript
// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;           // 10-digit, stored without country code
  name: string;            // max 50 characters
  profilePhotoUrl: string | null;
  fcmToken: string | null;
  createdAt: string;       // ISO 8601
}

// ─── Shop ────────────────────────────────────────────────────────────────────

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

export interface ServiceItem {
  id: string;
  shopId: string;
  category: string;        // e.g. 'Shirts', 'Pants'
  name: string;
  description: string;     // max 150 characters
  priceInr: number;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  serviceItem: ServiceItem;
  quantity: number;        // 1–99
  lineTotal: number;       // serviceItem.priceInr * quantity
}

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

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'IN_PROGRESS'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

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

// ─── Address ──────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  customerId: string;
  label: string;           // 'Home' | 'Work' | custom (max 50 chars)
  formattedAddress: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

// ─── Ratings & Reviews ────────────────────────────────────────────────────────

export interface Rating {
  id: string;
  orderId: string;
  customerId: string;
  shopId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

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

export type NotificationEventType =
  | 'ORDER_CONFIRMED'
  | 'ORDER_PICKED_UP'
  | 'ORDER_READY'
  | 'OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED';

export interface NotificationPreferences {
  customerId: string;
  preferences: Record<NotificationEventType, boolean>; // true = enabled
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export interface Banner {
  id: string;
  imageUrl: string;
  deepLinkUrl?: string;    // optional tap destination
}
```


---

## State Management

### Zustand Stores

#### `authStore` — `store/authStore.ts`

```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;

  // Actions
  setToken: (token: string) => Promise<void>;   // writes to SecureStore
  setUser: (user: User) => void;
  logout: () => Promise<void>;                  // clears SecureStore + AsyncStorage
  loadToken: () => Promise<void>;               // reads from SecureStore on boot
}
```

`setToken` writes the JWT to `expo-secure-store` then updates the in-memory state.  
`logout` deletes the JWT from `expo-secure-store`, clears AsyncStorage, resets both `token` and `user` to `null`, then navigates to `/(auth)`.

#### `cartStore` — `store/cartStore.ts`

```typescript
interface CartState extends Cart {
  // Actions
  addItem: (item: ServiceItem, shopId: string, shopName: string) => void;
  removeItem: (serviceItemId: string) => void;
  setQuantity: (serviceItemId: string, qty: number) => void;
  setPickupInstructions: (text: string) => void;
  setDeliveryAddress: (addressId: string) => void;
  clearCart: () => void;
  replaceCart: (item: ServiceItem, shopId: string, shopName: string) => void;
}
```

Persisted to AsyncStorage via the `zustand/middleware` `persist` middleware with key `freshpress:cart`. Every mutation triggers a serialised write. On failed write the middleware rolls back and dispatches an error notification (Req 12.2).

Recalculates `subtotal`, `taxAmount`, `grandTotal` synchronously on every mutation using:
```
TAX_RATE = 0.05  // 5%, configurable in constants/config.ts
subtotal  = sum(item.lineTotal for item in items)
taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100
grandTotal = subtotal + taxAmount
```

#### `notificationStore` — `store/notificationStore.ts`

```typescript
interface NotificationState {
  preferences: NotificationPreferences['preferences'];
  setPreference: (event: NotificationEventType, enabled: boolean) => void;
  loadPreferences: () => Promise<void>;   // fetches from API on profile load
  syncPreferences: () => Promise<void>;   // pushes updates to API
}
```

Persisted locally; synced with the API on each preference change and on profile screen mount.

### TanStack Query Configuration

Query client instantiated in root `_layout.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,         // 1 minute
      gcTime: 300_000,           // 5 minutes
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
  },
});
```

Key query keys:
- `['shops', { lat, lng, serviceType }]` — Home Feed shop list
- `['shop', shopId]` — Shop detail
- `['shop', shopId, 'reviews', page]` — Paginated reviews
- `['orders']` — Orders list
- `['order', orderId]` — Single order detail
- `['addresses']` — Saved addresses
- `['search', query]` — Search results


---

## API Layer

### Axios Instance — `services/axiosInstance.ts`

```typescript
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10_000,   // 10 seconds — Req 12.6
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 and 5xx
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();   // Req 12.5
    }
    if (error.response && error.response.status >= 500) {
      throw new ApiError('SERVER_ERROR', error.response.status, error.response.data);
    }
    if (error.code === 'ECONNABORTED') {
      throw new ApiError('TIMEOUT', 408, null);  // Req 12.6
    }
    return Promise.reject(error);
  }
);
```

### Service Modules

#### `services/authService.ts`
| Function | Method | Endpoint |
|---|---|---|
| `requestOtp(phone)` | POST | `/auth/otp/request` |
| `verifyOtp(phone, otp)` | POST | `/auth/otp/verify` → returns `{ token, user }` |
| `getProfile()` | GET | `/auth/profile` |
| `registerFcmToken(fcmToken)` | POST | `/auth/fcm-token` |

#### `services/shopService.ts`
| Function | Method | Endpoint |
|---|---|---|
| `getNearbyShops(lat, lng, serviceType?)` | GET | `/shops?lat=&lng=&radius=50&serviceType=` |
| `searchShops(query)` | GET | `/shops/search?q=` |
| `getShopById(id)` | GET | `/shops/:id` |
| `getShopReviews(id, page)` | GET | `/shops/:id/reviews?page=&limit=20` |
| `getBanners()` | GET | `/banners` |

#### `services/orderService.ts`
| Function | Method | Endpoint |
|---|---|---|
| `createOrder(payload)` | POST | `/orders` |
| `getOrders()` | GET | `/orders` |
| `getOrderById(id)` | GET | `/orders/:id` |
| `cancelOrder(id)` | POST | `/orders/:id/cancel` |
| `createRazorpayOrder(grandTotalInr)` | POST | `/payments/razorpay/create` |
| `verifyPayment(payload)` | POST | `/payments/razorpay/verify` |

#### `services/addressService.ts`
| Function | Method | Endpoint |
|---|---|---|
| `getAddresses()` | GET | `/addresses` |
| `createAddress(payload)` | POST | `/addresses` |
| `updateAddress(id, payload)` | PUT | `/addresses/:id` |
| `deleteAddress(id)` | DELETE | `/addresses/:id` |
| `setDefaultAddress(id)` | POST | `/addresses/:id/default` |

#### `services/ratingService.ts`
| Function | Method | Endpoint |
|---|---|---|
| `submitRating(orderId, stars, text?, photoFiles?)` | POST | `/ratings` |
| `uploadReviewPhotos(files)` | POST | `/ratings/photos/upload` → S3 presigned URLs |

#### `services/notificationService.ts`
| Function | Method | Endpoint |
|---|---|---|
| `getPreferences()` | GET | `/notifications/preferences` |
| `updatePreferences(prefs)` | PUT | `/notifications/preferences` |


---

## Real-Time (WebSocket)

### Socket Singleton — `services/socket.ts`

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.EXPO_PUBLIC_WS_URL!, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1_000,          // base 1 s (Req 8.8)
      reconnectionDelayMax: 30_000,      // cap 30 s
      reconnectionAttempts: 5,           // max 5 retries
      auth: { token: useAuthStore.getState().token },
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
```

### Order Detail WebSocket Usage

In `(tabs)/orders/[id].tsx`:

```typescript
// Connect on mount
useEffect(() => {
  const sock = getSocket();
  sock.connect();
  sock.emit('subscribe:order', { orderId });

  sock.on('order:status_update', (data: { orderId: string; status: OrderStatus; timestamp: string }) => {
    // update React Query cache + local state
    queryClient.setQueryData(['order', orderId], (old: Order) => ({
      ...old,
      status: data.status,
      statusTimestamps: { ...old.statusTimestamps, [data.status]: data.timestamp },
    }));
  });

  sock.on('tracking:location_update', (data: { lat: number; lng: number }) => {
    setDeliveryLocation(data);  // animates map marker
  });

  sock.on('disconnect', () => setReconnecting(true));
  sock.on('connect', ()    => setReconnecting(false));

  return () => {
    sock.emit('unsubscribe:order', { orderId });
    sock.off('order:status_update');
    sock.off('tracking:location_update');
    disconnectSocket();   // full teardown on unmount (Req 8.3)
  };
}, [orderId]);
```

Map marker animation (Req 8.6):
```typescript
// Animate marker to new position within 500 ms
markerRef.current?.animateMarkerToCoordinate(
  { latitude: data.lat, longitude: data.lng },
  500
);
```

---

## Payment Integration

### Razorpay Flow

```
Customer taps "Pay Now"
        │
        ▼
createRazorpayOrder(grandTotalInr)
        │ returns { razorpay_order_id, amount_paise }
        ▼
RazorpayCheckout.open({
  key: EXPO_PUBLIC_RAZORPAY_KEY_ID,
  amount: grandTotal * 100,          // paise (Req 7.2)
  order_id: razorpay_order_id,
  name: 'FreshPress',
  description: 'Laundry Service Order',
  prefill: { contact: user.phone },
})
        │
   ┌────┴─────────────────────────┐
   │ Success                      │ Failure / Cancel
   ▼                              ▼
verifyPayment({                  Show error banner (Req 7.5)
  razorpay_payment_id,           Return to Cart screen
  razorpay_order_id,
  razorpay_signature,
})
        │
        ▼
createOrder(cartPayload)
        │
   ┌────┴───────────────┐
   │ 200 OK             │ Error (e.g. shop closed)
   ▼                    ▼
clearCart()           Show error dialog (Req 7.6)
navigate to           Keep cart intact
confirmation.tsx
```

Loading state during steps 2–4 sets `isPaymentInProgress = true` which disables the "Pay Now" button and all navigation (Req 7.8).

Network timeout during verification (step 3) surfaces as `ApiError('TIMEOUT')` → error banner advising user to check order status (Req 7.9).


---

## Push Notifications

### Setup Flow (root `_layout.tsx`)

```
App boot
  │
  ├─ loadToken() → JWT present?
  │     YES → request push permission (Req 9.1, first login only)
  │               │
  │               ├─ Granted → @react-native-firebase/messaging.getToken()
  │               │            → registerFcmToken(token) (Req 9.2)
  │               └─ Denied  → continue silently; do NOT re-request
  │
  └─ Register notification tap handler:
       notifications.addNotificationResponseReceivedListener(response => {
         const orderId = response.notification.request.content.data?.orderId;
         if (orderId) router.push(`/(tabs)/orders/${orderId}`);   // Req 9.5
         else         router.push('/(tabs)/orders');
       });
```

### Foreground Notification Handler

```typescript
// In root _layout.tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,  // suppress system banner in foreground
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

Notifications.addNotificationReceivedListener((notification) => {
  const { title, body, data } = notification.request.content;
  const eventType = data?.eventType as NotificationEventType;

  // Check per-event preference (Req 9.6)
  if (!notificationStore.preferences[eventType]) return;

  // Show InAppNotificationBanner (Req 9.3, 9.3a)
  showInAppBanner({ title, body, orderId: data?.orderId });
});
```

### Notification Event Mapping (Req 9.6)

| Backend Event | `NotificationEventType` | Default |
|---|---|---|
| Order Confirmed | `ORDER_CONFIRMED` | enabled |
| Order Picked Up | `ORDER_PICKED_UP` | enabled |
| Order Ready | `ORDER_READY` | enabled |
| Out for Delivery | `OUT_FOR_DELIVERY` | enabled |
| Order Delivered | `ORDER_DELIVERED` | enabled |


---

## Error Handling Strategy

### Error Classification

| Error Type | Source | Handling |
|---|---|---|
| Validation error | Client-side (zod) | Inline field error via `react-hook-form` |
| 400 Bad Request | API Gateway | Surface message from `error.response.data.message` |
| 401 Unauthorised | API interceptor | `logout()` → redirect to `/(auth)` (Req 12.5) |
| 5xx Server Error | API interceptor | Throw `ApiError('SERVER_ERROR')` → React Query `onError` → non-technical message + Retry (Req 12.4) |
| Timeout (10 s) | API interceptor | Throw `ApiError('TIMEOUT')` → timeout message + Retry (Req 12.6) |
| Network offline | NetInfo | `NoInternetBanner` + disable all API actions (Req 12.1) |
| WebSocket disconnect | socket.io | Reconnect with exponential backoff; show "Reconnecting…" (Req 8.8) |
| Cart persist fail | AsyncStorage | Roll back mutation; show error toast (Req 12.2) |
| JS crash | React error boundary | Full-screen error UI with "Reload app" CTA |

### `ApiError` Class — `services/errors.ts`

```typescript
export class ApiError extends Error {
  constructor(
    public code: 'SERVER_ERROR' | 'TIMEOUT' | 'NETWORK',
    public httpStatus: number,
    public data: unknown,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}
```

### React Query Error Integration

Each query/mutation uses `onError` in the query options or the component's `isError` / `error` flags:

```typescript
const { data, isError, refetch } = useQuery({
  queryKey: ['shops', filters],
  queryFn: () => shopService.getNearbyShops(lat, lng, filters.serviceType),
});

if (isError) return <ErrorState message="Couldn't load shops" onRetry={refetch} />;
```

The `ErrorState` component renders a non-technical message and a "Retry" button.

### Global Error Boundary — `components/AppErrorBoundary.tsx`

Wraps the entire app in root `_layout.tsx`. Catches unhandled errors, logs them, and displays a full-screen recovery UI.

### Offline Detection — `hooks/useNetworkStatus.ts`

```typescript
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  return isOnline;
}
```

The `NoInternetBanner` consumes this hook. API-dependent buttons receive `disabled={!isOnline}` to satisfy Req 12.1.


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property Reflection Summary**: After prework analysis, several criteria were consolidated:
- 1.2 and 1.11 both describe the same phone-number validation rule → merged into Property 1.
- 4.4, 4.5, 4.6, 4.7 all describe cart mutation rules → merged into Properties 4a/4b to avoid redundancy.
- 5.4 and 5.5 both test cart total recalculation → one property covers both.
- Properties about individual UI field visibility (1.1, 2.5, 2.9) are EXAMPLE-based and excluded from PBT properties.

---

### Property 1: Phone number validation boundary

*For any* string, the phone-number validation function SHALL accept the string if and only if it is composed entirely of digits and has a length of exactly 10. Any string that does not satisfy both conditions SHALL be rejected.

**Validates: Requirements 1.2, 1.11**

---

### Property 2: ShopCard renders all required fields

*For any* valid `Shop` object, rendering a `ShopCard` SHALL produce output that contains the shop name, at least one service type, a numeric average rating, an estimated turnaround time, and a distance value in kilometres.

**Validates: Requirements 2.4, 3.3**

---

### Property 3: Search fires only for queries of length ≥ 2

*For any* string typed into the search input, a search API request SHALL be dispatched if and only if the trimmed string has length ≥ 2. Strings shorter than 2 characters SHALL never trigger a request.

**Validates: Requirements 3.2**

---

### Property 4: Recent searches list is bounded, unique, and ordered by recency

*For any* sequence of N successful search queries (where N may exceed 5 and queries may repeat), the persisted recent-searches list SHALL contain at most 5 entries, all entries SHALL be unique strings, and the entries SHALL appear in most-recently-used-first order.

**Validates: Requirements 3.5**

---

### Property 5: Cart add/increment/decrement invariants

*For any* `ServiceItem` and any `Cart` state:
- Adding an item not in the cart SHALL result in the cart containing that item with `quantity = 1`.
- Incrementing an item with current `quantity = n` SHALL result in `quantity = n + 1`.
- Decrementing an item with current `quantity = n > 1` SHALL result in `quantity = n - 1`.
- Decrementing an item with current `quantity = 1` SHALL remove the item from the cart entirely.

**Validates: Requirements 4.4, 4.5, 4.6, 4.7**

---

### Property 6: FloatingCartBar visibility equals cart non-emptiness

*For any* `Cart` state, the `FloatingCartBar` SHALL be visible if and only if `cart.items.length > 0`. An empty cart SHALL never show the bar; a cart with any items SHALL always show the bar.

**Validates: Requirements 5.1**

---

### Property 7: Cart totals arithmetic invariants

*For any* set of `CartItem` values with positive unit prices and quantities in [1, 99], the computed values SHALL satisfy:
- `subtotal = Σ (item.priceInr × item.quantity)` for all items
- `taxAmount = round(subtotal × TAX_RATE, 2)`
- `grandTotal = subtotal + taxAmount`

**Validates: Requirements 5.4, 5.5**

---

### Property 8: Default address uniqueness invariant

*For any* list of saved `Address` objects and any `addressId` in that list, after calling `setDefault(addressId)`, exactly one address in the list SHALL have `isDefault = true` and it SHALL be the address with `id = addressId`.

**Validates: Requirements 6.3**

---

### Property 9: Razorpay amount conversion

*For any* positive integer or decimal `grandTotalInr`, the amount passed to the Razorpay checkout SHALL equal `Math.round(grandTotalInr * 100)` expressed as an integer number of paise.

**Validates: Requirements 7.2**

---

### Property 10: Notification suppression respects per-event preferences

*For any* incoming push notification event of type `T` and any `NotificationPreferences` map, the in-app notification banner SHALL be displayed if and only if `preferences[T] === true`. Events with `preferences[T] === false` SHALL never trigger the banner.

**Validates: Requirements 9.6**

---

### Property 11: Unanswered rating prompt persists across screen visits

*For any* `Order` where `ratingSubmitted = false`, opening the Order Detail screen SHALL display the rating prompt. This SHALL hold regardless of how many times the screen has been opened without submitting a rating, including across app restarts.

**Validates: Requirements 10.4**

---

### Property 12: Logout always completes navigation to auth despite partial failures

*For any* combination of cleanup steps (JWT deletion, AsyncStorage clear) that may individually succeed or throw an error, the `logout()` function SHALL always navigate the user to the `/(auth)` screen as its final action.

**Validates: Requirements 11.7**

---

### Property 13: Cart mutation rollback on storage failure

*For any* cart state `S` and any mutation `M` (add/remove/set-quantity), if the AsyncStorage write following `M` throws an error, the cart state SHALL remain equal to `S` (the pre-mutation state) and SHALL NOT reflect the changes from `M`.

**Validates: Requirements 12.2**

---

### Property 14: Cart serialisation round-trip

*For any* non-empty `Cart` object, serialising it to JSON (for AsyncStorage persistence) and then deserialising the result SHALL produce a `Cart` object that is deeply equal to the original, with all items, quantities, prices, and metadata preserved.

**Validates: Requirements 12.3**


---

## Testing Strategy

### Overview

The testing approach uses two complementary layers:
1. **Unit / property-based tests** — for pure logic: validation functions, cart calculations, serialisation, store reducers.
2. **Integration / component tests** — for UI behaviour, API interactions, and WebSocket flows using mocks.

End-to-end tests (Detox) are out of scope for this spec but recommended for critical paths (auth → checkout flow).

### Property-Based Testing

**Library**: `fast-check` (TypeScript-native, compatible with Jest)

Each property test runs a minimum of **100 iterations** to expose edge cases through randomised inputs. Each test is annotated with a reference tag:

> `// Feature: freshpress-customer-app, Property N: <property_text>`

Property test file locations follow this pattern:
```
__tests__/properties/
  phoneValidation.property.test.ts    // Properties 1
  shopCard.property.test.ts           // Property 2
  search.property.test.ts             // Properties 3, 4
  cart.property.test.ts               // Properties 5, 6, 7, 13, 14
  address.property.test.ts            // Property 8
  payment.property.test.ts            // Property 9
  notifications.property.test.ts      // Property 10
  rating.property.test.ts             // Property 11
  auth.property.test.ts               // Property 12
```

Example property test structure:
```typescript
import fc from 'fast-check';
import { validatePhone } from '@/utils/validation';

// Feature: freshpress-customer-app, Property 1: phone number validation boundary
test('phone validation accepts only 10-digit numeric strings', () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const isValid = /^\d{10}$/.test(input);
      expect(validatePhone(input).isValid).toBe(isValid);
    }),
    { numRuns: 200 }
  );
});
```

### Unit / Example-Based Tests

**Library**: Jest + React Native Testing Library (`@testing-library/react-native`)

Focus areas:
- Auth screens: phone entry (Req 1.1), OTP entry error states (Req 1.5), resend cooldown (Req 1.13)
- Auth guard: JWT present → home feed, JWT absent → auth screen (Req 1.8, 1.9)
- Home Feed: exactly 4 skeleton cards during loading (Req 2.9), banners load before shops (Req 2.5)
- Shop Detail: add from different shop dialog (Req 4.10)
- Cart: "Proceed to Checkout" blocked without address (Req 5.10)
- Checkout: loading overlay during payment (Req 7.8)
- Order Detail: WebSocket status update triggers timeline re-render (Req 8.4)
- In-app notification banner: auto-dismiss after 4 s (Req 9.3a)
- Logout: navigation to auth on completion (Req 11.7)
- Offline: NoInternetBanner appears; API buttons disabled (Req 12.1)
- 401 response: clears JWT + navigates to auth (Req 12.5)

### Integration Tests

Run against a local mock server (e.g., `msw` — Mock Service Worker adapted for RN via `msw/node`):
- Full OTP flow: request OTP → verify → JWT stored
- Search flow: debounce fires at 2 chars, results rendered
- Add to cart → checkout → Razorpay mock success → order confirmation
- Address create → geocode → saved in store + AsyncStorage
- WebSocket mock: status update reflected in timeline within 500 ms

### Test Coverage Targets

| Layer | Target |
|---|---|
| Pure logic (validation, cart math, serialisation) | 95 % |
| Zustand store actions | 90 % |
| Component rendering / interaction | 80 % |
| API service modules | 85 % |

