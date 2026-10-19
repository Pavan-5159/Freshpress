/**
 * Order Detail screen — shows full order items, status timeline, actions.
 * Dark-mode, animated, and accessible.
 * Requirement: 8.1–8.12, 10.1–10.3
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getOrderById, cancelOrder } from '@/services/orderService';
import { submitRating } from '@/services/ratingService';
import type { Order, OrderStatus } from '@/types';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { radius } from '@/constants/theme';
import Button from '@/components/Button';

const STATUS_FLOW: OrderStatus[] = [
  'PENDING', 'CONFIRMED', 'PICKED_UP', 'IN_PROGRESS', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED',
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending', CONFIRMED: 'Confirmed', PICKED_UP: 'Picked Up',
  IN_PROGRESS: 'In Progress', READY: 'Ready', OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered', CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', PICKED_UP: '#8b5cf6',
  IN_PROGRESS: '#6366f1', READY: '#10b981', OUT_FOR_DELIVERY: '#14b8a6',
  DELIVERED: '#10b981', CANCELLED: '#ef4444',
};

export default function OrderDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingText, setRatingText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showAlert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' as any },
      {
        text: 'Yes, Cancel',
        style: 'destructive' as any,
        onPress: async () => {
          try {
            setCancelling(true);
            await cancelOrder(id);
            showAlert('Cancelled', 'Your order has been cancelled.');
            loadOrder();
          } catch (err: any) {
            showAlert('Error', err?.message || 'Failed to cancel order.');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const handleRatingSubmit = async () => {
    if (ratingStars === 0) return;
    try {
      setSubmittingRating(true);
      await submitRating({
        orderId: id,
        stars: ratingStars as 1 | 2 | 3 | 4 | 5,
        text: ratingText.trim() || undefined,
      });
      showAlert('Thank You!', 'Your rating has been submitted.');
      loadOrder();
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading || !order) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const canRate = order.status === 'DELIVERED' && !order.ratingSubmitted;
  const statusIndex = order.status === 'CANCELLED' ? -1 : STATUS_FLOW.indexOf(order.status);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
          </AnimatedPressable>
          <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Order Details</Text>
          <View style={styles.spacer} />
        </View>

        {/* Shop & Status */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.shopName, { color: theme.text, fontFamily: theme.fontSerif }]}>{order.shopName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] }]}>
            <Text style={styles.statusText}>
              {STATUS_LABELS[order.status].toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.orderDate, { color: theme.textMuted }]}>Placed on {formatDate(order.createdAt)}</Text>
          {order.turnaroundMinutes > 0 && (
            <Text style={[styles.turnaround, { color: theme.primary }]}>
              Est. delivery in {Math.round(order.turnaroundMinutes / 60)}h
            </Text>
          )}
        </View>

        {/* Status Timeline */}
        {order.status !== 'CANCELLED' && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Order Status</Text>
            <View style={styles.timelineContainer}>
              {STATUS_FLOW.map((status, index) => {
                const isActive = index <= statusIndex;
                const isCurrent = status === order.status;
                return (
                  <View key={status} style={styles.timelineRow}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          isActive && { backgroundColor: theme.success },
                          isCurrent && { backgroundColor: theme.primary, width: 14, height: 14, borderRadius: 7 },
                          !isActive && { backgroundColor: theme.border },
                        ]}
                      />
                      {index < STATUS_FLOW.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            index < statusIndex ? { backgroundColor: theme.success } : { backgroundColor: theme.border },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineRight}>
                      <Text style={[styles.timelineLabel, isActive && { color: theme.text }]}>
                        {STATUS_LABELS[status]}
                      </Text>
                      {order.statusTimestamps && order.statusTimestamps[status] && (
                        <Text style={[styles.timelineDate, { color: theme.textMuted }]}>
                          {new Date(order.statusTimestamps[status]!).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Items</Text>
          {order.items.map((item) => (
            <View key={item.serviceItem.id} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
              <View style={styles.itemLeft}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.serviceItem.name}</Text>
                <Text style={[styles.itemQty, { color: theme.textMuted }]}>x{item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.text }]}>₹{item.lineTotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Bill */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Bill Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>₹{order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>₹{order.taxAmount.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: theme.border }]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>₹{order.grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Delivery Address</Text>
          <Text style={[styles.addressLabel, { color: theme.text }]}>{order.deliveryAddress.label}</Text>
          <Text style={[styles.addressText, { color: theme.textMuted }]}>{order.deliveryAddress.formattedAddress}</Text>
        </View>

        {order.pickupInstructions && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Pickup Instructions</Text>
            <Text style={[styles.instructionsText, { color: theme.textMuted }]}>{order.pickupInstructions}</Text>
          </View>
        )}

        {/* Rating */}
        {canRate && (
          <View style={[styles.section, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Rate Your Order</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <AnimatedPressable key={star} onPress={() => setRatingStars(star)}>
                  <MaterialIcons
                    name={star <= ratingStars ? "star" : "star-border"}
                    size={24}
                    color={star <= ratingStars ? theme.warning : theme.border}
                  />
                </AnimatedPressable>
              ))}
            </View>
            {ratingStars > 0 && (
              <>
                <TextInput
                  style={[styles.ratingInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.inputBg }]}
                  placeholder="Write a review (optional)..."
                  placeholderTextColor={theme.textMuted}
                  value={ratingText}
                  onChangeText={setRatingText}
                  multiline
                  maxLength={500}
                />
                <Button
                  title="Submit Rating"
                  onPress={handleRatingSubmit}
                  loading={submittingRating}
                />
              </>
            )}
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Footer Actions */}
      {canCancel && (
        <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <Button
            title="Cancel Order"
            onPress={handleCancel}
            loading={cancelling}
            variant="outline"
            style={{ borderColor: theme.danger }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, borderBottomWidth: 1 },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, letterSpacing: 0, flex: 1, textAlign: 'center', marginRight: 32 },
  spacer: { width: 32 },
  section: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: radius.md },
  sectionTitle: { fontSize: 20, letterSpacing: 0, marginBottom: 12 },
  shopName: { fontSize: 22, letterSpacing: 0, marginBottom: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.lg, alignSelf: 'flex-start', marginBottom: 8 },
  statusText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  orderDate: { fontSize: 13 },
  turnaround: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  timelineContainer: { paddingLeft: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', width: 20 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { width: 2, flex: 1, marginVertical: 2 },
  timelineRight: { flex: 1, paddingLeft: 12 },
  timelineLabel: { fontSize: 13, flex: 1 },
  timelineDate: { fontSize: 11, marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', flexShrink: 1 },
  itemQty: { fontSize: 13 },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: '700' },
  addressLabel: { fontSize: 14, fontWeight: '600' },
  addressText: { fontSize: 14, marginTop: 4 },
  instructionsText: { fontSize: 14, lineHeight: 20 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  ratingInput: { borderWidth: 1, borderRadius: radius.sm, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  ratingButton: { borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  cancelButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderWidth: 1, borderRadius: radius.md, gap: 8 },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
});
