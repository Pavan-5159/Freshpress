/**
 * Checkout screen — Lovable "Maison" editorial style.
 * Order summary and address selection, with payment trigger.
 * Dark-mode, animated, and accessible.
 * Requirement: 7.1–7.9
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { getAddresses } from '@/services/addressService';
import { createOrder } from '@/services/orderService';
import { validateCoupon } from '@/services/couponService';
import type { Address } from '@/types';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/utils/alert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function CheckoutScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const cart = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(cart.deliveryAddressId);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [couponInput, setCouponInput] = useState(cart.couponCode || '');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
      if (data.length > 0 && !selectedAddressId) {
        const defaultAddr = data.find((a) => a.isDefault);
        setSelectedAddressId(defaultAddr?.id || data[0].id);
      }
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to load addresses.');
    } finally {
      setFetching(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      showAlert('Select Address', 'Please choose a delivery address.');
      return;
    }
    if (cart.items.length === 0) {
      showAlert('Empty Cart', 'Your cart is empty.');
      return;
    }

    cart.setDeliveryAddress(selectedAddressId);
    router.push('/checkout/payment');
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      showAlert('Enter Code', 'Please enter a coupon code.');
      return;
    }
    try {
      setCouponLoading(true);
      const result = await validateCoupon(couponInput.trim(), cart.subtotal);
      cart.applyCoupon(result.code, result.discountAmount);
      showAlert('Success', `Coupon applied! You saved ₹${result.discountAmount.toFixed(2)}`);
    } catch (err: any) {
      showAlert('Error', err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    cart.removeCoupon();
    setCouponInput('');
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (fetching) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading your details...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <View style={[styles.pageHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>CONFIRM</Text>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Checkout</Text>
        </View>

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <View style={[styles.breadcrumb, { borderBottomColor: theme.border }]}>
          <AnimatedPressable onPress={() => router.back()} scaleOnPress={0.97}>
            <Text style={[styles.breadcrumbLink, { color: theme.textMuted }]}>Cart</Text>
          </AnimatedPressable>
          <Text style={[styles.breadcrumbSep, { color: theme.border }]}>/</Text>
          <Text style={[styles.breadcrumbText, { color: theme.text }]}>Checkout</Text>
        </View>

        {/* ── Coupon Section ─────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(50).duration(500)}
          style={[styles.section, { backgroundColor: theme.surface }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>OFFERS</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Apply Coupon</Text>
          </View>
          <View style={[styles.sectionDivider, { borderColor: theme.border }]} />
          
          {cart.couponCode ? (
            <View style={[styles.appliedCouponCard, { borderColor: theme.success, backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)' }]}>
              <View style={styles.appliedCouponLeft}>
                <MaterialIcons name="local-offer" size={18} color={theme.success} />
                <View>
                  <Text style={[styles.appliedCouponCode, { color: theme.success }]}>{cart.couponCode}</Text>
                  <Text style={[styles.appliedCouponSave, { color: theme.textMuted }]}>Saving ₹{cart.discountAmount.toFixed(2)}</Text>
                </View>
              </View>
              <AnimatedPressable onPress={handleRemoveCoupon}>
                <MaterialIcons name="close" size={20} color={theme.textMuted} />
              </AnimatedPressable>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <View style={[styles.couponInputContainer, { borderColor: theme.border }]}>
                <MaterialIcons name="local-offer" size={16} color={theme.textMuted} style={styles.couponIcon} />
                <TextInput
                  style={[styles.couponInput, { color: theme.text }]}
                  placeholder="Enter code"
                  placeholderTextColor={theme.textMuted}
                  value={couponInput}
                  onChangeText={setCouponInput}
                  autoCapitalize="characters"
                />
              </View>
              <AnimatedPressable
                style={[styles.couponBtn, { backgroundColor: theme.primary }]}
                onPress={handleApplyCoupon}
                disabled={couponLoading}
              >
                {couponLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.couponBtnText}>Apply</Text>
                )}
              </AnimatedPressable>
            </View>
          )}
        </Animated.View>

        {/* ── Order Summary ────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={[styles.section, { backgroundColor: isDark ? theme.surface : theme.linen }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>SUMMARY</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Details</Text>
          </View>

          <View style={[styles.sectionDivider, { borderColor: theme.border }]} />

          {/* Line items */}
          {cart.items.map((item, idx) => (
            <View key={item.serviceItem.id} style={[
              styles.lineItem,
              idx < cart.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}>
              <View style={styles.lineItemLeft}>
                <Text style={[styles.lineItemCategory, { color: theme.primary }]}>
                  {item.serviceItem.category.toUpperCase()}
                </Text>
                <Text style={[styles.lineItemName, { color: theme.text }]} numberOfLines={2}>
                  {item.serviceItem.name}
                </Text>
                <Text style={[styles.lineItemQty, { color: theme.textMuted }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.lineItemPrice, { color: theme.text }]}>
                ₹{item.lineTotal.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={[styles.sectionDivider, { borderColor: theme.border, marginTop: 4 }]} />

          {/* Totals */}
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Subtotal</Text>
              <Text style={[styles.totalVal, { color: theme.text }]}>₹{cart.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Taxes (5%)</Text>
              <Text style={[styles.totalVal, { color: theme.text }]}>₹{cart.taxAmount.toFixed(2)}</Text>
            </View>
            {cart.discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.success }]}>Discount ({cart.couponCode})</Text>
                <Text style={[styles.totalVal, { color: theme.success }]}>-₹{cart.discountAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Delivery</Text>
              <Text style={[styles.totalVal, { color: theme.success }]}>Complimentary</Text>
            </View>
            <View style={[styles.grandTotalDivider, { borderColor: theme.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.grandTotalLabel, { color: theme.text, fontFamily: theme.fontSerif }]}>
                Grand Total
              </Text>
              <Text style={[styles.grandTotalVal, { color: theme.text, fontFamily: theme.fontSerif }]}>
                ₹{cart.grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Delivery Address ─────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.section, { backgroundColor: theme.surface }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>DELIVERY</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Address</Text>
          </View>

          <View style={[styles.sectionDivider, { borderColor: theme.border }]} />

          {addresses.length === 0 ? (
            <View style={styles.noAddressWrap}>
              <MaterialIcons name="location-off" size={32} color={theme.textMuted} />
              <Text style={[styles.noAddressText, { color: theme.textMuted }]}>
                No saved addresses found.
              </Text>
              <AnimatedPressable
                style={[styles.addAddrBtn, { borderColor: theme.primary }]}
                onPress={() => router.push('/(tabs)/profile/addresses')}
                scaleOnPress={0.97}
              >
                <Text style={[styles.addAddrText, { color: theme.primary }]}>ADD ADDRESS</Text>
                <MaterialIcons name="arrow-forward" size={14} color={theme.primary} />
              </AnimatedPressable>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <AnimatedPressable
                    key={addr.id}
                    onPress={() => setSelectedAddressId(addr.id)}
                    style={[
                      styles.addressCard,
                      {
                        borderColor: isSelected ? theme.primary : theme.border,
                        backgroundColor: isSelected
                          ? (isDark ? 'rgba(139,85,71,0.15)' : 'rgba(139,85,71,0.06)')
                          : 'transparent',
                      },
                    ]}
                    accessibilityLabel={`${addr.label} address`}
                    accessibilityRole="radio"
                    scaleOnPress={0.98}
                  >
                    {/* Selection indicator */}
                    <View style={[
                      styles.radioOuter,
                      { borderColor: isSelected ? theme.primary : theme.border }
                    ]}>
                      {isSelected && (
                        <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
                      )}
                    </View>

                    <View style={styles.addressInfo}>
                      <View style={styles.addressLabelRow}>
                        <Text style={[styles.addrLabel, { color: theme.text }]}>{addr.label}</Text>
                        {addr.isDefault && (
                          <View style={[styles.defaultBadge, { borderColor: theme.primary }]}>
                            <Text style={[styles.defaultBadgeText, { color: theme.primary }]}>DEFAULT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.addrText, { color: theme.textMuted }]} numberOfLines={2}>
                        {addr.formattedAddress}
                      </Text>
                    </View>
                  </AnimatedPressable>
                );
              })}
              <AnimatedPressable
                style={[styles.addMoreAddr, { borderColor: theme.border }]}
                onPress={() => router.push('/(tabs)/profile/addresses')}
                scaleOnPress={0.97}
              >
                <MaterialIcons name="add" size={16} color={theme.textMuted} />
                <Text style={[styles.addMoreAddrText, { color: theme.textMuted }]}>ADD NEW ADDRESS</Text>
              </AnimatedPressable>
            </View>
          )}
        </Animated.View>

        {/* ── Pickup Instructions (read-only preview) ──────────────────────── */}
        {cart.pickupInstructions ? (
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={[styles.section, { backgroundColor: theme.surface }]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.eyebrow, { color: theme.primary }]}>NOTE</Text>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Pickup Instructions</Text>
            </View>
            <View style={[styles.sectionDivider, { borderColor: theme.border }]} />
            <Text style={[styles.instructionText, { color: theme.textMuted }]}>
              {cart.pickupInstructions}
            </Text>
          </Animated.View>
        ) : null}

        {/* ── Trust Signals ────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(500)}
          style={styles.trustRow}
        >
          {[
            { label: 'SECURE PAYMENT', icon: 'lock' as const },
            { label: 'QUALITY GUARANTEE', icon: 'verified' as const },
            { label: 'DOOR-TO-DOOR', icon: 'local-shipping' as const },
          ].map((t, i) => (
            <View key={t.label} style={[styles.trustItem, i < 2 && { borderRightColor: theme.border, borderRightWidth: 1 }]}>
              <MaterialIcons name={t.icon} size={18} color={theme.primary} />
              <Text style={[styles.trustLabel, { color: theme.textMuted }]}>{t.label}</Text>
            </View>
          ))}
        </Animated.View>

      </ScrollView>

      {/* ── Sticky Footer ────────────────────────────────────────────────── */}
      <View style={[
        styles.footer,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom || 20,
        }
      ]}>
        <AnimatedPressable
          style={[
            styles.placeOrderBtn,
            { backgroundColor: theme.primary },
            (loading || cart.items.length === 0) && { opacity: 0.6 },
          ]}
          onPress={handlePlaceOrder}
          disabled={loading || cart.items.length === 0}
          accessibilityLabel="Place Order"
          accessibilityRole="button"
          scaleOnPress={0.97}
        >
          {loading ? (
            <ActivityIndicator color={theme.primaryText} />
          ) : (
            <View style={styles.placeOrderInner}>
              <View>
                <Text style={styles.placeOrderSubtext}>CONFIRM ORDER</Text>
                <Text style={[styles.placeOrderTotal, { color: theme.primaryText }]}>
                  ₹{cart.grandTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.placeOrderRight}>
                <Text style={[styles.placeOrderLabel, { color: theme.primaryText }]}>
                  PLACE ORDER
                </Text>
                <MaterialIcons name="arrow-forward" size={18} color={theme.primaryText} />
              </View>
            </View>
          )}
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 14, fontWeight: '500' },

  // Header
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 4 },
  pageTitle: {
    fontSize: 36,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.5,
    lineHeight: 40,
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  breadcrumbLink: { fontSize: 12, fontWeight: '500' },
  breadcrumbSep: { fontSize: 12 },
  breadcrumbText: { fontSize: 12, fontWeight: '600' },

  // Sections
  section: { marginHorizontal: 20, marginTop: 20, padding: 24 },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 26,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  sectionDivider: { borderTopWidth: 1, marginBottom: 16 },

  // Line items
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 8,
  },
  lineItemLeft: { flex: 1 },
  lineItemCategory: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 3 },
  lineItemName: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_500Medium',
    lineHeight: 20,
    marginBottom: 4,
  },
  lineItemQty: { fontSize: 12, fontWeight: '500' },
  lineItemPrice: { fontSize: 16, fontFamily: 'CormorantGaramond_500Medium' },

  // Totals
  totalsBlock: { gap: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: '500' },
  totalVal: { fontSize: 13, fontWeight: '600' },
  grandTotalDivider: { borderTopWidth: 1, marginVertical: 4 },
  grandTotalLabel: { fontSize: 22, lineHeight: 26 },
  grandTotalVal: { fontSize: 22, lineHeight: 26 },

  // Coupons
  couponRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  couponInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 12, height: 44 },
  couponIcon: { marginRight: 8 },
  couponInput: { flex: 1, fontSize: 14, height: '100%', padding: 0 },
  couponBtn: { height: 44, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  couponBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  appliedCouponCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, padding: 12 },
  appliedCouponLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appliedCouponCode: { fontSize: 14, fontWeight: '700' },
  appliedCouponSave: { fontSize: 12, marginTop: 2 },

  // Address
  addressList: { gap: 10 },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: { width: 9, height: 9 },
  addressInfo: { flex: 1 },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addrLabel: { fontSize: 15, fontWeight: '700' },
  defaultBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  defaultBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 1.5 },
  addrText: { fontSize: 13, lineHeight: 18 },
  addMoreAddr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  addMoreAddrText: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  noAddressWrap: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  noAddressText: { fontSize: 14, textAlign: 'center' },
  addAddrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addAddrText: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },

  // Pickup instructions preview
  instructionText: { fontSize: 14, lineHeight: 22 },

  // Trust signals
  trustRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  trustLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 12 },
    }),
  },
  placeOrderBtn: { paddingVertical: 18, paddingHorizontal: 20 },
  placeOrderInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeOrderSubtext: { color: 'rgba(249,245,240,0.65)', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  placeOrderTotal: { fontSize: 22, fontFamily: 'CormorantGaramond_500Medium' },
  placeOrderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  placeOrderLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
});
