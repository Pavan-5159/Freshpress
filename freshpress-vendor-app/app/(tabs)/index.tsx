import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '@/services/api';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  user: {
    name: string;
    phone: string;
  };
  createdAt: string;
}

export default function VendorDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      // Fetch only active orders to manage
      const response = await api.get('/v1/vendors/orders?limit=50');
      if (response.data?.data?.orders) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/v1/vendors/orders/${orderId}/status`, { status: newStatus });
      // Update local state to reflect change quickly
      setOrders((prev) => 
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
      Alert.alert('Success', `Order marked as ${newStatus}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update order');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FFA500'; // Orange
      case 'ACCEPTED': return '#3b82f6'; // Blue
      case 'IN_PROCESS': return '#8b5cf6'; // Purple
      case 'READY_FOR_DELIVERY': return '#10b981'; // Green
      case 'CANCELLED': return '#ef4444'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const renderOrderActions = (order: Order) => {
    if (order.status === 'PENDING') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]} 
            onPress={() => updateOrderStatus(order.id, 'CANCELLED')}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.acceptBtn]} 
            onPress={() => updateOrderStatus(order.id, 'ACCEPTED')}
          >
            <Text style={styles.acceptText}>Accept Order</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (order.status === 'PICKED_UP' || order.status === 'ACCEPTED') {
       return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.processBtn]} 
            onPress={() => updateOrderStatus(order.id, 'IN_PROCESS')}
          >
            <Text style={styles.processText}>Start Processing</Text>
          </TouchableOpacity>
        </View>
       );
    }

    if (order.status === 'IN_PROCESS') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.readyBtn]} 
            onPress={() => updateOrderStatus(order.id, 'READY_FOR_DELIVERY')}
          >
            <Text style={styles.readyText}>Mark Ready for Delivery</Text>
          </TouchableOpacity>
        </View>
       );
    }

    return null;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace(/_/g, ' ')}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.customerName}>{item.user?.name || 'Customer'}</Text>
        <Text style={styles.customerPhone}>{item.user?.phone || 'No phone'}</Text>
        <Text style={styles.totalText}>₹{item.total}</Text>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      
      {renderOrderActions(item)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendor Dashboard</Text>
        <Text style={styles.subtitle}>Manage your incoming orders</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1a1a1a" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active orders found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#fee2e2',
  },
  rejectText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: '#0f172a',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '700',
  },
  processBtn: {
    backgroundColor: '#f3e8ff',
  },
  processText: {
    color: '#8b5cf6',
    fontWeight: '700',
  },
  readyBtn: {
    backgroundColor: '#d1fae5',
  },
  readyText: {
    color: '#10b981',
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16,
  },
});
