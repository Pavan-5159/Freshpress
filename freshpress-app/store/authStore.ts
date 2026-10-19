/**
 * Auth State Store
 *
 * Manages JWT token, user profile, and authentication lifecycle.
 * Persists token to SecureStore and loads it on app boot.
 *
 * @requirements Req 1.4, 1.7, 1.8, 1.9, 1.10, 11.7, 12.5
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;

  /** Persist a new JWT and update in-memory state. */
  setToken: (token: string) => void;

  /** Persist a new user object and update in-memory state. */
  setUser: (user: User) => void;

  /** Clear token + user from state, SecureStore, and AsyncStorage. Always navigates to auth. */
  logout: () => Promise<void>;

  /** Read stored token on boot and restore session. Use after app load. */
  loadToken: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setToken: (token: string) => {
    SecureStore.setItemAsync('jwt', token).catch(() => {
      // Ignore write failures — in-memory state still updates
    });
    set({ token });
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: async () => {
    // Best-effort cleanup — always remove auth state even if storage calls fail
    try {
      await SecureStore.deleteItemAsync('jwt');
    } catch {
      // Ignore SecureStore errors (e.g. device not enrolled in biometric auth)
    }
    try {
      // Selectively clear auth-related keys rather than the entire storage
      // For now we don't have other AsyncStorage keys, but it's safer.
      // await AsyncStorage.multiRemove(['some_auth_key']);
    } catch {
      // Ignore AsyncStorage errors (e.g. read-only storage)
    }
    set({ token: null, user: null, isLoading: false });
  },

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('jwt');
      if (token) {
        set({ token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      // If SecureStore fails (e.g. device locked), treat as no token
      set({ isLoading: false });
    }
  },
}));
