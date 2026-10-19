# Requirements Document

## Introduction

FreshPress is a customer-facing mobile application built with React Native (Expo Router) that connects customers with local laundry and cloth-pressing service shops. Modelled architecturally on food-delivery platforms (Zomato-style), FreshPress lets customers discover nearby laundry shops, browse service menus and pricing, add items to a cart, place and pay for orders, track delivery in real time, and manage their profile. The app communicates with a backend API Gateway backed by Auth, Orders, Payments, Notify, and Tracking microservices.

## Glossary

- **App**: The FreshPress customer mobile application (React Native / Expo Router).
- **Customer**: An authenticated end-user of the App who places laundry orders.
- **Shop**: A registered laundry or cloth-pressing business listed on the platform.
- **Service Item**: A single laundry service offered by a Shop (e.g., "Shirt – Steam Press", "Jeans – Wash & Fold") with an associated unit price.
- **Cart**: A transient, in-memory + persisted collection of Service Items selected by the Customer before checkout.
- **Order**: A confirmed transaction created after successful payment, with a defined lifecycle.
- **Order Status**: One of the states: `PENDING` → `CONFIRMED` → `PICKED_UP` → `IN_PROGRESS` → `READY` → `OUT_FOR_DELIVERY` → `DELIVERED` → `CANCELLED`.
- **Delivery Partner**: A platform employee or contractor who picks up and delivers laundry.
- **JWT**: JSON Web Token used for authentication and session management.
- **OTP**: One-Time Password sent via SMS for phone-number-based authentication.
- **API Gateway**: The single entry point for all client-to-backend communication, enforcing rate limiting, JWT validation, RBAC, and input validation.
- **Razorpay**: The primary payment gateway used for card, UPI, and wallet payments.
- **WebSocket**: Persistent connection (via socket.io-client) used for real-time order status and GPS tracking updates.
- **Push Notification**: A message delivered via FCM (Firebase Cloud Messaging) and expo-notifications to the Customer's device.
- **Rating**: A 1–5 integer star score given by a Customer for a completed Order.
- **Review**: A text comment (up to 500 characters) optionally accompanying a Rating.
- **Home Feed**: The default landing screen displaying nearby Shops, promotional banners, and service-type filters.
- **Floating Cart Bar**: A persistent UI element displayed above the bottom tab bar whenever the Cart contains at least one item, showing item count and a Checkout button.
- **Bottom Tab Navigator**: The primary navigation container with four tabs: Home, Search, Orders, Profile.
- **GPS**: Location data obtained via expo-location used to determine the Customer's current position.
- **Secure Store**: expo-secure-store used to persist the JWT token securely on device.

---

## Requirements

### Requirement 1: Phone-Number Authentication

**User Story:** As a Customer, I want to sign up and log in using my phone number and OTP, so that I can access the app securely without needing a password.

#### Acceptance Criteria

1. THE App SHALL display a phone-number entry screen as the first screen for unauthenticated users.
2. WHEN a Customer submits a valid 10-digit phone number, THE App SHALL request the API Gateway to send an OTP SMS to that number within 5 seconds.
3. WHEN the OTP SMS is requested, THE App SHALL display a 6-box OTP entry screen rendered using the `react-native-otp-entry` component.
4. WHEN the Customer enters a correct 6-digit OTP within 5 minutes, THE App SHALL receive a JWT from the API Gateway and store it in expo-secure-store.
5. IF the Customer enters an incorrect OTP, THEN THE App SHALL display an inline error message and allow re-entry without navigating away.
6. IF the OTP expires (5-minute window elapsed), THEN THE App SHALL display an expiry message and enable a "Resend OTP" action.
7. WHEN the OTP is verified successfully, THE App SHALL navigate the Customer to the Home Feed screen.
8. WHEN a Customer relaunches the App, THE App SHALL read the stored JWT from expo-secure-store and, if valid, navigate directly to the Home Feed screen without requiring re-authentication.
9. IF the stored JWT is expired or absent, THEN THE App SHALL redirect the Customer to the phone-number entry screen.
10. WHEN a Customer taps "Log Out", THE App SHALL delete the JWT from expo-secure-store and navigate to the phone-number entry screen.
11. IF the Customer submits a phone number that is not exactly 10 digits or contains non-numeric characters, THEN THE App SHALL display an inline validation error and not send an OTP request.
12. IF the API Gateway returns an error when sending the OTP SMS, THEN THE App SHALL display an error message describing the failure and enable a "Retry" action on the phone-number entry screen.
13. WHEN the "Resend OTP" action is triggered, THE App SHALL enforce a 30-second cooldown before allowing another resend, displaying a countdown timer during the cooldown period.

---

### Requirement 2: Location Permission and Home Feed

**User Story:** As a Customer, I want to see laundry shops near my current location on the Home Feed, so that I can quickly find convenient services.

#### Acceptance Criteria

1. WHEN a Customer opens the Home Feed for the first time, THE App SHALL request GPS location permission via expo-location.
2. IF the Customer grants location permission, THEN THE App SHALL obtain the current GPS coordinates within 10 seconds and send them to the API Gateway to fetch Shops within a 50 km radius; IF GPS acquisition exceeds 10 seconds, THEN THE App SHALL fall back to displaying the manual city/area search input.
3. IF the Customer denies location permission, THEN THE App SHALL display a manual city/area search input (max 100 characters) and fetch Shops based on the entered area.
4. WHEN Shops are fetched, THE App SHALL display them as vertically scrollable cards on the Home Feed, each showing the Shop name, up to 3 primary service types, average Rating, estimated turnaround time, and distance in kilometres rounded to 1 decimal place. WHERE some card fields are not yet available, THE App SHALL display skeleton loaders for those fields until data is received.
5. THE Home Feed SHALL display a horizontally scrollable promotional banner carousel at the top of the screen, shown immediately when the Home Feed loads regardless of whether Shop data has been fetched.
6. THE Home Feed SHALL display a horizontally scrollable row of service-type filter chips (e.g., "Wash & Fold", "Dry Clean", "Steam Press", "Shoe Cleaning") below the banner carousel, shown immediately when the Home Feed loads regardless of whether Shop data has been fetched.
7. WHEN the Customer taps a service-type filter chip, THE App SHALL re-fetch and display only the Shops that offer that service type.
8. WHEN the Customer pulls down on the Home Feed, THE App SHALL refresh the Shop list and promotional banners while preserving any currently active service-type filter.
9. WHILE the Shop list is loading, THE App SHALL display exactly 4 skeleton placeholder cards.
10. IF the Shop list fetch fails, THEN THE App SHALL display a non-technical error message and a "Retry" action, and hide the skeleton cards.

---

### Requirement 3: Shop Discovery and Search

**User Story:** As a Customer, I want to search for laundry shops by name or service type, so that I can find a specific shop or service quickly.

#### Acceptance Criteria

1. WHEN the Customer opens the Search tab, THE App SHALL display a search input field and, if any recent searches exist, a list of up to 5 recent searches below the input.
2. WHEN the Customer types at least 2 characters in the search input, THE App SHALL debounce the input for 300 ms and then send a search query to the API Gateway, displaying up to 20 matching Shop results.
3. WHEN search results are returned, THE App SHALL display each matching Shop with its name, up to 3 primary service types, average Rating on a 1.0–5.0 scale, and distance in kilometres.
4. WHEN the Customer taps a search result, THE App SHALL navigate to the Shop Detail screen for that Shop.
5. WHEN a search query is executed successfully, THE App SHALL persist that query to @react-native-async-storage/async-storage, keeping only the 5 most recent unique queries; WHEN the search input is empty, THE App SHALL display the persisted recent searches.
6. WHEN the Customer taps a recent search entry, THE App SHALL populate the search input with that query and execute the search.
7. IF the search returns no results, THEN THE App SHALL display a "No shops found" message with a suggestion to try different keywords.
8. IF the search API request fails, THEN THE App SHALL display a non-technical error message and a "Retry" action.

---

### Requirement 4: Shop Detail and Service Menu

**User Story:** As a Customer, I want to view a shop's full service menu with pricing and reviews, so that I can make an informed decision before placing an order.

#### Acceptance Criteria

1. WHEN the Customer navigates to a Shop Detail screen, THE App SHALL display the Shop name, cover photo, average Rating, total review count, address, operating hours, and estimated turnaround time in hours.
2. WHEN the Shop Detail screen loads, THE App SHALL display the Shop's Service Items grouped by category (e.g., "Shirts", "Pants", "Ethnic Wear", "Bedding", "Shoes") in a scrollable list.
3. WHEN the Service Item list is displayed, each item SHALL show the item name, description (max 150 characters), unit price in INR, and an Add button.
4. WHEN the Customer taps the Add button on a Service Item, THE App SHALL add one unit of that item to the Cart (setting its quantity to 1) and update the item row to show a quantity stepper (− quantity +).
5. WHEN the Customer taps + on a quantity stepper, THE App SHALL increment the quantity of that Service Item in the Cart by 1.
6. WHEN the Customer taps − on a quantity stepper and the quantity is greater than 1, THE App SHALL decrement the quantity by 1.
7. WHEN the Customer taps − on a quantity stepper and the quantity is 1, THE App SHALL remove that Service Item from the Cart and revert the row to show the Add button.
8. THE App SHALL display a Reviews tab on the Shop Detail screen showing the 20 most recent Customer Ratings and Reviews, each with the reviewer's name, star rating, date, and review text.
9. WHERE a Shop has more than 20 reviews, THE App SHALL provide a "Load more" action to fetch the next 20 reviews; IF the "Load more" request fails, THEN THE App SHALL display an error message and re-enable the "Load more" action.
10. IF the Cart is non-empty and the Customer taps Add on a Service Item from a different Shop, THEN THE App SHALL display a confirmation dialog warning that adding items from a different shop will clear the existing Cart; IF the confirmation dialog cannot be shown, THEN THE App SHALL block the add operation.
11. IF the Customer confirms replacing the Cart, THEN THE App SHALL clear the existing Cart and add the new Service Item.
12. IF the Customer dismisses or cancels the confirmation dialog, THEN THE App SHALL keep the existing Cart unchanged and not add the new Service Item.
13. IF the Shop Detail screen fails to load, THEN THE App SHALL display a non-technical error message and a "Retry" action.
14. IF the Reviews tab fails to load, THEN THE App SHALL display a non-technical error message and a "Retry" action within the Reviews tab area.

---

### Requirement 5: Cart Management

**User Story:** As a Customer, I want to review and adjust my cart before placing an order, so that I can confirm the correct items and quantities.

#### Acceptance Criteria

1. WHEN the Cart contains at least one Service Item, THE App SHALL display the Floating Cart Bar above the Bottom Tab Navigator showing the total item count and total price.
2. WHEN the Customer taps the Floating Cart Bar or the Checkout button, THE App SHALL navigate to the Cart screen.
3. WHILE the Cart screen is displayed, THE App SHALL show each Service Item in the Cart with its name, unit price, a quantity stepper (min 1, max 99), and line-total price.
4. WHILE the Cart screen is displayed, THE App SHALL show the order subtotal, applicable tax amount calculated by applying the prevailing tax rate to the subtotal, and the grand total in INR.
5. WHEN the Customer changes a Service Item quantity on the Cart screen, THE App SHALL recalculate and display the updated subtotal, tax, and grand total within 300 ms.
6. WHEN all items are removed from the Cart, THE App SHALL hide the Floating Cart Bar and navigate back to the Home Feed.
7. WHILE the Cart screen is displayed, THE App SHALL show a "Pickup Instructions" free-text input field (max 200 characters) where the Customer can add notes for the Shop or Delivery Partner.
8. WHILE the Cart screen is displayed, THE App SHALL show the Customer's saved delivery address; IF no saved address exists, THEN THE App SHALL display a prompt to add an address before proceeding.
9. WHILE the Cart screen is displayed, THE App SHALL show a "Proceed to Checkout" button that navigates to the Address and Payment screen.
10. IF the Customer taps "Proceed to Checkout" and no delivery address is saved, THEN THE App SHALL remain on the Cart screen and display an inline error indicating that a delivery address is required.

---

### Requirement 6: Address Management

**User Story:** As a Customer, I want to save and manage delivery addresses, so that I don't have to re-enter my address for every order.

#### Acceptance Criteria

1. THE App SHALL allow Customers to save up to 5 delivery addresses labelled as "Home", "Work", or a custom label of up to 50 characters.
2. WHEN the Customer saves a new address, THE App SHALL geocode the address using expo-location and store the latitude, longitude, and formatted address string; IF geocoding fails, THEN THE App SHALL display an error message and not save the address.
3. WHEN the Customer designates a saved address as the default, THE App SHALL mark that address as the default delivery address and clear the default designation from any previously default address.
4. WHEN placing an order, THE App SHALL pre-populate the delivery address with the Customer's default address. IF the Customer has no saved address, THEN THE App SHALL require the Customer to add an address before allowing the order to proceed.
5. WHEN the Customer taps "Change Address" on the Cart screen, THE App SHALL display the saved addresses list and allow selection.
6. WHEN the Customer taps "Add New Address" on the address selection screen, THE App SHALL display an address entry form with map pin support via react-native-maps.
7. WHEN the address entry form is displayed, THE App SHALL allow the Customer to drag the map pin to set the precise delivery location.
8. WHEN a new address is saved, THE App SHALL persist it to the API Gateway and local @react-native-async-storage/async-storage cache; IF either the API Gateway call or the local cache write fails, THEN THE App SHALL display an error message and not confirm the save.
9. WHEN the Customer deletes a saved address that is not the only address on record, THE App SHALL remove the address from the API Gateway and local cache; IF the deleted address was the default, THEN THE App SHALL automatically designate the most recently added remaining address as the new default.

---

### Requirement 7: Checkout and Payment

**User Story:** As a Customer, I want to pay for my order securely using UPI, card, or wallet, so that I can complete a purchase without leaving the app.

#### Acceptance Criteria

1. WHEN the Customer taps "Proceed to Checkout", THE App SHALL display a summary of the Cart items, delivery address, and grand total before payment.
2. WHEN the Customer taps "Pay Now", THE App SHALL invoke the Razorpay checkout sheet with the grand total converted to paise (grand total INR × 100).
3. WHEN Razorpay returns a successful payment response, THE App SHALL send the payment verification token to the API Gateway to create the Order.
4. WHEN the Order is created successfully, THE App SHALL clear the Cart and navigate to the Order Confirmation screen showing the Order ID, estimated turnaround time in minutes, and a success animation.
5. IF the Razorpay payment fails or is cancelled by the Customer, THEN THE App SHALL return to the Cart screen and display an error banner describing the failure reason.
6. IF the API Gateway rejects the Order creation (e.g., Shop is closed), THEN THE App SHALL display an error dialog with the rejection reason and keep the Cart intact.
7. THE App SHALL support the following Razorpay payment methods: UPI, credit/debit card, and supported wallets.
8. WHEN a payment attempt is in progress, THE App SHALL display a loading indicator and disable the "Pay Now" button and all navigation actions to prevent duplicate submissions.
9. IF a network error or timeout occurs during payment verification (step 3), THEN THE App SHALL return the Customer to the Cart screen and display an error banner advising them to check their order status before retrying.

---

### Requirement 8: Order Lifecycle Tracking

**User Story:** As a Customer, I want to see real-time updates on my order's status and the delivery partner's location, so that I know when my laundry will be picked up and delivered.

#### Acceptance Criteria

1. THE App SHALL display an Orders tab listing all past and active Orders for the Customer, sorted by creation date descending.
2. WHEN the Customer taps an Order, THE App SHALL navigate to the Order Detail screen showing the Order ID, items, total price, payment method, current Order Status, and a status timeline.
3. WHILE the Order Detail screen is displayed, THE App SHALL maintain a WebSocket connection via socket.io-client to receive real-time Order Status updates.
4. WHEN an Order Status update is received over WebSocket, THE App SHALL update the status timeline and current status indicator without requiring a screen refresh.
5. IF the Order Status is `OUT_FOR_DELIVERY`, THEN THE App SHALL display a map view via react-native-maps showing the Delivery Partner's real-time GPS location and the Customer's delivery address; IF the Delivery Partner's GPS location is unavailable, THEN THE App SHALL display the map with only the Customer's delivery address pinned.
6. WHEN the Delivery Partner's GPS coordinates are updated over WebSocket, THE App SHALL animate the Delivery Partner map marker to the new position within 500 ms.
7. WHEN the Order Status changes to `DELIVERED`, THE App SHALL prompt the Customer to rate the order and optionally leave a Review.
8. IF the WebSocket connection is interrupted, THEN THE App SHALL attempt reconnection with exponential backoff (base 1 s, cap 30 s) up to 5 retries and display a "Reconnecting…" indicator during the reconnection window.
9. IF the Order Status is `PENDING` or `CONFIRMED`, THEN THE App SHALL display a "Cancel Order" action on the Order Detail screen.
10. IF the Customer cancels an Order, THEN THE App SHALL reflect the `CANCELLED` status within 1 second in the UI and initiate a refund workflow via the API Gateway.
11. WHEN the Customer taps "Cancel Order", THE App SHALL send the cancellation request to the API Gateway.
12. IF the cancellation API request fails, THEN THE App SHALL display an error message and re-enable the "Cancel Order" action.

---

### Requirement 9: Push Notifications

**User Story:** As a Customer, I want to receive push notifications for key order events, so that I stay informed without having to keep the app open.

#### Acceptance Criteria

1. WHEN the Customer logs in for the first time, THE App SHALL request push notification permission via expo-notifications; IF the Customer denies permission, THEN THE App SHALL continue without push notifications and not re-request permission on subsequent logins.
2. WHEN permission is granted, THE App SHALL register the device's FCM token with the API Gateway via @react-native-firebase/messaging.
3. WHEN a Push Notification is received while the App is in the foreground, THE App SHALL display the in-app notification banner.
3a. WHEN an in-app notification banner is displayed, THE App SHALL keep it visible for 4 seconds unless the Customer dismisses it earlier by tapping a close action.
4. WHEN a Push Notification is received while the App is in the background or closed, THE App SHALL display a system notification via expo-notifications.
5. WHEN the Customer taps a system notification related to an Order, THE App SHALL navigate directly to the Order Detail screen for that Order; IF the Order ID in the notification is invalid or cannot be resolved, THEN THE App SHALL navigate to the Orders tab list screen.
6. WHEN a relevant Order event occurs, THE App SHALL display Push Notifications for the following events: Order Confirmed, Order Picked Up, Order Ready, Out for Delivery, and Order Delivered; notifications for event types the Customer has disabled SHALL be suppressed and not delivered to the device.
7. THE App SHALL allow the Customer to enable or disable Push Notifications per event type from the Profile settings screen; all event types SHALL be enabled by default.

---

### Requirement 10: Ratings and Reviews

**User Story:** As a Customer, I want to rate and review completed orders, so that I can help other customers choose quality shops.

#### Acceptance Criteria

1. WHEN an Order Status changes to `DELIVERED`, THE App SHALL display a Rating prompt on the Order Detail screen.
2. THE Rating prompt SHALL present a 1–5 star selector and an optional free-text Review input (max 500 characters).
3. WHEN the Customer submits a Rating, THE App SHALL send the Rating and optional Review to the API Gateway and, on success, update the Shop's average Rating in the local cache.
4. IF the Customer dismisses the Rating prompt without submitting, THE App SHALL re-display the prompt the next time the Customer opens the Order Detail screen (including after app restart), until a Rating is submitted.
5. THE App SHALL allow the Customer to attach up to 3 photos in JPEG or PNG format, each no larger than 5 MB, to a Review using expo-image-picker.
6. WHEN a Review with photos is submitted, THE App SHALL upload the photos to S3 via the API Gateway before sending the Review payload; IF any photo upload fails, THEN THE App SHALL display an error message and not submit the Review.
7. THE App SHALL display the Customer's submitted Rating and Review on the Shop Detail screen's Reviews tab, sorted most recent first.
8. IF the Rating or Review submission fails, THEN THE App SHALL display an error message and allow the Customer to retry without losing the entered content.

---

### Requirement 11: Customer Profile Management

**User Story:** As a Customer, I want to manage my profile, saved addresses, and order history, so that I have a complete view of my account.

#### Acceptance Criteria

1. THE Profile tab SHALL display the Customer's name, phone number, and profile photo; IF no profile photo has been set, THE App SHALL display a default avatar placeholder.
2. WHEN the Customer taps "Edit Profile", THE App SHALL display an editable form pre-populated with the Customer's current name (max 50 characters) and profile photo, with Save and Cancel actions.
3. WHEN the Customer updates the profile photo, THE App SHALL launch expo-image-picker to select a JPEG or PNG image no larger than 5 MB, upload it to S3 via the API Gateway, and update the displayed profile photo.
4. THE Profile tab SHALL include a navigable "Order History" section that lists all past Orders with their status, total price, and order date; IF no past Orders exist, THE App SHALL display an empty-state message.
5. THE Profile tab SHALL include a navigable "Saved Addresses" section that allows the Customer to view, add, edit, and delete saved addresses as per Requirement 6.
6. THE Profile tab SHALL include a "Notifications" settings section that allows the Customer to toggle push notification preferences per event type as per Requirement 9.
7. WHEN the Customer taps "Log Out", THE App SHALL attempt to clear the JWT from expo-secure-store, then clear the local @react-native-async-storage/async-storage cache, and navigate to the phone-number entry screen; WHERE individual cleanup steps fail, THE App SHALL continue executing the remaining steps and still navigate to the phone-number entry screen.
8. IF the profile photo upload to S3 fails, THEN THE App SHALL display an error message and retain the previous profile photo.
9. THE Profile tab SHALL display the App version number and a "Help & Support" link that opens the platform's support chat or email.

---

### Requirement 12: Offline and Error Resilience

**User Story:** As a Customer, I want the app to handle network failures gracefully, so that I don't lose my cart or encounter crashes when connectivity is poor.

#### Acceptance Criteria

1. WHEN the device has no internet connection, THE App SHALL display a persistent "No Internet Connection" banner and disable all API-dependent actions (visually grayed out and non-interactive).
2. THE App SHALL persist the current Cart state to @react-native-async-storage/async-storage after every Cart mutation; IF the storage write fails, THEN THE App SHALL roll back the mutation, keep the Cart in its prior state, and display a non-technical error message to the Customer.
3. WHEN the app is relaunched after a crash or restart, THE App SHALL restore the Cart from @react-native-async-storage/async-storage if the stored Cart contained at least 1 item at the last app close.
4. WHEN an API request fails with a 5xx error, THE App SHALL display a non-technical error description and a visible "Retry" action.
5. WHEN an API request fails with a 401 Unauthorized response, THE App SHALL clear the stored JWT and redirect the Customer to the phone-number entry screen.
6. THE App SHALL implement a request timeout of 10 seconds for all API calls; IF a request times out, THEN THE App SHALL display a timeout error message and a visible "Retry" action.
