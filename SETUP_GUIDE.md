# FreshPress - Machine & Agent Setup Guide

This guide is designed for developers and AI agents to set up, initialize, and run the entire **FreshPress** platform on a new machine or fresh environment.

---

## 📋 System Overview

FreshPress is a monorepo consisting of:
1. **[`freshpress-backend`](file:///d:/project-cloth/freshpress-backend)**: REST & WebSocket API (Node.js, Express, TypeScript, Prisma, PostgreSQL).
2. **[`freshpress-app`](file:///d:/project-cloth/freshpress-app)**: Customer Mobile App (React Native, Expo SDK 57, Expo Router).
3. **[`freshpress-agent-app`](file:///d:/project-cloth/freshpress-agent-app)**: Delivery Agent App (Live GPS dispatch, OTP verification).
4. **[`freshpress-vendor-app`](file:///d:/project-cloth/freshpress-vendor-app)**: Shop Partner App (Order fulfillment, garment processing).
5. **[`freshpress-admin-app`](file:///d:/project-cloth/freshpress-admin-app)**: Superadmin Portal (Service zones, banners, commissions).
6. **[`lovable`](file:///d:/project-cloth/lovable)**: Web Storefront Showcase (React 18, Vite, Tailwind CSS).

---

## ⚙️ Prerequisites

Ensure the target machine has the following installed:
- **Node.js**: v18 or v20 LTS (`node -v`)
- **npm**: v9 or higher (`npm -v`)
- **Git**: (`git -v`)
- **PostgreSQL**: Running natively on local port `5432` or `5433`, OR **Docker Desktop** to run via container.

---

## 🚀 Execution Checklist for Agents

Execute the following steps in sequence:

### Step 1: Clone the Repository
```bash
git clone https://github.com/Pavan-5159/Freshpress.git
cd Freshpress
```

*(Note: Pre-configured `.env` and `.env.local` files are already committed to the repository for immediate local execution).*

---

### Step 2: Database Initialization

#### Option A: Using Docker (Recommended)
```bash
cd freshpress-backend
docker-compose up -d
```

#### Option B: Using Native PostgreSQL
1. Create a PostgreSQL database named `freshpress`:
   ```sql
   CREATE DATABASE freshpress;
   ```
2. Verify the `DATABASE_URL` in [`freshpress-backend/.env`](file:///d:/project-cloth/freshpress-backend/.env):
   ```env
   DATABASE_URL="postgresql://freshpress:freshpress@localhost:5433/freshpress?schema=public"
   ```
   *(If your local PostgreSQL runs on port `5432` with user `postgres`, change the URL to: `postgresql://postgres:<your_password>@localhost:5432/freshpress?schema=public`)*

---

### Step 3: Backend Setup & Seed

Open a terminal in `freshpress-backend`:

```bash
cd freshpress-backend

# 1. Install dependencies
npm install

# 2. Push schema to PostgreSQL database
npx prisma db push

# 3. Seed initial shops, categories, prices, and banners
npm run prisma:seed

# 4. Start the backend server in development mode
npm run dev
```

#### ✅ Verification
The backend starts at `http://localhost:3000`. Test that the server is alive:
```bash
curl http://localhost:3000/api/home/shops
```
*(Should return a JSON object with active laundry shops).*

---

### Step 4: Run the Mobile Apps

Each mobile application is built with Expo. Open a **new terminal** for each app you wish to launch:

#### 1. Customer App (`freshpress-app`)
```bash
cd freshpress-app
npm install
npx expo start
```
- Press **`w`** in the terminal to open the app in a web browser (`http://localhost:8081`).
- Press **`a`** to launch in an Android Emulator.

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

---

### Step 5: Testing on Physical Mobile Devices (Expo Go)

When testing mobile apps on a real phone via the Expo Go app:
1. Ensure your laptop and phone are on the **same Wi-Fi network**.
2. Find your laptop's local IPv4 address (e.g., `ipconfig` on Windows or `ifconfig` on macOS/Linux).
3. In the mobile app's `.env.local` file, replace `localhost` with your LAN IP:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.50:3000/api
   EXPO_PUBLIC_WS_URL=ws://192.168.1.50:3000
   ```
4. Restart the Expo packager: `npx expo start -c` (clears cache).

---

### Step 6: Run the Web Storefront (`lovable`)

```bash
cd lovable
npm install
npm run dev
```
- Access the web showcase at `http://localhost:5173`.

---

## 🔑 Development Authentication & Test Logins

- **OTP Behavior in Development**:
  In `NODE_ENV=development`, when requesting an OTP for any phone number, the backend automatically logs the OTP in the backend console and returns it directly in the API response under `devOtp`:
  ```json
  {
    "message": "OTP sent successfully",
    "success": true,
    "devOtp": "123456"
  }
  ```
  *(No external Twilio SMS credits required for local testing).*

- **Pre-seeded Accounts**:
  - `+919876500001` (Ramesh Kumar - FreshPress Express Shop Owner)
  - `+919876500002` (Priya Sharma - CleanWave Laundry Shop Owner)
  - `+919876500003` (Suresh Patel - FabricCare DryCleaners Shop Owner)
  - Any 10-digit customer phone number (e.g., `+919999999999`) will automatically create a new customer account upon first OTP verification.

---

## 🛠️ Common Troubleshooting

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| `PrismaClientInitializationError: Can't reach database server` | PostgreSQL is not running or port mismatch. | Verify PostgreSQL is running. Check whether it is on port `5432` or `5433` and update `DATABASE_URL` in `freshpress-backend/.env`. |
| `Network Error` or `AxiosError` in Mobile App | App cannot reach `localhost:3000` from physical phone. | Update `.env.local` to use your computer's local Wi-Fi IP address instead of `localhost`. |
| Port `3000` is already in use | Another process is holding port 3000. | Kill the process using port 3000 (`Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess \| Stop-Process` on Windows) or change `PORT=3001` in `freshpress-backend/.env`. |
| `crypto` or Metro bundling warnings | Cache mismatch after moving folders. | Run `npx expo start -c` to clear Metro bundler cache. |

---

## 📦 Git Commands Reference

To commit and push new updates:
```bash
git add .
git commit -m "Describe your changes"
git push
```
