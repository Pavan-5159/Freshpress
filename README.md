# FreshPress

FreshPress is a comprehensive laundry service platform consisting of a mobile application and a robust backend API.

## Project Structure

The repository contains two main projects:

- `/freshpress-app`: The mobile application built with React Native and Expo.
- `/freshpress-backend`: The backend API built with Node.js, Express, and Prisma.

## Tech Stack

### Backend (`freshpress-backend`)
- Node.js & Express.js
- TypeScript
- Prisma (ORM)
- Socket.io (for real-time features)
- Authentication: JWT & Firebase Admin
- Integrations: Twilio, Razorpay

### Frontend (`freshpress-app`)
- React Native
- Expo & Expo Router
- TypeScript
- Zustand (State Management)
- Axios

## Getting Started

### Prerequisites
Make sure you have Node.js and npm installed.

### Setting up the Backend
1. Navigate to the backend directory:
   ```bash
   cd freshpress-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables (copy `.env.example` to `.env` and fill it).
4. Run Prisma generation:
   ```bash
   npm run prisma:generate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Setting up the Mobile App
1. Navigate to the app directory:
   ```bash
   cd freshpress-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables (copy `.env.example` to `.env.local` or `.env` and fill it).
4. Start the Expo server:
   ```bash
   npm start
   ```
   *You can scan the QR code with the Expo Go app on your phone, or run it on a virtual emulator by pressing `i` (for iOS) or `a` (for Android).*
