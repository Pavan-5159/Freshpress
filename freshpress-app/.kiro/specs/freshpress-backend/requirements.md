# Requirements Document — FreshPress Backend

## Introduction

This document defines the functional and non-functional requirements for the FreshPress backend — the server-side infrastructure that powers the customer, shop owner, delivery partner, and admin applications. The backend is a multi-service architecture accessed through an API Gateway, backed by PostgreSQL, Redis, and BullMQ.

## Glossary

- **API Gateway**: Single entry point for all client requests. Handles rate limiting, JWT verification, RBAC, input validation, and load-balanced proxying to microservices.
- **Rate Limiter**: Redis-backed sliding-window rate limiter that restricts requests per endpoint.
- **JWT Verifier**: Validates access tokens from the Authorization: Bearer header. Supports token rotation via refresh tokens.
- **RBAC**: Role-based access control — restricts routes based on the authenticated user's role.
- **Redis**: In-memory data store used for rate-limiting counters, refresh-token blacklists, partner GPS locations, and BullMQ queues.
- **BullMQ**: Redis-backed queue system for background job processing.
- **DLQ**: Dead-letter queue — persisted failed jobs with alerting.
- **WebSocket (Socket.IO)**: Persistent bidirectional connection for real-time order status and partner GPS tracking.
- **FCM**: Firebase Cloud Messaging — push notification delivery.
- **S3 / CloudFront**: Object storage + CDN for user-generated uploads.

---

## Non-Functional Requirements

### NFR 1: Latency
- All API Gateway middleware shall complete within 10ms.
- Database queries shall complete within 50ms for 95th percentile.
- Redis operations shall complete within 5ms.

### NFR 2: Availability
- The API Gateway shall achieve 99.9% uptime.
- WebSocket connections shall survive nginx reloads via sticky sessions.

### NFR 3: Security
- All tokens shorter than 256 bits shall be rejected.
- All uploaded files shall pass magic-byte MIME validation.
- S3 objects shall never be publicly readable directly; access only via CloudFront Origin Access Control.

### NFR 4: Scalability
- Each queue worker process shall support at least 5 concurrent jobs.
- The WebSocket gateway shall support at least 10,000 concurrent connections.

### NFR 5: Observability
- Every admin action shall generate a structured pino log entry.
- DLQ events shall trigger Slack alerts within 5 seconds.

---

## Functional Requirements

### Requirement 1: Rate Limiting

**User Story:** As the platform, I want to limit the number of requests per client per endpoint so that the API is protected against abuse.

#### Acceptance Criteria

1. THE rate limiter SHALL enforce per-route rules defined in a RULES map.
2. POST /auth/send-otp SHALL be limited to 5 requests per 15 minutes.
3. POST /auth/verify-otp SHALL be limited to 3 requests per 5 minutes.
4. GET /shops/search SHALL be limited to 60 requests per minute.
5. POST /orders SHALL be limited to 10 requests per minute.
6. ALL other routes SHALL fall back to a DEFAULT rule of 120 requests per minute.
7. THE rate limiter SHALL use a Redis sorted set (ZSET) with atomic Lua script for check-and-increment.
8. EACH response SHALL include X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers.
9. WHEN a request exceeds the limit, THE API SHALL return HTTP 429 with retryAfter in the body.

---

### Requirement 2: JWT Verification & Token Rotation

**User Story:** As a user, I want my session to be secure with short-lived access tokens and long-lived refresh tokens, so that stolen tokens have minimal impact.

#### Acceptance Criteria

1. THE JWT verifier SHALL reject requests without an Authorization: Bearer <token> header with 401 MISSING_TOKEN.
2. EXPIRED tokens SHALL return 401 TOKEN_EXPIRED with a hint to refresh.
3. INVALID signatures or malformed tokens SHALL return 401 INVALID_TOKEN.
4. ALL valid tokens SHALL have a sessionId embedded; the verifier SHALL check the Redis blacklist (blacklist:<sessionId>) and return 401 TOKEN_REVOKED if found.
5. THE /auth/refresh endpoint SHALL validate the refresh token (bcrypt hash match), add the old session to the blacklist, and issue a new access/Flows token pair with a new family ID.
6. ACCESS tokens SHALL expire after 15 minutes.
7. REFRESH tokens SHALL expire after 7 days.

---

### Requirement 3: RBAC

**User Story:** As the platform, I want to restrict route access by role so that customers cannot access admin endpoints and vice versa.

#### Acceptance Criteria

1. EACH protected route SHALL be decorated with an allowed roles array.
2. IF the request has no authenticated user, THE API SHALL return 401 UNAUTHENTICATED.
3. IF the user's role is not in the allowed list, THE API SHALL return 403 FORBIDDEN.
4. THE following role matrix SHALL be enforced: CUSTOMER, SHOP_OWNER, DELIVERY_PARTNER, ADMIN.
5. ONLY ADMIN users SHALL access /admin/* routes.
6. ONLY SHOP_OWNER users SHALL accept orders via PATCH /orders/:id/accept.
7. ONLY DELIVERY_PARTNER users SHALL call /partners/location.

---

### Requirement 4: Input Validation (Zod)

**User Story:** As the platform, I want all request payloads validated so that invalid data never reaches the database.

#### Acceptance Criteria

1. ALL request bodies, query params, and URL params SHALL be validated against a Zod schema before the controller runs.
2. INVALID payloads SHALL return HTTP 422 with a structured errors array containing every field error.
3. THE createOrder schema SHALL reject: missing required fields, non-UUID strings for IDs, quantities above 50, non-MORNING/AFTERNOON/EVENING timeWindow values, and specialInstructions longer than 500 characters.
4. VALIDATED data SHALL replace the raw body in req.body so controllers receive typed, parsed data.

---

### Requirement 5: Load Balancing & Proxy

**User Story:** As the platform, I want upstream service calls to be distributed across healthy instances so that a single instance failure does not take the platform down.

#### Acceptance Criteria

1. THE load balancer SHALL maintain a pool of service instances per service (auth, orders, payments, notify, tracking).
2. THE load balancer SHALL use round-robin across HEALTHY instances.
3. EACH instance SHALL be probed every 10 seconds via /health endpoint.
4. UNHEALTHY instances SHALL be removed from rotation automatically.
5. THE proxy middleware SHALL forward the original request method, headers (with X-User-Id and X-User-Role injected), and body to the selected upstream instance.
6. ALL upstream responses SHALL be streamed back to the client with the same status code and body.

---

### Requirement 6: Auth Service (OTP, JWT, Sessions)

**User Story:** As a user, I want to log in via phone + OTP so that I don't need a password.

#### Acceptance Criteria

1. OTPs SHALL be generated using crypto.randomInt (6 digits, not Math.random).
2. OTPs SHALL be stored as SHA256 hashes in Redis with a 5-minute TTL.
3. MAXIMUM 3 OTP verification attempts per phone per 10 minutes.
4. ON successful OTP verification, the API SHALL return an access token (15 min) and a refresh token (7 days).
5. REFRESH tokens SHALL be stored in the database (bcrypt hash) with device info, IP, and expiration.
6. ON logout, THE session SHALL be added to the Redis blacklist.
7. MULTI-DEVICE sessions SHALL be supported (each login is a separate session with its own family ID).

---

### Requirement 7: WebSocket Tracking (Real-Time)

**User Story:** As a customer, I want to see real-time order status and partner location updates so that I know when my laundry is being picked up or delivered.

#### Acceptance Criteria

1. THE tracking gateway SHALL use Socket.IO namespaces with room-based routing (order:<id>, shop:<id>, admin:ops).
2. WHEN a customer subscribes to an order, THE server SHALL emit the current order state immediately.
3. WHEN an order status changes, THE server SHALL broadcast to the order room.
4. WHEN a partner sends GPS updates (every 30 seconds), THE server SHALL broadcast the location to the order room and the admin:ops room.
5. PARTNER GPS data SHALL be stored in Redis with a 60-second TTL for offline detection.
6. ETA shall be recalculated and broadcast whenever the partner's location changes.
7. ON partner disconnect, the location TTL shall expire naturally (60 seconds), preventing stale location display.

---

### Requirement 8: Queues & Workers (BullMQ)

**User Story:** As the platform, I want background jobs processed reliably so that order lifecycle, notifications, payments, ratings, and earnings are handled asynchronously without blocking API requests.

#### Acceptance Criteria

1. THE order-lifecycle queue SHALL handle AUTO_REJECT and PARTNER_ASSIGNMENT jobs.
2. AUTO_REJECT jobs SHALL fire after 2 minutes if the shop has not accepted the order.
3. PARTNER_ASSIGNMENT jobs SHALL attempt up to 3 times with 30-second partner accept windows.
4. THE notification queue SHALL support high-priority and normal-priority jobs.
5. THE payment-verification queue SHALL process Razorpay webhooks idempotently.
6. THE rating-update queue SHALL debounce recalculations (30-second delay, deduplicated by shopId).
7. THE earnings-split queue SHALL split platform, shop, and partner earnings atomically in a single DB transaction.
8. ALL failed jobs (after max retries) SHALL be persisted to the DLQ table and trigger Slack alerts.

---

### Requirement 9: File Upload (S3 + CloudFront)

**User Story:** As users, I want to upload avatars, shop photos, KYC documents, and review photos securely and efficiently.

#### Acceptance Criteria

1. UPLOADED files SHALL pass magic-byte MIME validation (file-type library), NOT rely on Content-Type headers.
2. SUPPORTED upload types: avatar, shop logo, shop banner, shop photos (max 10), service photo, KYC docs (license, vehicle RC), review photos (max 3), dispute evidence.
3. CLOUDFRONT Origin Access Control SHALL be used — direct S3 URLs shall return 403.
4. KYC documents SHALL be stored at original resolution (no Sharp resizing).
5. MAX file size and format restrictions SHALL be enforced before upload.
6. UPLOAD responses SHALL return the CloudFront URL and the S3 key.

---

### Requirement 10: Device Token / FCM

**User Story:** As the platform, I want to manage device FCM tokens so that push notifications are delivered reliably.

#### Acceptance Criteria

1. DEVICE tokens SHALL be registered on every app open (upsert).
2. TOKENS SHALL be associated with userId, platform, and appVersion.
3. USERS SHALL be unsubSnow to role-based FCM topics (freshpress-customers-{cityId}) on registration.
4. ON logout, THE token SHALL be removed from the database and unsubSnow from topics.
5. TOKEN refresh events (FCM rotation) SHALL be handled automatically via onTokenRefresh.
