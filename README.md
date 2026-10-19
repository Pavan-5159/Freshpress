# FreshPress - Complete Multi-App Laundry & Dry-Cleaning Platform

FreshPress is a modern on-demand laundry and dry-cleaning service platform. It consists of four React Native (Expo) mobile applications, a Node.js/Express TypeScript backend, a web storefront, and shared design assets.

---

## 📁 Repository Structure

```
project-cloth/
├── freshpress-backend/       # REST API & Socket.io Server (Node.js, Express, TypeScript, Prisma)
├── freshpress-app/           # Customer Mobile App (React Native, Expo SDK 57, Expo Router)
├── freshpress-agent-app/     # Delivery Agent App (Expo SDK 57, Live Tracking, Task Pickup)
├── freshpress-vendor-app/    # Vendor / Laundry Partner App (Expo SDK 57, Order Processing)
├── freshpress-admin-app/     # Superadmin Platform App (Expo SDK 57, System Operations)
├── lovable/                  # Web Showcase & Landing Storefront (React 18, Vite, Tailwind)
├── newimages/                # Graphic banners and promotional images
├── img/                      # Category icons and brand imagery
├── SETUP_GUIDE.md            # Step-by-step agent & developer execution checklist
├── WORKING.md                # Comprehensive architecture and workflow documentation
└── README.md                 # Project quickstart and overview
```

> 🤖 **Looking to set this up with an AI agent or on a new computer?**  
> Check out the complete step-by-step checklist in [SETUP_GUIDE.md](file:///d:/project-cloth/SETUP_GUIDE.md).

---

## 🚀 Running on Another Laptop / New Machine

Follow these step-by-step instructions to get the complete project running on a new computer.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Pavan-5159/Freshpress.git
cd Freshpress
```

### Step 2: Prerequisites
Make sure the new laptop has installed:
- [Node.js](https://nodejs.org/) (v18 or v20 LTS recommended)
- [PostgreSQL](https://www.postgresql.org/) (or [Docker Desktop](https://www.docker.com/) to run PostgreSQL)
- [Git](https://git-scm.com/)
- Expo Go app on your phone (optional, for testing on real devices)

---

### Step 3: Setting Up the Database & Backend

1. **Navigate to backend**:
   ```bash
   cd freshpress-backend
   npm install
   ```

2. **Start PostgreSQL**:
   - If using Docker:
     ```bash
     docker-compose up -d
     ```
   - If using local PostgreSQL, ensure PostgreSQL is running and update `DATABASE_URL` in [`freshpress-backend/.env`](file:///d:/project-cloth/freshpress-backend/.env) if your port/password differ:
     ```env
     DATABASE_URL="postgresql://freshpress:freshpress@localhost:5433/freshpress?schema=public"
     ```

3. **Apply Database Migrations & Seed Data**:
   ```bash
   npx prisma migrate dev
   # or to sync schema:
   npx prisma db push
   # seed initial data (shops, categories, admin):
   npm run prisma:seed
   ```

4. **Start the Backend Server**:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:3000` (API endpoint: `http://localhost:3000/api`).*

---

### Step 4: Running the Mobile Apps

Open a new terminal for the app you want to run:

#### 1. Customer App (`freshpress-app`)
```bash
cd freshpress-app
npm install
npx expo start
```

#### 2. Delivery Agent App (`freshpress-agent-app`)
```bash
cd freshpress-agent-app
npm install
npx expo start
```

#### 3. Vendor / Shop App (`freshpress-vendor-app`)
```bash
cd freshpress-vendor-app
npm install
npx expo start
```

#### 4. Superadmin App (`freshpress-admin-app`)
```bash
cd freshpress-admin-app
npm install
npx expo start
```

> **Testing on a Physical Device**:
> In the `.env.local` of each app, replace `localhost` with your laptop's local network IP address (e.g. `http://192.168.1.X:3000/api`) so your phone can reach the backend over Wi-Fi.

---

### Step 5: Running the Web Showcase (`lovable`)
```bash
cd lovable
npm install
npm run dev
```

---

## ⚙️ Environment Variables Summary

All pre-configured `.env` and `.env.local` files are included in the repository for local development:

- [`freshpress-backend/.env`](file:///d:/project-cloth/freshpress-backend/.env): Server port, JWT secrets, database connection string, and SMS/OTP configurations.
- [`freshpress-app/.env.local`](file:///d:/project-cloth/freshpress-app/.env.local): API endpoint, WebSocket URL, Razorpay key.
- [`freshpress-agent-app/.env.local`](file:///d:/project-cloth/freshpress-agent-app/.env.local): API endpoint, WebSocket URL.
- [`freshpress-vendor-app/.env.local`](file:///d:/project-cloth/freshpress-vendor-app/.env.local): API endpoint, WebSocket URL.
- [`freshpress-admin-app/.env.local`](file:///d:/project-cloth/freshpress-admin-app/.env.local): API endpoint, WebSocket URL.

For detailed architecture, state management patterns, and order lifecycle workflows, see [WORKING.md](file:///d:/project-cloth/WORKING.md).
