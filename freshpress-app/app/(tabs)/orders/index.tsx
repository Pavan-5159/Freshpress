/**
 * Orders list screen - all past and active orders, newest first.
 * Lovable "Maison" editorial style.
 * Requirement: 8.1, 8.2, 11.4
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { getOrders } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/theme';
import AnimatedPressable from '@/components/AnimatedPressable';

type IconName = ComponentProps<typeof MaterialIcons>['name'];
type FilterValue = 'ALL' | 'ACTIVE' | 'PAST';

const STATUS_META: Record<OrderStatus, { label: string; icon: IconName; light: string; dark: string }> = {
  PENDING:          { label: 'Pending',          icon: 'hourglass-empty',        light: '#A67C52', dark: '#C4A482' },
  CONFIRMED:        { label: 'Confirmed',        icon: 'task-alt',               light: '#7A6E67', dark: '#9C918A' },
  PICKED_UP:        { label: 'Picked up',        icon: 'inventory-2',            light: '#8B5547', dark: '#B07060' },
  IN_PROGRESS:      { label: 'In progress',      icon: 'local-laundry-service',  light: '#8B5547', dark: '#B07060' },
  READY:            { label: 'Ready',            icon: 'check-circle-outline',   light: '#5A6250', dark: '#7D8672' },
  OUT_FOR_DELIVERY: { label: 'Out for delivery', icon: 'local-shipping',         light: '#7A6E67', dark: '#9C918A' },
  DELIVERED:        { label: 'Delivered',        icon: 'home',                   light: '#485040', dark: '#6A745F' },
  CANCELLED:        { label: 'Cancelled',        icon: 'cancel',                 light: '#B23A48', dark: '#C9616D' },
};

const ORDER_FLOW: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_PROGRESS', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED',
];

const isClosed = (status: OrderStatus) => status === 'DELIVERED' || status === 'CANCELLED';

const hexToRgba = (hex: string, alpha: number) => {
  const value = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// --- Status badge -------------------------------------------------------------

function StatusBadge({ status, isDark }: { status: OrderStatus; isDark: boolean }) {
  const meta = STATUS_META[status] ?? STATUS_META.PENDING;
  const fg = isDark ? meta.dark : meta.light;
  return (
    <View style={[styles.statusBadge, { backgroundColor: hexToRgba(fg, isDark ? 0.18 : 0.1) }]} accessibilityLabel={`Status: ${meta.label}`}>
      <MaterialIcons name={meta.icon} size={12} color={fg} />
      <Text style={[styles.statusText, { color: fg }]} numberOfLines={1}>{meta.label}</Text>
    </View>
  );
}

// --- Progress rail ------------------------------------------------------------

function ProgressRail({ status, color, trackColor }: { status: OrderStatus; color: string; trackColor: string }) {
  const step = ORDER_FLOW.indexOf(status);
  if (step < 0) return null;
  return (
    <View style={styles.rail} accessibilityLabel={`Step ${step + 1} of ${ORDER_FLOW.length}`}>
      {ORDER_FLOW.map((flowStatus, i) => (
        <View key={flowStatus} style={[styles.railSegment, { backgroundColor: i <= step ? color : trackColor }]} />
      ))}
    </View>
  );
}

// --- Order card --------------------------------------------------------------

interface OrderCardProps {
  order: Order;
  theme: ThemeColors;
  isDark: boolean;
  index: number;
  onPress: () => void;
}

function OrderCard({ order, theme, isDark, index, onPress }: OrderCardProps) {
  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const statusColor = isDark ? meta.dark : meta.light;
  const live = !isClosed(order.status);
  const awaitingRating = order.status === 'DELIVERED' && !order.ratingSubmitted;
  const ratingAccent = isDark ? theme.warning : '#A67C52';
  const itemPreview = order.items.map((item) => `${item.quantity}x ${item.serviceItem.name}`).join(', ');

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 45).duration(320)} layout={Layout.springify()}>
      <AnimatedPressable
        style={[
          styles.orderCard,
          { backgroundColor: isDark ? theme.surface : theme.linen, borderColor: theme.border },
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Order ${order.id} from ${order.shopName}, ${meta.label}, ${formatPrice(order.grandTotal)}`}
        accessibilityHint="Opens the full order detail"
      >
        <View style={styles.cardInner}>
          <View style={styles.orderHeader}>
            <View style={styles.shopInfo}>
              <View style={[styles.shopIconBg, { borderColor: theme.border }]}>
                <MaterialIcons name="storefront" size={16} color={theme.textMuted} />
              </View>
              <View style={styles.shopInfoText}>
                <Text style={[styles.shopName, { color: theme.text }]} numberOfLines={1}>{order.shopName}</Text>
                <Text style={[styles.orderMeta, { color: theme.textMuted }]} numberOfLines={1}>#{order.id} · {formatDate(order.createdAt)}</Text>
              </View>
            </View>
            <StatusBadge status={order.status} isDark={isDark} />
          </View>

          {live && (
            <ProgressRail status={order.status} color={statusColor} trackColor={theme.border} />
          )}

          {itemPreview.length > 0 && (
            <Text style={[styles.itemPreview, { color: theme.textMuted }]} numberOfLines={2}>{itemPreview}</Text>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.orderFooter}>
            <View>
              <Text style={[styles.footerLabel, { color: theme.textMuted }]}>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</Text>
              <Text style={[styles.total, { color: theme.text }]}>{formatPrice(order.grandTotal)}</Text>
            </View>
            <View style={[styles.viewDetailsBtn, { backgroundColor: isDark ? theme.inputBg : theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.viewDetailsText, { color: theme.text }]}>VIEW DETAILS</Text>
              <MaterialIcons name="arrow-forward" size={12} color={theme.text} />
            </View>
          </View>

          {awaitingRating && (
            <View style={[styles.ratingHint, { backgroundColor: hexToRgba(ratingAccent, isDark ? 0.16 : 0.1) }]}>
              <MaterialIcons name="star-outline" size={14} color={ratingAccent} />
              <Text style={[styles.ratingHintText, { color: ratingAccent }]}>Tap to rate this order</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// --- Skeleton ----------------------------------------------------------------

function OrderCardSkeleton({ theme, isDark }: { theme: ThemeColors; isDark: boolean }) {
  const pulse = useSharedValue(0.55);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (reduceMotion) return;
    pulse.value = withRepeat(withTiming(1, { duration: 850 }), -1, true);
  }, [pulse, reduceMotion]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  const block = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <Animated.View
      style={[styles.orderCard, pulseStyle, { backgroundColor: isDark ? theme.surface : theme.linen, borderColor: theme.border }]}
      accessibilityLabel="Loading orders"
    >
      <View style={styles.cardInner}>
        <View style={styles.orderHeader}>
          <View style={styles.shopInfo}>
            <View style={[styles.shopIconBg, { backgroundColor: block, borderColor: 'transparent' }]} />
            <View style={styles.shopInfoText}>
              <View style={[styles.skelLine, { width: '62%', height: 14, backgroundColor: block }]} />
              <View style={[styles.skelLine, { width: '44%', height: 10, backgroundColor: block, marginTop: 8 }]} />
            </View>
          </View>
          <View style={[styles.skelLine, { width: 82, height: 22, backgroundColor: block }]} />
        </View>
        <View style={[styles.skelLine, { width: '100%', height: 4, backgroundColor: block, marginTop: 16 }]} />
        <View style={[styles.skelLine, { width: '70%', height: 12, backgroundColor: block, marginTop: 14 }]} />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.orderFooter}>
          <View style={{ flex: 1 }}>
            <View style={[styles.skelLine, { width: 54, height: 10, backgroundColor: block }]} />
            <View style={[styles.skelLine, { width: 88, height: 18, backgroundColor: block, marginTop: 8 }]} />
          </View>
          <View style={[styles.skelLine, { width: 90, height: 32, backgroundColor: block }]} />
        </View>
      </View>
    </Animated.View>
  );
}

// --- Filter pill --------------------------------------------------------------

interface FilterPillProps {
  label: string;
  count: number;
  active: boolean;
  theme: ThemeColors;
  isDark: boolean;
  onPress: () => void;
}

function FilterPill({ label, count, active, theme, isDark, onPress }: FilterPillProps) {
  return (
    <AnimatedPressable
      style={[styles.filterPill, { backgroundColor: active ? theme.primary : 'transparent', borderColor: active ? theme.primary : theme.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}, ${count} orders`}
    >
      <Text style={[styles.filterText, { color: active ? theme.primaryText : theme.text }]}>{label}</Text>
      <View style={[styles.filterCount, { backgroundColor: active ? 'rgba(255,255,255,0.22)' : (isDark ? theme.surface : theme.inputBg) }]}>
        <Text style={[styles.filterCountText, { color: active ? theme.primaryText : theme.textMuted }]}>{count}</Text>
      </View>
    </AnimatedPressable>
  );
}

// --- Screen ------------------------------------------------------------------

export default function OrdersScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('ALL');
  const ordersRef = useRef<Order[]>([]);

  const loadOrders = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      if (mode === 'initial') setLoading(true);
      const data = await getOrders();
      const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      ordersRef.current = sorted;
      setOrders(sorted);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'We could not load your orders. Check your connection and try again.';
      if (ordersRef.current.length === 0) setError(message);
      else showAlert('Could not refresh', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);
  const onRefresh = useCallback(() => { setRefreshing(true); loadOrders('refresh'); }, [loadOrders]);

  const counts = useMemo(() => ({
    ALL: orders.length,
    ACTIVE: orders.filter((o) => !isClosed(o.status)).length,
    PAST: orders.filter((o) => isClosed(o.status)).length,
  }), [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (activeFilter === 'ACTIVE') result = result.filter((o) => !isClosed(o.status));
    else if (activeFilter === 'PAST') result = result.filter((o) => isClosed(o.status));
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) => o.shopName.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) ||
          (STATUS_META[o.status]?.label ?? '').toLowerCase().includes(q) ||
          o.items.some((item) => item.serviceItem.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, activeFilter, searchQuery]);

  const isNarrowed = activeFilter !== 'ALL' || searchQuery.trim().length > 0;
  const clearFilters = () => { setSearchQuery(''); setActiveFilter('ALL'); };

  const renderEmpty = () => {
    if (isNarrowed) {
      return (
        <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
          <View style={[styles.emptyIconBg, { backgroundColor: isDark ? theme.surface : theme.inputBg, borderColor: theme.border }]}>
            <MaterialIcons name="search-off" size={32} color={theme.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Matches</Text>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            {searchQuery.trim() ? `Nothing matches "${searchQuery.trim()}" in this view.` : 'This filter has no orders yet.'}
          </Text>
          <AnimatedPressable style={[styles.emptyBtn, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={clearFilters} accessibilityRole="button" accessibilityLabel="Clear search and filters">
            <MaterialIcons name="refresh" size={16} color={theme.text} />
            <Text style={[styles.emptyBtnText, { color: theme.text }]}>CLEAR FILTERS</Text>
          </AnimatedPressable>
        </Animated.View>
      );
    }
    return (
      <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
        <View style={[styles.emptyIconBg, { borderColor: theme.primary }]}>
          <MaterialIcons name="receipt-long" size={32} color={theme.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Orders Yet</Text>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          Your pickups, washes and deliveries will all show up here once you place your first order.
        </Text>
        <AnimatedPressable
          style={[styles.emptyBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
          onPress={() => router.push('/(tabs)' as any)}
          accessibilityRole="button"
          accessibilityLabel="Browse laundry shops"
        >
          <MaterialIcons name="storefront" size={16} color={theme.primaryText} />
          <Text style={[styles.emptyBtnText, { color: theme.primaryText }]}>BROWSE SHOPS</Text>
        </AnimatedPressable>
      </Animated.View>
    );
  };

  const renderError = () => (
    <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
      <View style={[styles.emptyIconBg, { borderColor: theme.danger }]}>
        <MaterialIcons name="cloud-off" size={32} color={theme.danger} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>Could Not Load</Text>
      <Text style={[styles.emptyText, { color: theme.textMuted }]}>{error}</Text>
      <AnimatedPressable
        style={[styles.emptyBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]}
        onPress={() => loadOrders()}
        accessibilityRole="button"
        accessibilityLabel="Try loading orders again"
      >
        <MaterialIcons name="refresh" size={16} color={theme.primaryText} />
        <Text style={[styles.emptyBtnText, { color: theme.primaryText }]}>TRY AGAIN</Text>
      </AnimatedPressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* -- Editorial Header ----------------------------------------------------------- */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerLabel, { color: theme.primary }]}>MY ACTIVITY</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Order History</Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: 'transparent', borderColor: theme.border }]}>
          <MaterialIcons name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search orders..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search orders"
          />
          {searchQuery.length > 0 && (
            <AnimatedPressable onPress={() => setSearchQuery('')} style={styles.clearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button" accessibilityLabel="Clear search">
              <MaterialIcons name="cancel" size={16} color={theme.textMuted} />
            </AnimatedPressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <FilterPill label="ALL" count={counts.ALL} active={activeFilter === 'ALL'} theme={theme} isDark={isDark} onPress={() => setActiveFilter('ALL')} />
          <FilterPill label="ACTIVE" count={counts.ACTIVE} active={activeFilter === 'ACTIVE'} theme={theme} isDark={isDark} onPress={() => setActiveFilter('ACTIVE')} />
          <FilterPill label="PAST" count={counts.PAST} active={activeFilter === 'PAST'} theme={theme} isDark={isDark} onPress={() => setActiveFilter('PAST')} />
        </ScrollView>
      </View>

      {/* -- Content ---------------------------------------------------------- */}
      {loading && !refreshing ? (
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {[0, 1, 2, 3].map((i) => <OrderCardSkeleton key={i} theme={theme} isDark={isDark} />)}
        </ScrollView>
      ) : error && orders.length === 0 ? (
        renderError()
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(order) => order.id}
          renderItem={({ item, index }) => (
            <OrderCard order={item} theme={theme} isDark={isDark} index={index} onPress={() => router.push(`/orders/${item.id}` as any)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListHeaderComponent={isNarrowed && filteredOrders.length > 0 ? (
            <Text style={[styles.resultCount, { color: theme.textMuted }]}>{filteredOrders.length} OF {orders.length} ORDERS</Text>
          ) : null}
          ListEmptyComponent={renderEmpty()}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }, filteredOrders.length === 0 && styles.listContentEmpty]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    marginBottom: 16,
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    letterSpacing: -0.2,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  clearBtn: { paddingLeft: 6 },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
  },
  filterText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  filterCount: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  filterCountText: { fontSize: 10, fontWeight: '700' },

  listContent: { padding: 20 },
  listContentEmpty: { flexGrow: 1, justifyContent: 'center' },
  separator: { height: 16 },
  resultCount: { fontSize: 10, fontWeight: '700', marginBottom: 12, letterSpacing: 2 },

  orderCard: {
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardInner: {
    flex: 1,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  shopInfoText: { flex: 1 },
  shopIconBg: {
    width: 34,
    height: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopName: { fontSize: 20, marginBottom: 2, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },
  orderMeta: { fontSize: 11, fontWeight: '500' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  rail: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 16,
    height: 4,
    overflow: 'hidden',
  },
  railSegment: { flex: 1, height: 4 },

  itemPreview: { fontSize: 13, fontWeight: '500', marginTop: 12, lineHeight: 19 },
  divider: { height: 1, marginVertical: 14 },

  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: { fontSize: 10, fontWeight: '700', marginBottom: 2, letterSpacing: 1.5 },
  total: { fontSize: 20, fontFamily: 'CormorantGaramond_500Medium' },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  viewDetailsText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },

  ratingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ratingHintText: { fontSize: 11, fontWeight: '700' },

  skelLine: {},

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 24, marginBottom: 8, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },
  emptyText: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 22, maxWidth: 300 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderWidth: 1,
  },
  emptyBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
});
