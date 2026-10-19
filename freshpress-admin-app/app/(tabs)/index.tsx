import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/services/api';

interface PlatformOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  user: {
    name: string;
    phone: string;
  };
  shop?: {
    name: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<PlatformOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlatformOrders = async () => {
    try {
      const response = await api.get('/v1/orders/all?limit=100');
      if (response.data?.data?.orders) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch platform orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlatformOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPlatformOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b'; // Amber
      case 'ACCEPTED': return '#3b82f6'; // Blue
      case 'IN_PROCESS': return '#8b5cf6'; // Purple
      case 'READY_FOR_DELIVERY': return '#10b981'; // Green
      case 'DELIVERED': return '#16a34a'; // Darker Green
      case 'CANCELLED': return '#ef4444'; // Red
      default: return '#64748b'; // Slate
    }
  };

  const renderOrder = ({ item }: { item: PlatformOrder }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{item.user?.name || 'Guest'} ({item.user?.phone || 'No Phone'})</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vendor:</Text>
          <Text style={styles.value}>{item.shop?.name || 'Unassigned'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.valueBold}>₹{item.total}</Text>
        </View>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>System Overview</Text>
        <Text style={styles.subtitle}>Recent Platform Orders</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0f172a" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No platform orders found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 1, shadowOpacity: 0.05, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNumber: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardBody: { gap: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 14, color: '#64748b', fontWeight: '500', width: 80 },
  value: { fontSize: 14, color: '#1e293b', flex: 1, textAlign: 'right' },
  valueBold: { fontSize: 14, color: '#0f172a', fontWeight: '700', flex: 1, textAlign: 'right' },
  dateText: { fontSize: 12, color: '#94a3b8', marginTop: 8, textAlign: 'right' },
  emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#64748b', fontSize: 16 },
});
