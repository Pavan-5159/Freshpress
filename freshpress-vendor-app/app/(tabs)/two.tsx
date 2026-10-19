import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopStatus();
  }, []);

  const fetchShopStatus = async () => {
    try {
      const response = await api.get('/v1/vendors/shop');
      if (response.data?.data) {
        setIsOpen(response.data.data.isOpen);
      }
    } catch (error) {
      console.error('Failed to fetch shop status', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleShopStatus = async (value: boolean) => {
    // Optimistic UI update
    setIsOpen(value);
    try {
      await api.patch('/v1/vendors/shop/status', { isOpen: value });
    } catch (error) {
      // Revert if failed
      setIsOpen(!value);
      Alert.alert('Error', 'Failed to update shop status');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Profile</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Vendor Name</Text>
            <Text style={styles.value}>{user?.name || 'Loading...'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{user?.phone || 'Loading...'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop Operations</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Accepting Orders</Text>
              <Text style={styles.subtext}>
                {isOpen ? 'Your shop is open' : 'Your shop is currently closed'}
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Switch
                value={isOpen}
                onValueChange={toggleShopStatus}
                trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                thumbColor="#fff"
              />
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
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
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  value: {
    fontSize: 16,
    color: '#64748b',
  },
  subtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  logoutBtn: {
    margin: 20,
    marginTop: 40,
    backgroundColor: '#fee2e2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
