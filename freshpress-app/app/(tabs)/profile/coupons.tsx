/**
 * Coupons screen — browse, apply, and manage discount coupons.
 * Dark-mode, animated, and accessible.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '@/constants/theme';
import { getActiveCoupons, Coupon as APICoupon } from '@/services/couponService';

export default function CouponsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [couponCode, setCouponCode] = useState('');

  const [coupons, setCoupons] = useState<APICoupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getActiveCoupons();
      setCoupons(data);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const activeCouponsList = coupons;
  const expiredCouponsList: APICoupon[] = [];
  const filteredCoupons = activeTab === 'active' ? activeCouponsList : expiredCouponsList;

  const handleApplyCode = () => {
    if (!couponCode.trim()) {
      showAlert('Enter Code', 'Please enter a coupon code.');
      return;
    }
    showAlert('Checking...', `Verifying coupon code: ${couponCode}`);
  };

  const handleCopyCode = (code: string) => {
    showAlert('Copied!', `Coupon code ${code} copied.`);
  };

  const getCouponColor = (code: string) => {
    const colors: Record<string, string> = {
      WELCOME50: '#8B5CF6',
      SAVE100: '#2563EB',
      FREEDEL: '#6B7280',
      WEEKEND20: '#10B981',
      LOYALTY15: '#F59E0B',
    };
    return colors[code] || theme.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── Header ────────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 16, backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Offers & Coupons</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── ENTER CODE SECTION ─────────────────────────────────── */}
        <View style={[styles.enterCodeSection, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.enterCodeTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Have a coupon code?</Text>
          <View style={styles.codeRow}>
            <View
              style={[
                styles.codeInputContainer,
                { borderColor: isDark ? 'rgba(59,130,246,0.4)' : theme.primary, backgroundColor: theme.inputBg },
              ]}
            >
              <MaterialIcons name="local-offer" size={18} color={theme.primary} style={styles.codeIcon} />
              <TextInput
                style={[styles.codeInput, { color: theme.text }]}
                placeholder="Enter coupon code"
                placeholderTextColor={theme.textMuted}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
            </View>
            <AnimatedPressable
              style={[styles.applyButton, { backgroundColor: theme.primary }]}
              onPress={handleApplyCode}
              scaleOnPress={0.95}
              accessibilityLabel="Apply coupon"
              accessibilityRole="button"
            >
              <MaterialIcons name="check-circle" size={18} color="#fff" />
              <Text style={styles.applyButtonText}>Apply</Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* ── TABS ─────────────────────────────────────────────────── */}
        <View style={[styles.tabContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={[styles.tabPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }]}>
            <AnimatedPressable
              style={[styles.tab, activeTab === 'active' && { backgroundColor: theme.primary }]}
              onPress={() => setActiveTab('active')}
              accessibilityLabel="Active coupons"
              accessibilityRole="tab"
            >
              <MaterialIcons
                name="local-offer"
                size={14}
                color={activeTab === 'active' ? '#fff' : theme.textMuted}
              />
              <Text style={[styles.tabText, { color: activeTab === 'active' ? '#fff' : theme.textMuted }]}>
                Active ({activeCouponsList.length})
              </Text>
            </AnimatedPressable>
            <AnimatedPressable
              style={[styles.tab, activeTab === 'expired' && { backgroundColor: isDark ? '#374151' : '#9CA3AF' }]}
              onPress={() => setActiveTab('expired')}
              accessibilityLabel="Expired coupons"
              accessibilityRole="tab"
            >
              <MaterialIcons
                name="history"
                size={14}
                color={activeTab === 'expired' ? '#fff' : theme.textMuted}
              />
              <Text style={[styles.tabText, { color: activeTab === 'expired' ? '#fff' : theme.textMuted }]}>
                Expired ({expiredCouponsList.length})
              </Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* ── COUPON CARDS ─────────────────────────────────────────── */}
        <View style={styles.couponList}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
          ) : filteredCoupons.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6' }]}>
                <MaterialIcons name="local-offer" size={48} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>No {activeTab} coupons</Text>
              <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
                {activeTab === 'active'
                  ? 'Check back later for exclusive offers!'
                  : 'Your used and expired coupons will appear here.'}
              </Text>
            </View>
          ) : (
            filteredCoupons.map((coupon) => {
              const isExpired = activeTab === 'expired';
              const color = isExpired ? theme.textMuted : getCouponColor(coupon.code);
              
              const discountText = coupon.type === 'FLAT' 
                ? `₹${Number(coupon.value)} OFF` 
                : `${Number(coupon.value)}% OFF`;
              return (
                <View
                  key={coupon.id}
                  style={[
                    styles.couponCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isExpired
                        ? isDark ? 'rgba(255,255,255,0.05)' : theme.border
                        : isDark ? `${color}40` : `${color}25`,
                      opacity: isExpired ? 0.65 : 1,
                    },
                  ]}
                >
                  {/* Left accent */}
                  <View style={[styles.couponAccent, { backgroundColor: color }]}>
                    <MaterialIcons name={isExpired ? 'block' : 'local-offer'} size={18} color="#fff" />
                  </View>

                  {/* Main content */}
                  <View style={styles.couponBody}>
                    <View style={styles.couponTopRow}>
                      <View style={[styles.discountBadge, { backgroundColor: isExpired ? (isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6') : `${color}15` }]}>
                        <Text style={[styles.discountText, { color }]}>{discountText}</Text>
                      </View>
                      {isExpired && (
                        <View style={[styles.expiredTag, { backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' }]}>
                          <Text style={[styles.expiredTagText, { color: theme.danger }]}>EXPIRED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.couponDesc, { color: theme.text }]}>{coupon.description}</Text>
                    {coupon.minOrder > 0 && (
                      <Text style={[styles.minOrderText, { color: theme.textMuted }]}>
                        Min. order: ₹{coupon.minOrder}
                      </Text>
                    )}
                    <View style={styles.couponFooter}>
                      <Text style={[styles.couponExpiry, { color: theme.textMuted }]}>
                        {isExpired ? 'Expired' : 'Valid till'} {coupon.expiryDate}
                      </Text>
                      {!isExpired && (
                        <AnimatedPressable
                          onPress={() => handleCopyCode(coupon.code)}
                          accessibilityLabel={`Copy coupon ${coupon.code}`}
                          accessibilityRole="button"
                          style={[styles.copyBtn, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}
                        >
                          <Text style={[styles.copyBtnCode, { color }]}>{coupon.code}</Text>
                          <MaterialIcons name="content-copy" size={13} color={color} />
                        </AnimatedPressable>
                      )}
                      {isExpired && (
                        <View style={[styles.copyBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6', borderColor: 'transparent' }]}>
                          <Text style={[styles.copyBtnCode, { color: theme.textMuted }]}>{coupon.code}</Text>
                        </View>
                      )}
                    </View>
                    {coupon.terms && !isExpired && (
                      <Text style={[styles.termsText, { color: theme.textMuted }]}>T&C: {coupon.terms}</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, letterSpacing: 0, flex: 1, textAlign: 'center', marginRight: 32 },
  spacer: { width: 32 },

  // ── Enter Code ───────────────────────────────────
  enterCodeSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  enterCodeTitle: { fontSize: 18, marginBottom: 10, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },
  codeRow: { flexDirection: 'row', gap: 10 },
  codeInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 50,
  },
  codeIcon: { marginRight: 8 },
  codeInput: { flex: 1, fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: radius.md,
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  applyButtonText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // ── Tabs ─────────────────────────────────────────
  tabContainer: {
    padding: 12,
    borderBottomWidth: 1,
  },
  tabPill: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  tabText: { fontSize: 13, fontWeight: '700' },

  // ── Coupon Cards ─────────────────────────────────
  couponList: { padding: 16, gap: 12 },
  couponCard: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  couponAccent: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  couponBody: { flex: 1, padding: 14 },
  couponTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  discountText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  expiredTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expiredTagText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  couponDesc: { fontSize: 14, fontWeight: '600', marginBottom: 4, lineHeight: 20 },
  minOrderText: { fontSize: 12, marginBottom: 8 },
  couponFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  couponExpiry: { fontSize: 12 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  copyBtnCode: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  termsText: { fontSize: 11, marginTop: 8, lineHeight: 16 },

  // ── Empty State ───────────────────────────────────
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 24 },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 24, marginBottom: 8, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },
  emptyBody: { fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22 },
});



