/**
 * Payment Selection & Processing Screen — Lovable "Maison" editorial style.
 * Dark-mode, animated, and accessible.
 * Requirement: 7.x
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCartStore } from '@/store/cartStore';
import { createOrder } from '@/services/orderService';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/utils/alert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, ZoomIn, FadeInDown } from 'react-native-reanimated';

type PaymentMethod = 'RAZORPAY' | 'WALLET' | 'COD' | 'ONLINE';

export default function PaymentScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cart = useCartStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('RAZORPAY');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock wallet balance
  const walletBalance = 450.00;
  const isWalletDisabled = walletBalance < cart.grandTotal;

  const handlePay = async () => {
    if (!cart.deliveryAddressId) {
      showAlert('Missing Address', 'Delivery address is missing.');
      router.back();
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        shopId: cart.shopId!,
        items: cart.items,
        subtotal: cart.subtotal,
        taxAmount: cart.taxAmount,
        grandTotal: cart.grandTotal,
        deliveryAddressId: cart.deliveryAddressId,
        pickupInstructions: cart.pickupInstructions,
      });

      // Show success animation overlay before navigating
      setSuccess(true);
      setTimeout(() => {
        cart.clearCart();
        router.replace('/checkout/confirmation');
      }, 2000);

    } catch (err: any) {
      setLoading(false);
      showAlert('Payment Failed', err?.message || 'Failed to process payment.');
    }
  };

  const PaymentCard = ({
    id,
    title,
    subtitle,
    icon,
    iconFamily = 'icons',
    disabled = false,
    delay = 0,
  }: {
    id: PaymentMethod;
    title: string;
    subtitle?: string;
    icon: string;
    iconFamily?: 'community' | 'icons';
    disabled?: boolean;
    delay?: number;
  }) => {
    const isSelected = selectedMethod === id;
    
    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
        <AnimatedPressable
          style={[
            styles.paymentCard,
            {
              backgroundColor: isSelected ? (isDark ? 'rgba(139,85,71,0.15)' : 'rgba(139,85,71,0.06)') : 'transparent',
              borderColor: isSelected ? theme.primary : theme.border,
              opacity: disabled ? 0.35 : 1,
            },
          ]}
          onPress={() => !disabled && setSelectedMethod(id)}
          disabled={disabled}
          scaleOnPress={0.97}
          accessibilityLabel={title}
          accessibilityRole="radio"
          accessibilityState={{ selected: isSelected, disabled }}
        >
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.inputBg }]}>
            {iconFamily === 'community' ? (
              <MaterialCommunityIcons name={icon as any} size={22} color={isSelected ? theme.primary : theme.textMuted} />
            ) : (
              <MaterialIcons name={icon as any} size={22} color={isSelected ? theme.primary : theme.textMuted} />
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.cardSubtitle, { color: disabled ? theme.danger : theme.textMuted }]}>
                {subtitle}
              </Text>
            )}
          </View>
          
          {/* Maison square radio checkbox */}
          <View style={[
            styles.radioBox,
            { borderColor: isSelected ? theme.primary : theme.border }
          ]}>
            {isSelected && <MaterialIcons name="check" size={14} color={theme.primary} />}
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <View style={[styles.pageHeader, { borderBottomColor: theme.border, paddingTop: insets.top + 12 }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back" disabled={loading || success}>
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>STEP 2 OF 2</Text>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Payment</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <View style={[styles.breadcrumb, { borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} scaleOnPress={0.97}>
          <Text style={[styles.breadcrumbLink, { color: theme.textMuted }]}>Schedule</Text>
        </AnimatedPressable>
        <Text style={[styles.breadcrumbSep, { color: theme.border }]}>/</Text>
        <Text style={[styles.breadcrumbText, { color: theme.text }]}>Payment</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        
        {/* ── Price Summary Panel (Linen style) ────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.summaryWrap}>
          <View style={[styles.summaryBox, { backgroundColor: isDark ? theme.surface : theme.linen, borderColor: theme.border }]}>
            <Text style={[styles.summaryLabel, { color: theme.primary }]}>TOTAL TO PAY</Text>
            <Text style={[styles.summaryTotal, { color: theme.text, fontFamily: theme.fontSerif }]}>
              ₹{cart.grandTotal.toFixed(2)}
            </Text>
            
            <View style={[styles.summaryDivider, { borderColor: theme.border }]} />
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summarySub, { color: theme.textMuted }]}>Subtotal: ₹{cart.subtotal.toFixed(2)}</Text>
              <View style={[styles.summaryDot, { backgroundColor: theme.textMuted }]} />
              <Text style={[styles.summarySub, { color: theme.textMuted }]}>Taxes: ₹{cart.taxAmount.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Payment Methods ───────────────────────────────────────────────── */}
        <View style={styles.methodsContainer}>
          <Animated.View entering={FadeInDown.delay(120).duration(500)}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Select Payment Method</Text>
          </Animated.View>

          <PaymentCard
            id="RAZORPAY"
            title="Razorpay"
            subtitle="UPI, Cards, Net Banking"
            icon="credit-card-outline"
            delay={160}
          />

          <PaymentCard
            id="WALLET"
            title="FreshPress Wallet"
            subtitle={isWalletDisabled ? `Insufficient balance (₹${walletBalance})` : `Balance: ₹${walletBalance.toFixed(2)}`}
            icon="account-balance-wallet"
            iconFamily="icons"
            disabled={isWalletDisabled}
            delay={200}
          />

          <PaymentCard
            id="ONLINE"
            title="Other Online Payments"
            icon="web"
            iconFamily="icons"
            delay={240}
          />

          <PaymentCard
            id="COD"
            title="Cash on Delivery"
            subtitle="Pay when clothes are delivered"
            icon="money"
            iconFamily="icons"
            delay={280}
          />
        </View>
        
        {/* Trust Signals */}
        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.trustWrap}>
          <MaterialIcons name="lock" size={12} color={theme.textMuted} />
          <Text style={[styles.trustText, { color: theme.textMuted }]}>SECURE ENCRYPTED PAYMENT</Text>
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
          style={[styles.payBtn, { backgroundColor: theme.primary }]}
          onPress={handlePay}
          disabled={loading || success}
          accessibilityLabel={`Pay ₹${cart.grandTotal.toFixed(2)}`}
          accessibilityRole="button"
          scaleOnPress={0.97}
        >
          {loading ? (
            <ActivityIndicator color={theme.primaryText} />
          ) : (
            <View style={styles.payBtnInner}>
              <View>
                <Text style={styles.payBtnSub}>CONFIRM PAYMENT</Text>
                <Text style={[styles.payBtnTotal, { color: theme.primaryText }]}>₹{cart.grandTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.payBtnRight}>
                <Text style={[styles.payBtnLabel, { color: theme.primaryText }]}>PAY NOW</Text>
                <MaterialIcons name="arrow-forward" size={16} color={theme.primaryText} />
              </View>
            </View>
          )}
        </AnimatedPressable>
      </View>

      {/* ── Success Animation Overlay ─────────────────────────────────────── */}
      {success && (
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut}
          style={[styles.overlay, { backgroundColor: 'rgba(26,21,17,0.95)' }]}
        >
          <Animated.View entering={ZoomIn.springify().damping(15).stiffness(100)} style={styles.successContainer}>
            <View style={[styles.successSquare, { backgroundColor: theme.primary }]}>
              <MaterialIcons name="check" size={56} color="#F9F5F0" />
            </View>
            <Text style={[styles.successTitle, { fontFamily: theme.fontSerif }]}>Payment Successful</Text>
            <Text style={styles.successSub}>Processing your order...</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // Header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 2 },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
  },
  headerRight: { width: 32 },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  breadcrumbLink: { fontSize: 12, fontWeight: '500' },
  breadcrumbSep: { fontSize: 12 },
  breadcrumbText: { fontSize: 12, fontWeight: '600' },

  // Summary
  summaryWrap: { paddingHorizontal: 20, paddingTop: 24 },
  summaryBox: {
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  summaryTotal: {
    fontSize: 42,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  summaryDivider: { width: 40, borderTopWidth: 1, marginVertical: 16 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summarySub: { fontSize: 12, fontWeight: '500' },
  summaryDot: { width: 3, height: 3 },

  // Methods
  methodsContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 26,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  radioBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  
  trustWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 32,
  },
  trustText: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },

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
  payBtn: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  payBtnInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payBtnSub: { color: 'rgba(249,245,240,0.65)', fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 2 },
  payBtnTotal: { fontSize: 22, fontFamily: 'CormorantGaramond_500Medium' },
  payBtnRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payBtnLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  successContainer: {
    alignItems: 'center',
  },
  successSquare: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  successSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
