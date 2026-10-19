# Implementation Plan: FreshPress Customer App

## Overview

Build the FreshPress React Native (Expo Router) customer app from scratch. Tasks follow a foundation-first order: project scaffolding → types → state stores → API layer → auth screens → tab screens → feature screens → real-time tracking → notifications → ratings → profile → resilience layer → tests. Each task maps to one or more numbered requirements and builds on the output of the previous tasks.

---

## Tasks

- [x] 1. Project scaffolding and configuration
  - [x] 1.1 Initialise Expo project with Expo Router
    - Run `npx create-expo-app@latest freshpress-app --template tabs` (SDK 51, TypeScript template)
    - Rename generated root files to match the navigation architecture in design.md: `app/_layout.tsx`, `app/(auth)/index.tsx`, `app/(auth)/otp.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/search.tsx`, `app/(tabs)/orders/index.tsx`, `app/(tabs)/orders/[id].tsx`, `app/(tabs)/profile/index.tsx`, `app/(tabs)/profile/edit.tsx`, `app/(tabs)/profile/addresses.tsx`, `app/(tabs)/profile/notifications.tsx`, `app/shop/[id].tsx`, `app/cart/index.tsx`, `app/checkout/index.tsx`, `app/checkout/confirmation.tsx`
    - Create the folder skeleton: `components/`, `store/`, `services/`, `types/`, `constants/`, `utils/`, `hooks/`, `__tests__/properties/`, `__tests__/unit/`, `__tests__/integration/`
    - _Requirements: all_

  - [x] 1.2 Install all dependencies
    - Install runtime packages: `expo-router@3`, `react-native-safe-area-context`, `react-native-screens`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `zustand`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `socket.io-client`, `react-native-razorpay`, `expo-notifications`, `@react-native-firebase/app`, `@react-native-firebase/messaging`, `react-native-maps`, `expo-location`, `expo-image-picker`, `expo-linear-gradient`, `@expo/vector-icons`, `react-native-otp-entry`, `@react-native-community/netinfo`
    - Install dev/test packages: `jest`, `@testing-library/react-native`, `@testing-library/jest-native`, `fast-check`, `msw`, `ts-jest`, `@types/react-native`
    - Add `jest.config.js`, `babel.config.js` with `babel-preset-expo`, and `tsconfig.json` path aliases (`@/` → project root)
    - _Requirements: all_

  - [x] 1.3 Create `constants/config.ts` and environment setup
    - Define `TAX_RATE = 0.05`, `SEARCH_DEBOUNCE_MS = 300`, `OTP_RESEND_COOLDOWN_S = 30`, `OTP_EXPIRY_MINUTES = 5`, `MAX_RECENT_SEARCHES = 5`, `MAX_ADDRESSES = 5`, `BANNER_AUTOSCROLL_MS = 4000`, `SKELETON_COUNT = 4`, `API_TIMEOUT_MS = 10_000`
    - Read `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_WS_URL`, `EXPO_PUBLIC_RAZORPAY_KEY_ID` from `process.env` and re-export them
    - Create `.env.example` documenting all required env vars
    - _Requirements: 1.2, 2.2, 3.2, 5.4, 7.2, 12.6_


- [x] 2. TypeScript types and data models
  - [x] 2.1 Create `types/index.ts` with all data model interfaces
    - Define `User`, `Shop`, `ServiceItem`, `CartItem`, `Cart`, `Order`, `OrderStatus`, `Address`, `Rating`, `Review`, `NotificationPreferences`, `NotificationEventType`, `Banner` exactly as specified in the design's Data Models section
    - Export all types; add JSDoc comments referencing requirement numbers
    - _Requirements: 1.4, 2.4, 4.1, 4.2, 5.1–5.5, 6.1, 7.1, 8.2, 9.6, 10.1, 10.2_

  - [x] 2.2 Create `utils/validation.ts` with zod schemas
    - `phoneSchema`: string, exactly 10 digits, numeric only
    - `addressLabelSchema`: string max 50 chars
    - `pickupInstructionsSchema`: string max 200 chars
    - `reviewTextSchema`: string max 500 chars
    - `profileNameSchema`: string max 50 chars
    - Export both the zod schemas and a plain `validatePhone(input: string): { isValid: boolean; error?: string }` helper
    - _Requirements: 1.2, 1.11, 5.7, 6.1, 10.2, 11.2_

  - [ ] 2.3 Write property test for phone validation (Property 1)
    - **Property 1: Phone number validation boundary**
    - Use `fc.string()` to generate arbitrary strings; assert `validatePhone(s).isValid === /^\d{10}$/.test(s)` for 200 runs
    - Annotate: `// Feature: freshpress-customer-app, Property 1: phone number validation boundary`
    - File: `__tests__/properties/phoneValidation.property.test.ts`
    - **Validates: Requirements 1.2, 1.11**


- [ ] 3. Zustand state stores
  - [ ] 3.1 Implement `store/authStore.ts`
    - Implement `AuthState` interface: `token`, `user`, `isLoading`, `setToken`, `setUser`, `logout`, `loadToken`
    - `setToken`: write JWT to `expo-secure-store` then update in-memory state
    - `logout`: delete JWT from `expo-secure-store`, clear AsyncStorage, reset `token` and `user` to `null`
    - `loadToken`: read JWT from `expo-secure-store` on boot
    - _Requirements: 1.4, 1.7, 1.8, 1.9, 1.10, 11.7, 12.5_

  - [ ] 3.2 Implement `store/cartStore.ts`
    - Implement `CartState` (extends `Cart`): `addItem`, `removeItem`, `setQuantity`, `setPickupInstructions`, `setDeliveryAddress`, `clearCart`, `replaceCart`
    - Persist to AsyncStorage via `zustand/middleware persist` with key `freshpress:cart`
    - On each mutation, synchronously recalculate `subtotal`, `taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100`, `grandTotal`
    - On AsyncStorage write failure: roll back mutation to prior state, dispatch error notification
    - _Requirements: 4.4–4.7, 5.1–5.9, 12.2, 12.3_

  - [ ] 3.3 Implement `store/notificationStore.ts`
    - Implement `NotificationState`: `preferences`, `setPreference`, `loadPreferences`, `syncPreferences`
    - Persist locally; `syncPreferences` pushes to API after each change
    - All event types default to `true`
    - _Requirements: 9.6, 9.7_

  - [ ]* 3.4 Write property tests for cart store (Properties 5, 6, 7, 13, 14)
    - **Property 5: Cart add/increment/decrement invariants** — use `fc.record` to generate `ServiceItem` + initial `Cart` state; assert all four invariants
    - **Property 6: FloatingCartBar visibility equals cart non-emptiness** — for any cart state, assert `visible === (items.length > 0)`
    - **Property 7: Cart totals arithmetic invariants** — generate random arrays of `CartItem`; assert `subtotal`, `taxAmount`, `grandTotal` formulas
    - **Property 13: Cart mutation rollback on storage failure** — mock AsyncStorage to throw; assert cart equals pre-mutation state
    - **Property 14: Cart serialisation round-trip** — `JSON.parse(JSON.stringify(cart))` deep-equals original
    - File: `__tests__/properties/cart.property.test.ts`
    - **Validates: Requirements 4.4–4.7, 5.1, 5.4, 5.5, 12.2, 12.3**


- [ ] 4. API services layer
  - [ ] 4.1 Implement `services/errors.ts` and `services/axiosInstance.ts`
    - Define `ApiError` class with `code: 'SERVER_ERROR' | 'TIMEOUT' | 'NETWORK'`, `httpStatus`, `data`
    - Create Axios instance: `baseURL = EXPO_PUBLIC_API_BASE_URL`, `timeout = API_TIMEOUT_MS`
    - Request interceptor: attach `Authorization: Bearer <token>` from `authStore`
    - Response interceptor: 401 → call `authStore.logout()`, 5xx → throw `ApiError('SERVER_ERROR')`, `ECONNABORTED` → throw `ApiError('TIMEOUT')`
    - _Requirements: 12.4, 12.5, 12.6_

  - [ ] 4.2 Implement `services/authService.ts`
    - `requestOtp(phone)` → POST `/auth/otp/request`
    - `verifyOtp(phone, otp)` → POST `/auth/otp/verify` → returns `{ token, user }`
    - `getProfile()` → GET `/auth/profile`
    - `registerFcmToken(fcmToken)` → POST `/auth/fcm-token`
    - _Requirements: 1.2, 1.4, 9.2_

  - [ ] 4.3 Implement `services/shopService.ts`
    - `getNearbyShops(lat, lng, serviceType?)` → GET `/shops?lat=&lng=&radius=50&serviceType=`
    - `searchShops(query)` → GET `/shops/search?q=`
    - `getShopById(id)` → GET `/shops/:id`
    - `getShopReviews(id, page)` → GET `/shops/:id/reviews?page=&limit=20`
    - `getBanners()` → GET `/banners`
    - _Requirements: 2.1–2.10, 3.1–3.8, 4.1–4.14_

  - [ ] 4.4 Implement `services/orderService.ts`
    - `createOrder(payload)`, `getOrders()`, `getOrderById(id)`, `cancelOrder(id)` → respective endpoints
    - `createRazorpayOrder(grandTotalInr)` → POST `/payments/razorpay/create`
    - `verifyPayment(payload)` → POST `/payments/razorpay/verify`
    - _Requirements: 7.1–7.9, 8.1–8.12_

  - [ ] 4.5 Implement `services/addressService.ts` and `services/ratingService.ts` and `services/notificationService.ts`
    - `addressService`: `getAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `setDefaultAddress`
    - `ratingService`: `submitRating`, `uploadReviewPhotos`
    - `notificationService`: `getPreferences`, `updatePreferences`
    - _Requirements: 6.1–6.9, 10.1–10.8, 9.6, 9.7_

  - [ ] 4.6 Implement `services/socket.ts` — WebSocket singleton
    - `getSocket()`: create `socket.io-client` instance with `autoConnect: false`, exponential reconnection config (base 1 s, cap 30 s, max 5 retries), auth token from `authStore`
    - `disconnectSocket()`: disconnect and null the singleton
    - _Requirements: 8.3, 8.8_


- [ ] 5. Shared UI components
  - [ ] 5.1 Implement `components/SkeletonCard.tsx` and `components/ShopCard.tsx`
    - `SkeletonCard`: shimmer placeholder matching `ShopCard` dimensions using `expo-linear-gradient`
    - `ShopCard`: thumbnail (160 px height), shop name (bold), service-type pills (up to 3), star rating row, turnaround estimate, distance in km (1 decimal)
    - _Requirements: 2.4, 2.9, 3.3_

  - [ ] 5.2 Implement `components/BannerCarousel.tsx` and `components/FilterChip.tsx`
    - `BannerCarousel`: horizontal `FlatList` with `pagingEnabled`, auto-scroll every `autoScrollIntervalMs` ms (default 4 000), handles tap via `deepLinkUrl`
    - `FilterChipRow`: horizontal `ScrollView` (no scroll indicator); tapping active chip deselects it (`selectedId → null`)
    - _Requirements: 2.5, 2.6, 2.7_

  - [ ] 5.3 Implement `components/QuantityStepper.tsx`, `components/StarRating.tsx`, `components/ServiceItemRow.tsx`
    - `QuantityStepper`: − / + buttons, respects min (1) and max (99); pure component
    - `StarRating`: filled/half/empty stars from `@expo/vector-icons/MaterialIcons`; interactive mode calls `onChange`
    - `ServiceItemRow`: shows Add button when `quantity === 0`, shows `QuantityStepper` otherwise
    - _Requirements: 4.3–4.7, 10.2_

  - [ ] 5.4 Implement `components/FloatingCartBar.tsx`
    - Absolute positioning above tab bar (`position: 'absolute'`, `zIndex: 10`)
    - `Animated.timing` fade + translateY (200 ms) in/out; hidden when `itemCount === 0`
    - Reads `cartStore` directly; press navigates to `/(cart)`
    - _Requirements: 5.1, 5.2_

  - [ ] 5.5 Implement `components/OrderStatusTimeline.tsx`, `components/InAppNotificationBanner.tsx`, `components/NoInternetBanner.tsx`, `components/AddressCard.tsx`
    - `OrderStatusTimeline`: vertical step list; completed = filled, current = highlighted, future = grey
    - `InAppNotificationBanner`: absolute overlay at top; auto-dismisses after 4 000 ms; dismiss icon cancels timer
    - `NoInternetBanner`: `Animated.View` slides down from status bar when `visible = true`
    - `AddressCard`: shows label, formatted address, default badge, edit/delete/select actions
    - _Requirements: 8.2, 8.4, 9.3, 9.3a, 12.1_

  - [ ] 5.6 Implement `components/AppErrorBoundary.tsx`
    - React class-based error boundary wrapping the whole app
    - Catches unhandled JS errors; renders full-screen recovery UI with "Reload app" CTA
    - _Requirements: 12.4_

  - [ ]* 5.7 Write property test for ShopCard rendering (Property 2)
    - **Property 2: ShopCard renders all required fields**
    - Generate arbitrary valid `Shop` objects with `fc.record`; render `ShopCard` via `@testing-library/react-native`; assert name, at least 1 service type, rating, turnaround, distance are present in the output
    - File: `__tests__/properties/shopCard.property.test.ts`
    - **Validates: Requirements 2.4, 3.3**


- [ ] 6. Root layout, auth guard, and TanStack Query setup
  - [ ] 6.1 Implement `app/_layout.tsx` — root layout
    - Wrap the app in `<QueryClientProvider>` (staleTime 60 s, gcTime 5 min, retry 2) and `<AppErrorBoundary>`
    - On mount: call `authStore.loadToken()` → if valid token navigate to `/(tabs)`, else navigate to `/(auth)`
    - Subscribe to `NetInfo` and pass `isOnline` down to `NoInternetBanner`
    - Register FCM foreground notification handler (`shouldShowAlert: false`) and in-app banner dispatcher
    - Register notification tap handler: extract `orderId` from data → route to order detail
    - _Requirements: 1.8, 1.9, 9.1, 9.3, 9.3a, 9.4, 9.5, 12.1_

  - [ ] 6.2 Implement `app/(tabs)/_layout.tsx` — tab layout with FloatingCartBar
    - Define four bottom tabs: Home (`index`), Search (`search`), Orders (`orders/index`), Profile (`profile/index`)
    - Overlay `<FloatingCartBar>` as `position: 'absolute'` above `<Tabs>`
    - _Requirements: 5.1, 5.2_

  - [ ]* 6.3 Write unit tests for auth guard behaviour
    - JWT present → navigates to `/(tabs)`; JWT absent → navigates to `/(auth)` (Reqs 1.8, 1.9)
    - 401 interceptor fires `logout()` (Req 12.5)
    - File: `__tests__/unit/authGuard.test.ts`
    - _Requirements: 1.8, 1.9, 12.5_


- [ ] 7. Authentication screens
  - [ ] 7.1 Implement `app/(auth)/index.tsx` — phone number entry screen
    - `TextInput` with numeric keyboard, `maxLength={10}`, validated with `phoneSchema` via `react-hook-form`
    - Inline zod error message below input
    - "Send OTP" button: disabled + activity indicator while request in flight
    - On API error: show error message with "Retry" action (Req 1.12)
    - On success: navigate to `/(auth)/otp` passing phone as param
    - _Requirements: 1.1, 1.2, 1.11, 1.12_

  - [ ] 7.2 Implement `app/(auth)/otp.tsx` — OTP verification screen
    - `OtpInput` from `react-native-otp-entry` (6 boxes); auto-submits on 6th digit
    - Countdown timer (30 s); "Resend OTP" enabled only after cooldown (Req 1.13)
    - On incorrect OTP: inline error, allow re-entry (Req 1.5)
    - On expired OTP: expiry message + "Resend OTP" (Req 1.6)
    - On success: call `authStore.setToken`, `authStore.setUser`, navigate to `/(tabs)`
    - _Requirements: 1.3–1.7, 1.13_

  - [ ]* 7.3 Write unit tests for auth screens
    - Phone entry: invalid input shows error; valid input + API success navigates to OTP (Reqs 1.1, 1.2, 1.11)
    - OTP: wrong code shows inline error; cooldown countdown; resend re-enabled after 30 s (Reqs 1.5, 1.13)
    - File: `__tests__/unit/authScreens.test.tsx`
    - _Requirements: 1.1, 1.2, 1.5, 1.11, 1.13_

- [ ] 8. Checkpoint — core foundation complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 9. Home Feed screen
- [ ] 9.1 Implement `app/(tabs)/index.tsx` — Home Feed
    - On mount: request GPS via `expo-location` (10 s timeout); if denied or timed out show city/area `TextInput` (max 100 chars)
    - Render `BannerCarousel` (from `useQuery(['banners'])`) immediately on load
    - Render `FilterChipRow` immediately; tapping chip refetches shops with `serviceType` param
    - Render vertically scrollable `FlatList` of `ShopCard`; display exactly 4 `SkeletonCard` while loading
    - `refreshControl` prop for pull-to-refresh; preserve active filter
    - On fetch failure: `ErrorState` component with non-technical message + Retry
    - _Requirements: 2.1–2.10_

  - [ ]* 9.2 Write unit tests for Home Feed
    - Exactly 4 skeleton cards during loading (Req 2.9)
    - `BannerCarousel` mounts before shop list resolves (Req 2.5)
    - Tapping filter chip triggers refetch (Req 2.7)
    - File: `__tests__/unit/homeFeed.test.tsx`
    - _Requirements: 2.5, 2.7, 2.9_


- [ ] 10. Search screen
  - [ ] 10.1 Implement `app/(tabs)/search.tsx` — Search tab
    - `TextInput` search field; debounce 300 ms; fire query when trimmed length ≥ 2
    - Display up to 5 recent searches from AsyncStorage when input is empty; persist each successful query (keep 5 most-recent unique)
    - Tapping recent search populates input and fires search
    - Render up to 20 `ShopCard` results with name, service types, rating, distance
    - "No shops found" message on empty results; error state with Retry on failure
    - Navigate to `app/shop/[id]` on card tap
    - _Requirements: 3.1–3.8_

  - [ ]* 10.2 Write property tests for search (Properties 3, 4)
    - **Property 3: Search fires only for queries of length ≥ 2** — use `fc.string()` to generate inputs; assert search API call count is 0 for `trimmed.length < 2` and 1 for `trimmed.length >= 2`
    - **Property 4: Recent searches list is bounded, unique, and ordered by recency** — generate sequences of N queries with `fc.array(fc.string())`; assert list length ≤ 5, all unique, most-recent first
    - File: `__tests__/properties/search.property.test.ts`
    - **Validates: Requirements 3.2, 3.5**


- [ ] 11. Shop Detail screen
  - [ ] 11.1 Implement `app/shop/[id].tsx` — Shop Detail (header + menu tab)
    - Hero section: cover photo, name, average rating, review count, address, operating hours, ETA
    - Segmented control: "Menu" / "Reviews" tabs
    - Menu tab: `SectionList` grouped by category; each row is `ServiceItemRow` connected to `cartStore`
    - On "Add" when cart empty or same shop: call `cartStore.addItem`
    - On "Add" when cart has items from different shop: show confirmation dialog (Req 4.10–4.12)
    - On fetch failure: `ErrorState` + Retry
    - _Requirements: 4.1–4.4, 4.10–4.13_

  - [ ] 11.2 Implement Reviews tab within `app/shop/[id].tsx`
    - `FlatList` of review cards (reviewer name, stars, date, review text)
    - Paginated: initial 20; "Load more" fetches next page via `useInfiniteQuery(['shop', id, 'reviews', page])`
    - On "Load more" failure: error message + re-enable action
    - On reviews tab failure: inline error + Retry
    - _Requirements: 4.8, 4.9, 4.14_

  - [ ]* 11.3 Write unit test for cart-conflict dialog (Req 4.10)
    - Render `ShopDetail` with non-empty cart from shop A; tap "Add" on item from shop B; assert dialog appears
    - Confirm → cart replaced; Cancel → cart unchanged
    - File: `__tests__/unit/shopDetail.test.tsx`
    - _Requirements: 4.10–4.12_


- [ ] 12. Cart screen and Floating Cart Bar wiring
  - [ ] 12.1 Implement `app/cart/index.tsx` — Cart screen
    - `FlatList` of cart items; each row has `ServiceItemRow` with `QuantityStepper` (min 1, max 99)
    - Price summary block: subtotal, tax, grand total; recalculates within 300 ms of any change
    - "Pickup Instructions" `TextInput` (max 200 chars, `pickupInstructionsSchema`)
    - Address section: show default address; "Change" CTA opens address selection modal
    - "Proceed to Checkout" button: if no address saved show inline error; else navigate to `checkout/index`
    - When all items removed: hide `FloatingCartBar`, navigate back to Home Feed
    - _Requirements: 5.1–5.10_

  - [ ]* 12.2 Write unit tests for Cart screen
    - "Proceed to Checkout" blocked when no address exists (Req 5.10)
    - Grand total updates within 300 ms on quantity change (Req 5.5)
    - FloatingCartBar visibility toggles with cart emptiness (Req 5.1, 5.6)
    - File: `__tests__/unit/cart.test.tsx`
    - _Requirements: 5.1, 5.5, 5.6, 5.10_


- [ ] 13. Address management screens
  - [ ] 13.1 Implement address list and selection in `app/(tabs)/profile/addresses.tsx`
    - Display up to 5 saved `AddressCard` components (label, formatted address, default badge)
    - "Set as default" action calls `addressService.setDefaultAddress`; ensure only one default at a time
    - "Delete" action (not allowed if only address); if deleted was default, auto-designate most-recent remaining
    - "Add New Address" CTA navigates to address form
    - _Requirements: 6.1, 6.3, 6.5, 6.9_

  - [ ] 13.2 Implement address entry form (modal or screen within `addresses.tsx`)
    - Form fields: label (max 50), formatted address text input
    - `react-native-maps` `MapView` with draggable pin to set precise delivery location
    - On save: geocode via `expo-location`; if geocoding fails show error and abort save
    - Persist to API Gateway + AsyncStorage; if either fails show error and abort
    - _Requirements: 6.2, 6.6, 6.7, 6.8_

  - [ ]* 13.3 Write property test for default address uniqueness (Property 8)
    - **Property 8: Default address uniqueness invariant**
    - Generate `fc.array(fc.record({...}))` of addresses + arbitrary `addressId`; call `setDefault`; assert exactly one `isDefault = true` and it matches `addressId`
    - File: `__tests__/properties/address.property.test.ts`
    - **Validates: Requirements 6.3**


- [ ] 14. Checkout and payment
  - [ ] 14.1 Implement `app/checkout/index.tsx` — Checkout screen
    - Read-only summary: cart items, delivery address, grand total
    - "Pay Now" button: calls `orderService.createRazorpayOrder(grandTotal)` then opens `RazorpayCheckout.open({ key, amount: grandTotal * 100, order_id, ... })`
    - On Razorpay success: call `orderService.verifyPayment(payload)` → `orderService.createOrder(cartPayload)` → `cartStore.clearCart()` → navigate to `checkout/confirmation`
    - On Razorpay failure/cancel: navigate back to cart, show error banner (Req 7.5)
    - On order creation rejection: show error dialog, keep cart intact (Req 7.6)
    - While payment in progress: `isPaymentInProgress = true`, disable button + navigation
    - On network timeout during verify: error banner advising user to check order status (Req 7.9)
    - _Requirements: 7.1–7.9_

  - [ ] 14.2 Implement `app/checkout/confirmation.tsx` — Order Confirmation screen
    - Display Order ID, estimated turnaround time in minutes, success animation (Lottie or `Animated` API)
    - Clear cart on mount (idempotent guard in case not already cleared)
    - _Requirements: 7.4_

  - [ ]* 14.3 Write unit test for payment loading state (Req 7.8)
    - Assert "Pay Now" button is disabled and loading overlay visible when `isPaymentInProgress = true`
    - File: `__tests__/unit/checkout.test.tsx`
    - _Requirements: 7.8_

  - [ ]* 14.4 Write property test for Razorpay amount conversion (Property 9)
    - **Property 9: Razorpay amount conversion**
    - Generate `fc.integer({ min: 1 })` and `fc.float({ min: 0.01 })` for `grandTotalInr`; assert `amountPaise === Math.round(grandTotalInr * 100)`
    - File: `__tests__/properties/payment.property.test.ts`
    - **Validates: Requirements 7.2**


- [ ] 15. Order list and Order Detail screens
  - [ ] 15.1 Implement `app/(tabs)/orders/index.tsx` — Orders list
    - `FlatList` sorted by `createdAt` descending; each row shows shop name, status badge, total price, order date
    - Empty state message if no orders
    - Navigate to `orders/[id]` on tap
    - _Requirements: 8.1, 8.2, 11.4_

  - [ ] 15.2 Implement `app/(tabs)/orders/[id].tsx` — Order Detail (static portion)
    - Display Order ID, items, total price, payment method, `OrderStatusTimeline`
    - "Cancel Order" CTA visible for `PENDING` / `CONFIRMED`; calls `orderService.cancelOrder(id)`; on success reflect `CANCELLED` status within 1 s; on failure re-enable CTA
    - Rating prompt section (initially hidden, shown when `status === 'DELIVERED' && !ratingSubmitted`)
    - _Requirements: 8.2, 8.9–8.12, 10.1_

  - [ ] 15.3 Wire WebSocket into `app/(tabs)/orders/[id].tsx`
    - On mount: `getSocket().connect()`, emit `subscribe:order`, register `order:status_update` + `tracking:location_update` + `disconnect` + `connect` listeners
    - `order:status_update`: update React Query cache `['order', orderId]`
    - Show "Reconnecting…" overlay on `disconnect`; hide on `connect`
    - On unmount: emit `unsubscribe:order`, remove listeners, call `disconnectSocket()`
    - _Requirements: 8.3, 8.4, 8.8_

  - [ ] 15.4 Add map view to `app/(tabs)/orders/[id].tsx`
    - Show `react-native-maps MapView` only when `status === 'OUT_FOR_DELIVERY'`
    - Pin delivery address marker; animate delivery-partner marker to new coords on `tracking:location_update` within 500 ms using `markerRef.current?.animateMarkerToCoordinate`
    - If GPS unavailable: show map with only delivery address pin
    - _Requirements: 8.5, 8.6_

  - [ ]* 15.5 Write unit test for WebSocket status update
    - Mock socket; emit `order:status_update`; assert `OrderStatusTimeline` re-renders with new status (Req 8.4)
    - Assert "Reconnecting…" overlay on socket disconnect (Req 8.8)
    - File: `__tests__/unit/orderDetail.test.tsx`
    - _Requirements: 8.4, 8.8_

- [ ] 16. Checkpoint — order flow complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 17. Push notifications setup
  - [ ] 17.1 Implement push notification registration in `app/_layout.tsx`
    - On first login: request push permission via `expo-notifications`; if denied, continue silently, do NOT re-request
    - If granted: call `@react-native-firebase/messaging getToken()` → `authService.registerFcmToken(token)`
    - Set `Notifications.setNotificationHandler` with `shouldShowAlert: false` (suppress system banner in foreground)
    - `addNotificationReceivedListener`: check `notificationStore.preferences[eventType]`; if enabled, call `showInAppBanner`
    - `addNotificationResponseReceivedListener`: extract `orderId`; navigate to order detail or orders list
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 17.2 Write property test for notification suppression (Property 10)
    - **Property 10: Notification suppression respects per-event preferences**
    - Generate `fc.record` for `NotificationPreferences` and `fc.constantFrom(...NotificationEventTypes)` for event type; assert banner shown iff `preferences[T] === true`
    - File: `__tests__/properties/notifications.property.test.ts`
    - **Validates: Requirements 9.6**


- [ ] 18. Ratings and Reviews
  - [ ] 18.1 Implement rating prompt on `app/(tabs)/orders/[id].tsx`
    - When `status === 'DELIVERED' && !ratingSubmitted`: render `StarRating` (interactive, 1–5) + optional review `TextInput` (max 500 chars) + photo picker (up to 3 × ≤ 5 MB JPEG/PNG via `expo-image-picker`)
    - Re-display on every screen visit until rating submitted; persist `ratingSubmitted = false` in local state backed by order cache
    - Submit: if photos present, `ratingService.uploadReviewPhotos(files)` first; then `ratingService.submitRating(orderId, stars, text?, photoUrls?)`
    - On success: set `ratingSubmitted = true`, invalidate `['shop', shopId, 'reviews']` query
    - On failure: show error message, allow retry without losing entered content
    - On photo upload failure: error message, do not submit review
    - _Requirements: 8.7, 10.1–10.8_

  - [ ]* 18.2 Write property test for unanswered rating prompt persistence (Property 11)
    - **Property 11: Unanswered rating prompt persists across screen visits**
    - Generate `fc.record` for `Order` with `ratingSubmitted = false`; simulate N screen mounts; assert rating prompt is shown every time
    - File: `__tests__/properties/rating.property.test.ts`
    - **Validates: Requirements 10.4**


- [ ] 19. Profile screens
  - [ ] 19.1 Implement `app/(tabs)/profile/index.tsx` — Profile tab
    - Display name, phone number, profile photo (default avatar if none set)
    - Navigation items: "Edit Profile", "Order History", "Saved Addresses", "Notifications", "Help & Support" (opens external URL), App version number
    - "Log Out" button: call `authStore.logout()` which clears JWT + AsyncStorage; continue even on partial failures, always navigate to `/(auth)`
    - _Requirements: 11.1, 11.4, 11.5, 11.6, 11.7, 11.9_

  - [ ] 19.2 Implement `app/(tabs)/profile/edit.tsx` — Edit Profile screen
    - Pre-populated form with `profileNameSchema` (max 50 chars)
    - Profile photo: `expo-image-picker` → `ratingService.uploadReviewPhotos` path (reuse upload endpoint) → update displayed photo
    - On photo upload failure: error message, retain previous photo
    - Save calls API; Cancel discards changes
    - _Requirements: 11.2, 11.3, 11.8_

  - [ ] 19.3 Implement `app/(tabs)/profile/notifications.tsx` — Notification preferences screen
    - One toggle per `NotificationEventType`; reads from `notificationStore.preferences`; calls `setPreference` + `syncPreferences` on change
    - _Requirements: 9.6, 9.7, 11.6_

  - [ ]* 19.4 Write property test for logout resilience (Property 12)
    - **Property 12: Logout always completes navigation to auth despite partial failures**
    - Use `fc.tuple(fc.boolean(), fc.boolean())` to simulate JWT deletion success/failure and AsyncStorage clear success/failure; assert `/(auth)` navigation always happens
    - File: `__tests__/properties/auth.property.test.ts`
    - **Validates: Requirements 11.7**


- [ ] 20. Offline and error resilience
  - [ ] 20.1 Implement `hooks/useNetworkStatus.ts` and wire `NoInternetBanner`
    - `useNetworkStatus()` hook: subscribe to `NetInfo`; return `isOnline: boolean`
    - In `app/_layout.tsx`: consume hook, pass `visible={!isOnline}` to `NoInternetBanner`
    - All API-dependent buttons receive `disabled={!isOnline}` (visually greyed out, non-interactive)
    - _Requirements: 12.1_

  - [ ] 20.2 Verify cart persistence and restore flow
    - Confirm `cartStore` persists after every mutation via `zustand/middleware persist` (key `freshpress:cart`)
    - On app relaunch, Zustand `persist` middleware auto-restores cart from AsyncStorage if ≥ 1 item
    - Confirm rollback logic on AsyncStorage write failure (already implemented in 3.2; add integration test here)
    - _Requirements: 12.2, 12.3_

  - [ ]* 20.3 Write unit tests for resilience scenarios
    - `NoInternetBanner` appears when `isOnline = false`; API buttons disabled (Req 12.1)
    - 401 response: `authStore.logout()` called, navigated to `/(auth)` (Req 12.5)
    - Timeout: `ApiError('TIMEOUT')` surface as timeout message with Retry (Req 12.6)
    - File: `__tests__/unit/resilience.test.tsx`
    - _Requirements: 12.1, 12.5, 12.6_

- [ ] 21. Checkpoint — full feature set complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 22. Integration tests
  - [ ]* 22.1 Write integration test: OTP authentication flow
    - Mock `authService.requestOtp` and `authService.verifyOtp` via `msw/node`
    - Flow: enter phone → submit → OTP screen → enter code → JWT stored → navigate to Home Feed
    - File: `__tests__/integration/authFlow.test.tsx`
    - _Requirements: 1.2–1.7_

  - [ ]* 22.2 Write integration test: search and navigation flow
    - Mock `shopService.searchShops`; assert debounce fires at 2 chars; results rendered; tapping result navigates to shop
    - File: `__tests__/integration/searchFlow.test.tsx`
    - _Requirements: 3.2–3.4_

  - [ ]* 22.3 Write integration test: cart → checkout → order confirmation
    - Mock `orderService.createRazorpayOrder`, Razorpay success callback, `orderService.verifyPayment`, `orderService.createOrder`
    - Assert cart cleared and navigation to confirmation (Reqs 7.1–7.4)
    - File: `__tests__/integration/checkoutFlow.test.tsx`
    - _Requirements: 7.1–7.4_

  - [ ]* 22.4 Write integration test: address creation flow
    - Mock geocoding + `addressService.createAddress` + AsyncStorage; assert address appears in list (Req 6.2, 6.8)
    - File: `__tests__/integration/addressFlow.test.tsx`
    - _Requirements: 6.2, 6.8_

  - [ ]* 22.5 Write integration test: WebSocket order status update
    - Mount Order Detail with mock socket; emit `order:status_update`; assert timeline re-renders within 500 ms (Req 8.4)
    - File: `__tests__/integration/websocketFlow.test.tsx`
    - _Requirements: 8.3, 8.4_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 8, 16, and 21 ensure incremental validation
- Property tests use `fast-check` with a minimum of 200 iterations per property
- Unit tests use Jest + `@testing-library/react-native`
- Integration tests use `msw/node` as the mock server layer
- All 14 correctness properties from design.md have dedicated PBT sub-tasks
- The `TAX_RATE` constant (5%) lives in `constants/config.ts` and is read by `cartStore`


## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2"]
    },
    {
      "id": 2,
      "tasks": ["2.3", "3.1", "3.2", "3.3"]
    },
    {
      "id": 3,
      "tasks": ["3.4", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6"]
    },
    {
      "id": 4,
      "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"]
    },
    {
      "id": 5,
      "tasks": ["5.7", "6.1", "6.2"]
    },
    {
      "id": 6,
      "tasks": ["6.3", "7.1", "7.2"]
    },
    {
      "id": 7,
      "tasks": ["7.3", "9.1", "10.1", "13.1", "13.2"]
    },
    {
      "id": 8,
      "tasks": ["9.2", "10.2", "13.3", "11.1"]
    },
    {
      "id": 9,
      "tasks": ["11.2", "12.1", "15.1"]
    },
    {
      "id": 10,
      "tasks": ["11.3", "12.2", "14.1", "14.2", "15.2"]
    },
    {
      "id": 11,
      "tasks": ["14.3", "14.4", "15.3", "15.4"]
    },
    {
      "id": 12,
      "tasks": ["15.5", "17.1", "18.1"]
    },
    {
      "id": 13,
      "tasks": ["17.2", "18.2", "19.1", "19.2", "19.3"]
    },
    {
      "id": 14,
      "tasks": ["19.4", "20.1", "20.2"]
    },
    {
      "id": 15,
      "tasks": ["20.3", "22.1", "22.2", "22.3", "22.4", "22.5"]
    }
  ]
}
``` 09