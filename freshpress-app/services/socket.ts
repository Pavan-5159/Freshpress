/**
 * WebSocket Singleton — real-time order tracking.
 *
 * Manages a single socket.io-client instance with exponential
 * reconnection and auth token injection.
 *
 * @requirements Req 8.3, 8.8
 */

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { WS_URL } from '@/constants/config';
import { Platform } from 'react-native';

// ─── State ────────────────────────────────────────────────────────────────────

let socket: Socket | null = null;

// ─── Factory ──────────────────────────────────────────────────────────────────

/** Return existing socket or create a new one. Does not call `.connect()`. */
export function getSocket(): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  const token = useAuthStore.getState().token;

  socket = io(WS_URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,      // base 1 s
    reconnectionDelayMax: 30000,   // cap at 30 s
    timeout: 20000,
    auth: { token: token ?? undefined },
    extraHeaders: {
      // Helps some Android WebSocket clients
      ...(Platform.OS === 'android' ? { 'User-Agent': 'FreshPressAndroid' } : {}),
    },
  });

  return socket;
}

/** Disconnect and clean up the singleton socket. */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
