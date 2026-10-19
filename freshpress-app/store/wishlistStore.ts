/**
 * Wishlist State Store with Zustand
 *
 * Manages the customer's wishlist: add, remove, check if in wishlist.
 * Persists to AsyncStorage and rolls back on storage failure.
 *
 * @requirements Req 6.1–6.9
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Shop } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistState {
  /** List of shops in the wishlist. */
  items: Shop[];

  /** Add a shop to the wishlist. */
  addItem: (shop: Shop) => void;

  /** Remove a shop from the wishlist by ID. */
  removeItem: (shopId: string) => void;

  /** Toggle a shop in the wishlist (add if absent, remove if present). */
  toggleItem: (shop: Shop) => void;

  /** Check if a shop is in the wishlist. */
  isInWishlist: (shopId: string) => boolean;

  /** Clear the entire wishlist. */
  clearList: () => void;

  /** Total number of items in the wishlist. */
  totalItems: () => number;
}

const STORAGE_KEY = 'freshpress:wishlist';

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (shop) => {
        const state = get();
        if (state.items.find((item) => item.id === shop.id)) {
          return; // Already present
        }
        set({ items: [...state.items, shop] });
      },

      removeItem: (shopId) => {
        const state = get();
        set({ items: state.items.filter((item) => item.id !== shopId) });
      },

      toggleItem: (shop) => {
        const state = get();
        const exists = state.items.find((item) => item.id === shop.id);
        if (exists) {
          set({ items: state.items.filter((item) => item.id !== shop.id) });
        } else {
          set({ items: [...state.items, shop] });
        }
      },

      isInWishlist: (shopId) => {
        return get().items.some((item) => item.id === shopId);
      },

      clearList: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.length;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
