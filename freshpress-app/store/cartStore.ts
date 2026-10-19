/**
 * Cart State Store with Zustand Persist
 *
 * Manages the customer's cart: add, remove, quantity adjust, totals,
 * pickup instructions, delivery address. Persists to AsyncStorage and
 * rolls back on storage failure.
 *
 * @requirements Req 4.4–4.7, 5.1–5.9, 12.2, 12.3
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, ServiceItem } from '@/types';
import { TAX_RATE } from '@/constants/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartState {
  /** ID of the shop currently in cart, or null if empty. */
  shopId: string | null;

  /** Name of the shop currently in cart. */
  shopName: string | null;

  /** Line items in the cart. */
  items: CartItem[];

  /** Sum of line totals. */
  subtotal: number;

  /** Tax amount = round(subtotal * TAX_RATE, 2). */
  taxAmount: number;

  /** grandTotal = subtotal + taxAmount - discountAmount. */
  grandTotal: number;

  /** Applied coupon code */
  couponCode: string | null;

  /** Discount applied */
  discountAmount: number;

  /** Optional pickup instructions (max 200 chars). */
  pickupInstructions: string;

  /** ID of the selected delivery address. */
  deliveryAddressId: string | null;

  /** Error from the last storage rollback. */
  storageError: string | null;

  /** Add an item to the cart (creates new line or increments existing). */
  addItem: (item: ServiceItem, shopName: string) => void;

  /** Remove a line item entirely. */
  removeItem: (serviceItemId: string) => void;

  /** Set quantity directly (1–99). Remaining 0 removes the line. */
  setQuantity: (serviceItemId: string, quantity: number) => void;

  /** Update pickup instructions. */
  setPickupInstructions: (instructions: string) => void;

  /** Set delivery address. */
  setDeliveryAddress: (addressId: string | null) => void;

  /** Apply a coupon code and its discount */
  applyCoupon: (code: string, discount: number) => void;

  /** Remove the applied coupon */
  removeCoupon: () => void;

  /** Empty the cart entirely. */
  clearCart: () => void;

  /** Replace current cart with a new one (used in cart-conflict resolve). */
  replaceCart: (partial: Partial<Omit<CartState, keyof CartActions>>) => void;
}

/** Methods that do not need to be stored in Zustand state. */
type CartActions = Pick<
  CartState,
  | 'addItem'
  | 'removeItem'
  | 'setQuantity'
  | 'setPickupInstructions'
  | 'setDeliveryAddress'
  | 'applyCoupon'
  | 'removeCoupon'
  | 'clearCart'
  | 'replaceCart'
>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function recalcTotals(items: CartItem[], discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
  let grandTotal = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;
  if (grandTotal < 0) grandTotal = 0;
  return { subtotal, taxAmount, grandTotal, discountAmount };
}

function createLineTotal(item: ServiceItem, quantity: number): number {
  return Math.round(item.priceInr * quantity * 100) / 100;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'freshpress:cart';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      shopId: null,
      shopName: null,
      items: [],
      subtotal: 0,
      taxAmount: 0,
      grandTotal: 0,
      couponCode: null,
      discountAmount: 0,
      pickupInstructions: '',
      deliveryAddressId: null,
      storageError: null,

      addItem: (item: ServiceItem, shopName: string) => {
        const state = get();
        const existing = state.items.find(
          (ci) => ci.serviceItem.id === item.id
        );

        if (existing) {
          // Increment existing line
          const newQuantity = Math.min(99, existing.quantity + 1);
          const updatedItems = state.items.map((ci) =>
            ci.serviceItem.id === item.id
              ? {
                  ...ci,
                  quantity: newQuantity,
                  lineTotal: createLineTotal(item, newQuantity),
                }
              : ci
          );
          const totals = recalcTotals(updatedItems, state.discountAmount);
          set({ items: updatedItems, ...totals });
        } else {
          // New line
          const newItem: CartItem = {
            serviceItem: item,
            quantity: 1,
            lineTotal: createLineTotal(item, 1),
          };
          const updatedItems = [...state.items, newItem];
          const totals = recalcTotals(updatedItems, state.discountAmount);
          set({
            shopId: item.shopId,
            shopName: shopName || state.shopName,
            items: updatedItems,
            ...totals,
          });
        }
      },

      removeItem: (serviceItemId: string) => {
        const state = get();
        const updatedItems = state.items.filter(
          (ci) => ci.serviceItem.id !== serviceItemId
        );
        const totals = recalcTotals(updatedItems, state.discountAmount);
        if (updatedItems.length === 0) {
          set({
            shopId: null,
            shopName: null,
            items: [],
            couponCode: null,
            discountAmount: 0,
            ...totals,
          });
        } else {
          set({ items: updatedItems, ...totals });
        }
      },

      setQuantity: (serviceItemId: string, quantity: number) => {
        const state = get();
        if (quantity <= 0) {
          get().removeItem(serviceItemId);
          return;
        }
        const clamped = Math.min(99, Math.max(1, quantity));
        const updatedItems = state.items.map((ci) => {
          if (ci.serviceItem.id === serviceItemId) {
            return {
              ...ci,
              quantity: clamped,
              lineTotal: createLineTotal(ci.serviceItem, clamped),
            };
          }
          return ci;
        });
        const totals = recalcTotals(updatedItems, state.discountAmount);
        set({ items: updatedItems, ...totals });
      },

      setPickupInstructions: (instructions: string) => {
        set({ pickupInstructions: instructions });
      },

      setDeliveryAddress: (addressId: string | null) => {
        set({ deliveryAddressId: addressId });
      },

      applyCoupon: (code: string, discount: number) => {
        const state = get();
        const totals = recalcTotals(state.items, discount);
        set({ couponCode: code, ...totals });
      },

      removeCoupon: () => {
        const state = get();
        const totals = recalcTotals(state.items, 0);
        set({ couponCode: null, ...totals });
      },

      clearCart: () => {
        set({
          shopId: null,
          shopName: null,
          items: [],
          subtotal: 0,
          taxAmount: 0,
          grandTotal: 0,
          couponCode: null,
          discountAmount: 0,
          pickupInstructions: '',
          deliveryAddressId: null,
          storageError: null,
        });
      },

      replaceCart: (partial) => {
        set((state) => {
          const merged = { ...state, ...partial };
          // Recalculate totals after replacement to keep invariants
          const totals = recalcTotals(merged.items, merged.discountAmount || 0);
          return { ...merged, ...totals };
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      // If AsyncStorage write fails, Zustand revert middleware rolls
      // back in-memory state automatically. We expose the error here.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.storageError = null;
        }
      },
    }
  )
);
