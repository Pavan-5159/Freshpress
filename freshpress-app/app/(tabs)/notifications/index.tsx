/**
 * Notification Inbox — lists all push notifications (orders, promos, system).
 * Lovable "Maison" editorial style.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationType = 'order' | 'promo' | 'system';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  order: 'local-mall',
  promo: 'local-offer',
  system: 'notifications',
};

const TYPE_COLORS: Record<NotificationType, string> = {
  order: '#8B5547', // Maison terracotta
  promo: '#A67C52', // Maison warm gold
  system: '#7A6E67', // Maison muted
};

export default function NotificationsScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', type: 'order', title: 'Order Delivered', body: 'Your laundry order #FP1024 has been successfully delivered.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), read: false },
    { id: '2', type: 'promo', title: 'Weekend Special', body: 'Use code WEEKEND to get flat 50% off on all dry cleaning services this weekend.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
    { id: '3', type: 'order', title: 'Order Picked Up', body: 'Our executive has picked up your order #FP1025. It will be processed soon.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
    { id: '4', type: 'system', title: 'App Update Available', body: 'A new version of FreshPress is available with exciting features. Update now!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), read: true },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>INBOX</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          {notifications.length > 0 && (
            <AnimatedPressable
              onPress={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
              accessibilityLabel="Mark all as read"
              style={styles.markAllBtn}
            >
              <MaterialIcons name="done-all" size={20} color={theme.primary} />
            </AnimatedPressable>
          )}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          notifications.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Updates</Text>
              {unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} NEW</Text>
                </View>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const iconColor = TYPE_COLORS[item.type] || theme.primary;
          return (
            <AnimatedPressable
              style={[
                styles.notificationCard,
                { backgroundColor: item.read ? 'transparent' : (isDark ? theme.surface : theme.linen) },
                !item.read && {
                  borderColor: theme.primary,
                  borderWidth: 1,
                },
                item.read && {
                  borderColor: theme.border,
                  borderBottomWidth: 1,
                }
              ]}
              onPress={() => markAsRead(item.id)}
              scaleOnPress={0.98}
              accessibilityLabel={`${item.title}: ${item.body}`}
              accessibilityRole="button"
            >
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.iconBg,
                      { backgroundColor: item.read ? (isDark ? 'rgba(255,255,255,0.05)' : theme.inputBg) : 'transparent', borderWidth: item.read ? 0 : 1, borderColor: iconColor }
                    ]}
                  >
                    <MaterialIcons
                      name={TYPE_ICONS[item.type] as any}
                      size={18}
                      color={item.read ? theme.textMuted : iconColor}
                    />
                  </View>
                </View>
                <Text style={[styles.time, { color: theme.textMuted }]}>{formatTime(item.timestamp)}</Text>
              </View>

              <View style={styles.content}>
                <Text
                  style={[styles.title, { color: item.read ? theme.textMuted : theme.text }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.body, { color: item.read ? theme.textMuted : theme.text }]}
                  numberOfLines={2}
                >
                  {item.body}
                </Text>
              </View>

              <AnimatedPressable
                onPress={() => dismissNotification(item.id)}
                accessibilityLabel="Dismiss notification"
                accessibilityRole="button"
                hitSlop={12}
                style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.inputBg }]}
              >
                <MaterialIcons name="close" size={14} color={theme.textMuted} />
              </AnimatedPressable>
            </AnimatedPressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { borderColor: theme.border }]}>
              <MaterialIcons name="notifications-none" size={48} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>No Notifications</Text>
            <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
              You're all caught up! We'll notify you when there's an update on your order.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 2 },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
  },
  headerRight: { width: 32, alignItems: 'flex-end' },
  markAllBtn: { padding: 4 },
  
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'CormorantGaramond_500Medium', letterSpacing: -0.2 },
  unreadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unreadBadgeText: { color: '#F9F5F0', fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  notificationCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },
  content: { paddingRight: 32 },
  title: { fontSize: 16, fontFamily: 'CormorantGaramond_500Medium', marginBottom: 4 },
  body: { fontSize: 13, lineHeight: 20 },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120, paddingHorizontal: 32 },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: { fontSize: 24, marginBottom: 8, letterSpacing: -0.5 },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
