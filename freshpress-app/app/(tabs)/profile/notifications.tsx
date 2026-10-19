/**
 * Notification preferences screen — toggle push notifications per event type.
 * Requirement: 9.6, 9.7, 11.6
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getPreferences, updatePreferences } from '@/services/notificationService';
import type { NotificationEventType } from '@/types';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';

const EVENT_LABELS: Record<NotificationEventType, { label: string; description: string }> = {
  ORDER_CONFIRMED: { label: 'Order Confirmed', description: 'When a shop accepts your order' },
  ORDER_PICKED_UP: { label: 'Picked Up', description: 'When your laundry is picked up' },
  ORDER_READY: { label: 'Ready for Delivery', description: 'When your order is ready' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', description: 'When the delivery is on the way' },
  ORDER_DELIVERED: { label: 'Delivered', description: 'When your order arrives' },
};

const ALL_EVENTS: NotificationEventType[] = [
  'ORDER_CONFIRMED',
  'ORDER_PICKED_UP',
  'ORDER_READY',
  'OUT_FOR_DELIVERY',
  'ORDER_DELIVERED',
];

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [preferences, setPreferences] = useState<Record<NotificationEventType, boolean> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<NotificationEventType | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getPreferences();
      // Ensure all keys exist
      const prefs = { ...ALL_EVENTS.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<NotificationEventType, boolean>), ...data.preferences };
      setPreferences(prefs);
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to load preferences.');
      // Set defaults on error
      setPreferences(
        ALL_EVENTS.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<NotificationEventType, boolean>)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (event: NotificationEventType, value: boolean) => {
    if (!preferences) return;
    const updated = { ...preferences, [event]: value };
    setPreferences(updated);
    setSaving(event);
    try {
      await updatePreferences(updated);
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to update preferences.');
      // Revert
      setPreferences((prev) => (prev ? { ...prev, [event]: !value } : prev));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Notifications</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Order Updates</Text>
        <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
          Choose which order status updates you want to receive.
        </Text>
        {preferences &&
          ALL_EVENTS.map((event) => (
            <View key={event} style={[styles.row, { backgroundColor: theme.surface, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
              <View style={styles.rowLeft}>
                <MaterialIcons
                  name="notifications"
                  size={20}
                  color={theme.primary}
                  style={styles.rowIcon}
                />
                <View>
                  <Text style={[styles.rowLabel, { color: theme.text }]}>{EVENT_LABELS[event].label}</Text>
                  <Text style={[styles.rowDesc, { color: theme.textMuted }]}>{EVENT_LABELS[event].description}</Text>
                </View>
              </View>
              {saving === event ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Switch
                  value={preferences[event]}
                  onValueChange={(v) => handleToggle(event, v)}
                  trackColor={{ false: theme.border, true: isDark ? 'rgba(139, 85, 71, 0.5)' : '#D6BBA5' }}
                  thumbColor={preferences[event] ? theme.primary : theme.textMuted}
                />
              )}
            </View>
          ))}
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
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, letterSpacing: 0, flex: 1, textAlign: 'center', marginRight: 32 },
  spacer: { width: 32 },
  sectionLabel: { fontSize: 20, letterSpacing: 0, marginTop: 16, paddingHorizontal: 16, fontFamily: 'CormorantGaramond_500Medium' },
  sectionDesc: { fontSize: 13, marginTop: 4, marginBottom: 12, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  rowIcon: {},
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowDesc: { fontSize: 12, marginTop: 2 },
});
