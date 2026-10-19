/**
 * Invoice screen — displays a detailed invoice for an order.
 * Dark-mode, animated, and accessible.
 * Requirement: 8.1–8.12
 */

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { radius } from '@/constants/theme';

export default function InvoiceScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const order = {
    id: id || 'ORD-XXXX',
    shopName: 'Supreme Laundry & Dry Clean',
    shopAddress: '32, Senapati Bapat Road, Pune, Maharashtra 411016',
    shopGst: 'GSTIN: 27AABCU9603R1ZX',
    orderDate: '15 Jan 2025, 10:30 AM',
    items: [
      { name: 'Shirt - Wash & Fold', quantity: 3, price: 35, total: 105 },
      { name: 'Pants - Wash & Fold', quantity: 2, price: 45, total: 90 },
      { name: 'Bed Sheet - Dry Clean', quantity: 2, price: 120, total: 240 },
    ],
    subtotal: 435,
    deliveryCharge: 40,
    tax: 23.75,
    discount: 50,
    grandTotal: 408.75,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Invoice</Text>
        <AnimatedPressable onPress={() => {}} style={styles.downloadButton} accessibilityLabel="Download invoice" accessibilityHint="Save invoice as PDF">
          <MaterialIcons name="file-download" size={24} color={theme.primary} />
        </AnimatedPressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.shopName, { color: theme.text }]} maxFontSizeMultiplier={1.5}>{order.shopName}</Text>
          <Text style={[styles.shopAddress, { color: theme.textMuted }]}>{order.shopAddress}</Text>
          <Text style={[styles.shopGst, { color: theme.textMuted }]}>{order.shopGst}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.orderInfoRow}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Order ID</Text>
            <Text style={[styles.value, { color: theme.text }]}>{order.id}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Date</Text>
            <Text style={[styles.value, { color: theme.text }]}>{order.orderDate}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
              <View style={styles.itemLeft}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemQty, { color: theme.textMuted }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.text }]}>₹{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Summary</Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Subtotal</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>₹{order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Delivery</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>₹{order.deliveryCharge.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Tax (5%)</Text>
            <Text style={[styles.totalValue, { color: theme.text }]}>₹{order.tax.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.success }]}>Discount</Text>
            <Text style={[styles.totalValue, { color: theme.success }]}>-₹{order.discount.toFixed(2)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotalRow, { borderTopColor: theme.border }]}>
            <Text style={[styles.grandTotalLabel, { color: theme.text }]}>Grand Total</Text>
            <Text style={[styles.grandTotalValue, { color: theme.primary }]}>₹{order.grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Information</Text>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Method</Text>
          <Text style={[styles.totalValue, { color: theme.text }]}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.textMuted }]}>Status</Text>
            <Text style={[styles.totalValue, { color: theme.success, fontWeight: '600' }]}>{order.paymentStatus}</Text>
          </View>
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
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  downloadButton: { padding: 4 },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: radius.md,
    elevation: 2,
  },
  shopName: { fontSize: 17, fontWeight: '700' },
  shopAddress: { fontSize: 13, marginTop: 4 },
  shopGst: { fontSize: 12, marginTop: 4 },
  orderInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemLeft: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 14, fontWeight: '500' },
  itemQty: { fontSize: 12, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 14, fontWeight: '500' },
  grandTotalRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 4 },
  grandTotalLabel: { fontSize: 16, fontWeight: '700' },
  grandTotalValue: { fontSize: 16, fontWeight: '700' },
});
