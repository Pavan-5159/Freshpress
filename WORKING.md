# FreshPress - Project Architecture & Working

FreshPress is a comprehensive, on-demand laundry and dry-cleaning service platform. It consists of a mobile application for end-users (customers, delivery agents, and vendors) and a backend REST API that handles all business logic, data persistence, and third-party integrations.

## 1. System Architecture

The platform is split into two primary repositories/folders:
- **`freshpress-app`**: The frontend mobile application built with **React Native** and **Expo**. It uses **Zustand** for state management and **Expo Router** for navigation. 
- **`freshpress-backend`**: The backend server built with **Node.js, Express, and TypeScript**. It uses **Prisma ORM** with a **PostgreSQL** database to manage relational data.

## 2. User Roles

The system supports multiple distinct roles, each with varying access levels and specific workflows:
- **CUSTOMER**: Can browse nearby shops, add items to a cart, place orders, apply coupons, pay via Razorpay/Wallet, and track order status.
- **AGENT**: Delivery personnel responsible for picking up laundry from customers, delivering it to vendors/shops, and bringing clean laundry back to customers.
- **VENDOR / SHOP_OWNER**: Laundry service providers who manage their shop, update service catalogs, accept orders, and process the laundry.
- **ADMIN**: Superusers who manage the entire platform, including users, service zones, global banners, and platform commissions.

## 3. Core Workflows & Features

### A. Shop & Service Discovery (Home Page)
- The app uses the user's location (latitude/longitude) to find the appropriate **City** and **Service Zone**.
- The backend serves localized **Home Banners** and a list of active **Shops** available in the area.
- Each shop defines its own **Service Categories** (e.g., Wash & Fold, Dry Cleaning) and **Items** with specific pricing models (Per Item or Per KG).

### B. Order Placement (Cart & Checkout)
1. **Cart Management:** Customers add specific laundry items to their cart under a particular shop or vendor.
2. **Scheduling:** Customers choose preferred time slots for **Pickup** and **Delivery**.
3. **Offers:** Customers can apply promo codes (**Coupons**) or use their **Wallet** balance.
4. **Checkout:** The system calculates the subtotal, taxes, delivery fees, and discounts to generate the final total.
5. **Payment:** Integrated with **Razorpay**. Payments can also be completed via Cash on Delivery (COD) or Wallet.

### C. Order Fulfillment Lifecycle
Orders transition through several statuses (`OrderStatus` enum in Prisma):
1. **PENDING**: Order placed, waiting for shop/vendor acceptance.
2. **ACCEPTED**: Vendor has confirmed they can process the order.
3. **PICKUP_ASSIGNED**: An **Agent** is assigned to pick up the clothes.
4. **PICKED_UP**: The Agent has collected the clothes (verified via OTP).
5. **IN_PROCESS**: The vendor is currently washing/cleaning the items.
6. **READY_FOR_DELIVERY**: The laundry is clean and ready to be dispatched.
7. **DELIVERY_ASSIGNED**: An Agent is assigned to deliver the clean clothes back to the customer.
8. **DELIVERED**: Clothes handed over to the customer (verified via OTP).

### D. Agent Assignment
- The system automatically or manually assigns pickup/delivery tasks to nearby active agents.
- Agents receive assignments (`OrderAssignment`) and can accept or reject them. 
- Agent location is tracked to provide real-time updates.

### E. Wallet & Subscriptions
- **Wallet System:** Users have a digital wallet where they can top-up funds, receive promotional credits, or get refunds.
- **Subscriptions:** Customers can purchase subscription plans (e.g., fixed number of items per month) to bypass standard per-item pricing.

### F. Notifications & Reviews
- **Notifications:** Automated notifications (Push/In-app) are triggered upon order status changes, payment confirmations, and promotional events.
- **Reviews:** After an order is delivered, customers can rate the service, the agent, and the vendor.

## 4. Backend Technical Details

- **Database Structure:** Managed via Prisma. Highly relational, linking Users -> Orders -> Items -> Shops -> Payments.
- **Authentication:** Uses JWT (JSON Web Tokens) for session management and API security. Phone number verification is typically handled via Firebase Admin/Twilio.
- **Real-time:** Uses **Socket.io** for real-time features like order tracking and agent location updates.
- **Spatial Queries:** Uses PostGIS (via raw Prisma SQL) for radius-based geographic queries to find nearby shops and agents based on `lat` and `lng`.

## 5. Third-Party Integrations
- **Razorpay**: For processing secure online payments.
- **Twilio / Firebase**: For sending SMS OTPs during login and order handovers.
- **Mapbox / Google Maps**: Used in the frontend app (`@maplibre/maplibre-react-native`) for address selection and order tracking maps.
