/**
 * Cart screen — Lovable "Maison" editorial style.
 * Review items, adjust quantities, set pickup instructions, proceed to checkout.
 * Dark-mode, animated, and accessible.
 * Requirement: 5.1–5.10
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import QuantityStepper from '@/components/QuantityStepper';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/utils/alert';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaisonImages } from '@/assets/images/maison';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function CartScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const cart = useCartStore();
  const [instructions, setInstructions] = useState(cart.pickupInstructions);

  const handleQuantityChange = (id: string, qty: number) => {
    cart.setQuantity(id, qty);
  };

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      showAlert('Login Required', 'Please log in to proceed to checkout.');
      return;
    }
    if (cart.items.length === 0) {
      showAlert('Empty Cart', 'Your cart is empty.');
      return;
    }
    if (instructions !== cart.pickupInstructions) {
      cart.setPickupInstructions(instructions);
    }
    router.push('/checkout/slot');
  };

  // ── Empty State ─────────────────────────────────────────────────────────────
  if (cart.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.emptyWrap}>
          {/* Editorial image */}
          <Image source={MaisonImages.about} style={styles.emptyImage} resizeMode="cover" />
          <View style={styles.emptyContent}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>YOUR BAG</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Your Cart is Empty</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
              Discover exceptional laundry services and add them to your cart.
            </Text>
            <AnimatedPressable
              style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.replace('/(tabs)')}
              accessibilityLabel="Browse shops"
              accessibilityRole="button"
              scaleOnPress={0.97}
            >
              <Text style={[styles.ctaBtnText, { color: theme.primaryText }]}>BROWSE SHOPS</Text>
              <MaterialIcons name="arrow-forward" size={14} color={theme.primaryText} />
            </AnimatedPressable>
          </View>
        </Animated.View>
      </View>
    );
  }

  // ── Cart Content ────────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={[styles.pageHeader, { borderBottomColor: theme.border }]}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>YOUR BAG</Text>
          <View style={styles.pageHeaderRow}>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Shopping Cart</Text>
            <Text style={[styles.itemCount, { color: theme.textMuted }]}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Text>
          </View>
          {/* Shop badge */}
          {cart.shopName ? (
            <View style={[styles.shopBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <MaterialIcons name="storefront" size={14} color={theme.primary} />
              <Text style={[styles.shopBadgeText, { color: theme.primary }]} numberOfLines={1}>
                {cart.shopName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <View style={[styles.breadcrumb, { borderBottomColor: theme.border }]}>
          <Text style={[styles.breadcrumbText, { color: theme.textMuted }]}>Shop</Text>
          <Text style={[styles.breadcrumbSep, { color: theme.border }]}>/</Text>
          <Text style={[styles.breadcrumbText, { color: theme.text }]}>Your Bag</Text>
        </View>

        {/* ── Cart Items ───────────────────────────────────────────────────── */}
        <View style={styles.itemsSection}>
          {cart.items.map((item, index) => {
            const isLast = index === cart.items.length - 1;
            return (
              <Animated.View
                key={item.serviceItem.id}
                entering={FadeInDown.delay(index * 80).duration(500)}
              >
                <View style={[
                  styles.cartItem,
                  { borderBottomColor: theme.border },
                  isLast && styles.cartItemLast,
                ]}>
                  {/* Item info */}
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemCategory, { color: theme.primary }]} numberOfLines={1}>
                      {item.serviceItem.category.toUpperCase()}
                    </Text>
                    <Text style={[styles.itemName, { color: theme.text }]} maxFontSizeMultiplier={1.4} numberOfLines={2}>
                      {item.serviceItem.name}
                    </Text>
                    <Text style={[styles.itemUnit, { color: theme.textMuted }]}>
                      ₹{item.serviceItem.priceInr.toFixed(2)} per item
                    </Text>
                  </View>

                  {/* Actions — price + stepper */}
                  <View style={styles.itemActions}>
                    <Text style={[styles.itemTotal, { color: theme.text }]}>
                      ₹{item.lineTotal.toFixed(2)}
                    </Text>
                    <View style={[styles.stepperWrap, { borderColor: theme.border }]}>
                      <QuantityStepper
                        quantity={item.quantity}
                        min={0}
                        onChange={(q) => handleQuantityChange(item.serviceItem.id, q)}
                      />
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Continue browsing */}
        <AnimatedPressable
          style={styles.continueShopping}
          onPress={() => router.push('/(tabs)')}
          scaleOnPress={0.97}
        >
          <MaterialIcons name="arrow-back" size={14} color={theme.textMuted} />
          <Text style={[styles.continueText, { color: theme.textMuted }]}>CONTINUE SHOPPING</Text>
        </AnimatedPressable>

        {/* ── Pickup Instructions ──────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: isDark ? theme.surface : theme.linen }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>NOTE</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Pickup Instructions</Text>
          </View>
          <TextInput
            style={[
              styles.instructionsInput,
              {
                color: theme.text,
                borderColor: theme.border,
                backgroundColor: theme.inputBg,
              },
            ]}
            placeholder="E.g., Ring the doorbell, leave at reception..."
            placeholderTextColor={theme.textMuted}
            value={instructions}
            onChangeText={setInstructions}
            multiline
            maxLength={200}
            accessibilityLabel="Pickup instructions"
            accessibilityHint="Add any special instructions for pickup"
          />
          <Text style={[styles.charCount, { color: theme.textMuted }]}>
            {instructions.length}/200
          </Text>
        </View>

        {/* ── Order Summary ────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: isDark ? theme.surface : theme.linen }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>SUMMARY</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Summary</Text>
          </View>

          <View style={[styles.summaryDivider, { borderColor: theme.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>
              Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ₹{cart.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Taxes (5%)</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>
              ₹{cart.taxAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Delivery Fee</Text>
            <Text style={[styles.freeTag, { color: theme.success }]}>Complimentary</Text>
          </View>

          <View style={[styles.totalDivider, { borderColor: theme.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text, fontFamily: theme.fontSerif }]}>
              Grand Total
            </Text>
            <Text style={[styles.totalValue, { color: theme.text, fontFamily: theme.fontSerif }]}>
              ₹{cart.grandTotal.toFixed(2)}
            </Text>
          </View>

          {/* Trust signals */}
          <View style={[styles.trustGrid, { borderTopColor: theme.border }]}>
            <View style={styles.trustItem}>
              <Text style={[styles.trustLabel, { color: theme.textMuted }]}>PICKUP</Text>
              <Text style={[styles.trustValue, { color: theme.text }]}>Door-to-door</Text>
            </View>
            <View style={[styles.trustDivider, { backgroundColor: theme.border }]} />
            <View style={styles.trustItem}>
              <Text style={[styles.trustLabel, { color: theme.textMuted }]}>RETURNS</Text>
              <Text style={[styles.trustValue, { color: theme.text }]}>Guaranteed quality</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* ── Sticky Checkout Footer ────────────────────────────────────────── */}
      <View style={[
        styles.footer,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom || 20,
        }
      ]}>
        <AnimatedPressable
          style={[styles.checkoutBtn, { backgroundColor: theme.primary }]}
          onPress={handleCheckout}
          accessibilityLabel={`Proceed to checkout, total ₹${cart.grandTotal.toFixed(2)}`}
          accessibilityRole="button"
          scaleOnPress={0.97}
        >
          <View style={styles.checkoutBtnInner}>
            <View>
              <Text style={styles.checkoutSubtext}>TOTAL TO PAY</Text>
              <Text style={[styles.checkoutTotal, { color: theme.primaryText }]}>
                ₹{cart.grandTotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.checkoutRight}>
              <Text style={[styles.checkoutLabel, { color: theme.primaryText }]}>
                PROCEED TO CHECKOUT
              </Text>
              <MaterialIcons name="arrow-forward" size={18} color={theme.primaryText} />
            </View>
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Empty state
  emptyWrap: { flex: 1 },
  emptyImage: { width: '100%', height: 260 },
  emptyContent: { padding: 28 },
  emptyTitle: {
    fontSize: 34,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.5,
    marginBottom: 12,
    lineHeight: 38,
  },
  emptyBody: { fontSize: 14, lineHeight: 22, marginBottom: 24 },

  // Header
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  pageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 36,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  itemCount: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  shopBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  shopBadgeText: { fontSize: 12, fontWeight: '700' },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  breadcrumbText: { fontSize: 12, fontWeight: '500' },
  breadcrumbSep: { fontSize: 12 },

  // Cart items
  itemsSection: { paddingHorizontal: 24, paddingTop: 4 },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  cartItemLast: { borderBottomWidth: 0 },
  itemInfo: { flex: 1 },
  itemCategory: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  itemName: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_500Medium',
    lineHeight: 22,
    marginBottom: 6,
  },
  itemUnit: { fontSize: 12, fontWeight: '500' },
  itemActions: { alignItems: 'flex-end', gap: 10 },
  itemTotal: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  stepperWrap: { borderWidth: 1 },

  // Continue shopping
  continueShopping: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  continueText: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },

  // Sections (instructions + summary)
  section: {
    margin: 20,
    padding: 24,
  },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 26,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  instructionsInput: {
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 6 },

  // Summary
  summaryDivider: { borderTopWidth: 1, marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 13, fontWeight: '500' },
  summaryValue: { fontSize: 13, fontWeight: '600' },
  freeTag: { fontSize: 13, fontWeight: '600' },
  totalDivider: { borderTopWidth: 1, marginVertical: 12 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: { fontSize: 22, lineHeight: 26 },
  totalValue: { fontSize: 22, lineHeight: 26 },

  // Trust signals
  trustGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 16,
  },
  trustItem: { flex: 1 },
  trustLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  trustValue: { fontSize: 12, fontWeight: '500' },
  trustDivider: { width: 1 },

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
  checkoutBtn: { paddingVertical: 18, paddingHorizontal: 20 },
  checkoutBtnInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutSubtext: { color: 'rgba(249,245,240,0.65)', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  checkoutTotal: { fontSize: 22, fontFamily: 'CormorantGaramond_500Medium' },
  checkoutRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkoutLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  // Shared
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 4 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  ctaBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
});
