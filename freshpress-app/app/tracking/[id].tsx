/**
 * Live Order Tracking — shows the delivery partner's location on a map
 * with a status timeline, partner details, and ETA.
 * Dark-mode, animated, and accessible.
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import type { OrderStatus } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface TrackingStep {
  status: OrderStatus;
  label: string;
  completed: boolean;
  current: boolean;
  time?: string;
  icon: string;
}

export default function TrackingScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading] = useState(false);

  const [steps] = useState<TrackingStep[]>([
    { status: 'CONFIRMED', label: 'Order Confirmed', completed: true, current: false, time: '10:30 AM', icon: 'receipt' },
    { status: 'PICKED_UP', label: 'Picked Up', completed: true, current: false, time: '11:15 AM', icon: 'local-laundry-service' },
    { status: 'IN_PROGRESS', label: 'Processing', completed: true, current: true, time: '12:00 PM', icon: 'cleaning-services' },
    { status: 'READY', label: 'Ready for Delivery', completed: false, current: false, icon: 'check-circle-outline' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', completed: false, current: false, icon: 'local-shipping' },
    { status: 'DELIVERED', label: 'Delivered', completed: false, current: false, icon: 'home' },
  ]);

  const order = {
    id: id || 'ORD-1024',
    shopName: 'Spotless Cleaners',
    eta: '2:30 PM',
    partner: {
      name: 'Ravi Kumar',
      phone: '+91 98765 43210',
      rating: 4.8,
      vehicle: 'Honda Activa',
      vehicleNumber: 'MH12 AB 1234',
    },
    address: 'Apt 12B, Sunshine Apartments, Pune',
  };

  // Map Pattern Placeholder
  const mapGridPattern = 'data:image/svg+xml;utf8,<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M40 0H0V40H40V0ZM39 1H1V39H39V1Z" fill="%23cbd5e1" fill-opacity="0.2"/></svg>';

  // Map Pulse Animation
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]} numberOfLines={1}>Order Tracking</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        
        {/* ── Map Preview Header ────────────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={[styles.mapContainer, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
          <ImageBackground source={{ uri: mapGridPattern }} style={styles.mapGrid}>
            <View style={styles.mapRouteLine} />
            <View style={styles.mapMarkers}>
              {/* Shop Marker */}
              <View style={[styles.markerShop, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
                <MaterialIcons name="storefront" size={16} color={theme.primary} />
              </View>
              {/* Delivery Partner Marker with Pulse */}
              <View style={styles.markerPartnerWrapper}>
                <Animated.View style={[styles.pulseRing, { backgroundColor: theme.primary }, animatedPulseStyle]} />
                <View style={[styles.markerPartner, { backgroundColor: theme.primary }]}>
                  <MaterialIcons name="two-wheeler" size={20} color={theme.primaryText} />
                </View>
              </View>
            </View>
          </ImageBackground>
          
          <View style={styles.mapOverlay}>
            <View style={[styles.etaBadge, { backgroundColor: theme.surface }]}>
              <View style={[styles.etaIconBg, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                <MaterialIcons name="schedule" size={18} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.etaLabel, { color: theme.textMuted }]}>Estimated Arrival</Text>
                <Text style={[styles.etaTime, { color: theme.text }]}>{order.eta}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Driver Card ──────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.card, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
          <Text style={[styles.cardTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Delivery Partner</Text>
          <View style={styles.partnerRow}>
            <View style={[styles.partnerAvatar, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(37,99,235,0.06)' }]}>
              <Text style={[styles.partnerInitials, { color: theme.primary }]}>
                {order.partner.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.partnerInfo}>
              <Text style={[styles.partnerName, { color: theme.text }]}>{order.partner.name}</Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={14} color={theme.warning} />
                <Text style={[styles.ratingText, { color: theme.text }]}>{order.partner.rating}</Text>
                <View style={styles.dotSeparator} />
                <Text style={[styles.vehicleText, { color: theme.textMuted }]}>
                  {order.partner.vehicle} ({order.partner.vehicleNumber})
                </Text>
              </View>
            </View>
            <AnimatedPressable
              style={[styles.callButton, { backgroundColor: theme.success }]}
              onPress={() => {}}
              accessibilityLabel={`Call ${order.partner.name}`}
              accessibilityRole="button"
            >
              <MaterialIcons name="phone" size={20} color={theme.primaryText} />
            </AnimatedPressable>
          </View>
        </Animated.View>

        {/* ── Order Details ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.card, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
          <View style={styles.orderHeaderRow}>
            <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 0 }]}>Order #{order.id}</Text>
            <View style={[styles.shopBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.inputBg }]}>
              <Text style={[styles.shopName, { color: theme.text }]}>{order.shopName}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.addressRow}>
            <View style={[styles.addressIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.inputBg }]}>
              <MaterialIcons name="location-on" size={18} color={theme.textMuted} />
            </View>
            <Text style={[styles.addressText, { color: theme.text }]} numberOfLines={2}>{order.address}</Text>
          </View>
        </Animated.View>

        {/* ── Timeline ─────────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[styles.card, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
          <Text style={[styles.cardTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Live Status</Text>
          <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const active = step.completed || step.current;
              
              return (
                <View key={step.status} style={styles.timelineRow}>
                  <View style={styles.timelineLeft}>
                    {/* Status Icon / Node */}
                    <View
                      style={[
                        styles.statusNode,
                        active
                          ? { backgroundColor: theme.primary, borderColor: theme.primary }
                          : { backgroundColor: theme.surface, borderColor: theme.border },
                        step.current && styles.statusNodeCurrent,
                      ]}
                    >
                      {active ? (
                        <MaterialIcons name={step.icon as any} size={14} color={theme.primaryText} />
                      ) : (
                        <View style={[styles.statusInnerDot, { backgroundColor: theme.border }]} />
                      )}
                    </View>
                    
                    {/* Connecting Line */}
                    {!isLast && (
                      <View style={[
                        styles.statusLine,
                        step.completed ? { backgroundColor: theme.primary } : { backgroundColor: theme.border }
                      ]} />
                    )}
                  </View>
                  
                  <View style={styles.timelineRight}>
                    <Text style={[
                      styles.statusLabel,
                      active ? { color: theme.text, fontWeight: '700' } : { color: theme.textMuted }
                    ]}>
                      {step.label}
                    </Text>
                    {step.time && <Text style={[styles.statusTime, { color: theme.textMuted }]}>{step.time}</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, letterSpacing: 0, flex: 1, textAlign: 'center' },
  spacer: { width: 32 },

  // ── Map Preview ─────────────────────────
  mapContainer: {
    height: 260,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  mapGrid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapRouteLine: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 2,
    transform: [{ rotate: '25deg' }],
    opacity: 0.3,
  },
  mapMarkers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
    transform: [{ rotate: '25deg' }],
  },
  markerShop: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-25deg' }], // Counter-rotate to stay upright
  },
  markerPartnerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-25deg' }],
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: radius.pill,
  },
  markerPartner: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 6 },
    }),
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  etaIconBg: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  etaTime: { fontSize: 16, fontWeight: '800' },

  // ── Cards ───────────────────────────────
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 20,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  cardTitle: { fontSize: 22, marginBottom: 16, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },

  // Driver
  partnerRow: { flexDirection: 'row', alignItems: 'center' },
  partnerAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  partnerInitials: { fontSize: 20, fontWeight: '800' },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 4 },
  vehicleText: { fontSize: 13, fontWeight: '500' },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },

  // Details
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  shopName: { fontSize: 13, fontWeight: '700' },
  divider: { height: 1, marginVertical: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addressIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: { fontSize: 14, flex: 1, lineHeight: 20, fontWeight: '500' },

  // Timeline
  timelineContainer: {
    paddingTop: 8,
  },
  timelineRow: { flexDirection: 'row' },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 24 },
  statusNode: {
    width: 24,
    height: 24,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  statusNodeCurrent: {
    shadowColor: '#8B5547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  statusInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
    zIndex: 1,
  },
  timelineRight: { paddingBottom: 24, flex: 1, justifyContent: 'center' },
  statusLabel: { fontSize: 15, fontWeight: '600' },
  statusTime: { fontSize: 13, marginTop: 4, fontWeight: '500' },
});
