import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Profile</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Admin Name</Text>
            <Text style={styles.value}>{user?.name || 'Administrator'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Role</Text>
            <Text style={[styles.value, { color: '#2563eb', fontWeight: '700' }]}>{user?.role || 'ADMIN'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out from System</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  section: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  label: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  value: { fontSize: 16, color: '#64748b' },
  logoutBtn: { margin: 20, marginTop: 40, backgroundColor: '#0f172a', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
