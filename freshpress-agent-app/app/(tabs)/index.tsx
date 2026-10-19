import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { agentApi } from '@/services/api';

interface Assignment {
  id: string;
  orderId: string;
  type: 'PICKUP' | 'DELIVERY';
  status: string;
  notes: string;
  order: {
    orderNumber: string;
    user: {
      name: string;
      phone: string;
    };
    address: {
      street: string;
      city: string;
      pincode: string;
    };
    shop: {
      name: string;
      phone: string;
      addressLine: string;
    };
  };
}

export default function AgentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = async () => {
    try {
      const response = await agentApi.getAssignments(50);
      if (response.data?.data) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await agentApi.updateAssignmentStatus(id, newStatus);
      setAssignments((prev) => 
        prev.map(a => a.id === id ? { ...a, status: newStatus } : a)
      );
      Alert.alert('Success', `Assignment marked as ${newStatus}`);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update assignment');
    }
  };

  const renderActions = (item: Assignment) => {
    if (item.status === 'ASSIGNED') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectBtn]} 
            onPress={() => updateStatus(item.id, 'REJECTED')}
          >
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.acceptBtn]} 
            onPress={() => updateStatus(item.id, 'ACCEPTED')}
          >
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.status === 'ACCEPTED') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.transitBtn]} 
            onPress={() => updateStatus(item.id, 'IN_TRANSIT')}
          >
            <Text style={styles.transitText}>Start Navigating</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.status === 'IN_TRANSIT') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.completeBtn]} 
            onPress={() => updateStatus(item.id, 'COMPLETED')}
          >
            <Text style={styles.completeText}>Mark Completed</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderItem = ({ item }: { item: Assignment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>#{item.order.orderNumber}</Text>
        <View style={[styles.typeBadge, item.type === 'PICKUP' ? styles.pickupBadge : styles.deliveryBadge]}>
          <Text style={[styles.typeText, item.type === 'PICKUP' ? styles.pickupText : styles.deliveryText]}>
            {item.type}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.statusText}>Status: {item.status}</Text>
        
        <View style={styles.addressBlock}>
          <Text style={styles.addressTitle}>Customer Details:</Text>
          <Text style={styles.addressText}>{item.order.user.name} ({item.order.user.phone})</Text>
          <Text style={styles.addressText}>{item.order.address.street}, {item.order.address.city}</Text>
        </View>

        {item.order.shop && (
          <View style={styles.addressBlock}>
            <Text style={styles.addressTitle}>Shop Details:</Text>
            <Text style={styles.addressText}>{item.order.shop.name} ({item.order.shop.phone})</Text>
            <Text style={styles.addressText}>{item.order.shop.addressLine}</Text>
          </View>
        )}
      </View>
      
      {renderActions(item)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No active assignments found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  title: { fontSize: 28, fontWeight: '800', color: '#0f172a' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pickupBadge: { backgroundColor: '#e0e7ff' },
  pickupText: { color: '#4f46e5', fontSize: 12, fontWeight: '700' },
  deliveryBadge: { backgroundColor: '#dcfce7' },
  deliveryText: { color: '#16a34a', fontSize: 12, fontWeight: '700' },
  cardBody: { marginBottom: 16 },
  statusText: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 12 },
  addressBlock: { marginBottom: 12 },
  addressTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  addressText: { fontSize: 14, color: '#1e293b' },
  actionRow: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#fee2e2' },
  rejectText: { color: '#ef4444', fontWeight: '700' },
  acceptBtn: { backgroundColor: '#1e3a8a' },
  acceptText: { color: '#fff', fontWeight: '700' },
  transitBtn: { backgroundColor: '#fef9c3' },
  transitText: { color: '#ca8a04', fontWeight: '700' },
  completeBtn: { backgroundColor: '#dcfce7' },
  completeText: { color: '#16a34a', fontWeight: '700' },
  emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#64748b', fontSize: 16 },
});
