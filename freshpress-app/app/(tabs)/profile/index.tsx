/**
 * Profile tab - identity header, account cards, menu items and sign out.
 * Dark-mode, animated, and accessible.
 * Requirement: 11.1-11.9
 */

import { useState } from 'react';
import type { ComponentProps } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/theme';
import { radius } from '@/constants/theme';
import { shadow } from '@/constants/shadows';
import { showAlert } from '@/utils/alert';
import AnimatedPressable from '@/components/AnimatedPressable';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

const APP_VERSION = '1.0.0';

const hexToRgba = (hex: string, alpha: number) => {
  const value = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

const getInitials = (name?: string) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'G';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const formatPhone = (phone?: string) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
};

// --- Icon color map for tinted icon backgrounds -------------------------------

const ICON_TINTS: Record<string, string> = {
  'receipt-long':          '#3B82F6',
  'location-on':           '#10B981',
  'workspace-premium':     '#8B5CF6',
  'account-balance-wallet':'#F59E0B',
  'local-offer':           '#EF4444',
  'card-giftcard':         '#EC4899',
  'notifications-none':    '#06B6D4',
  'translate':             '#84CC16',
  'settings':              '#6B7280',
  'help-outline':          '#F97316',
};

// --- Menu primitives ----------------------------------------------------------

interface MenuGroupProps {
  title: string;
  delay: number;
  theme: ThemeColors;
  isDark: boolean;
  children: React.ReactNode;
}

function MenuGroup({ title, delay, theme, isDark, children }: MenuGroupProps) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(360)} layout={Layout.springify()} style={styles.menuGroup}>
      <Text style={[styles.menuGroupTitle, { color: theme.textMuted }]}>{title}</Text>
      <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }, shadow.sm]}>
        {children}
      </View>
    </Animated.View>
  );
}

interface MenuItemProps {
  icon: IconName;
  label: string;
  subLabel?: string;
  onPress: () => void;
  theme: ThemeColors;
  isDark: boolean;
  accent?: boolean;
  trailing?: string;
  isLast?: boolean;
}

function MenuItem({ icon, label, subLabel, onPress, theme, isDark, accent = false, trailing, isLast = false }: MenuItemProps) {
  const tintColor = accent ? theme.primary : (ICON_TINTS[icon] ?? theme.textMuted);
  const chipBg = hexToRgba(tintColor, isDark ? 0.15 : 0.09);

  return (
    <AnimatedPressable style={styles.menuItem} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityHint={subLabel}>
      <View style={[styles.menuIconBg, { backgroundColor: chipBg }]}>
        <MaterialIcons name={icon} size={20} color={tintColor} />
      </View>
      <View style={styles.menuTextContent}>
        <Text style={[styles.menuItemLabel, { color: theme.text }]} numberOfLines={1}>{label}</Text>
        {subLabel && <Text style={[styles.menuItemSubLabel, { color: theme.textMuted }]} numberOfLines={1}>{subLabel}</Text>}
      </View>
      {trailing && (
        <View style={[styles.trailingTag, { backgroundColor: hexToRgba(theme.primary, isDark ? 0.18 : 0.1) }]}>
          <Text style={[styles.trailingTagText, { color: theme.primary }]}>{trailing}</Text>
        </View>
      )}
      <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
      {!isLast && (
        <View style={[styles.menuDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]} />
      )}
    </AnimatedPressable>
  );
}

// --- Screen ------------------------------------------------------------------

export default function ProfileScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    showAlert('Sign out', 'You will need your phone number to sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch {
            // Session is cleared locally either way; nothing actionable to show.
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const phone = formatPhone(user?.phone);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* -- Header ----------------------------------------------------------- */}
      <View style={[styles.headerContainer, { paddingTop: insets.top, backgroundColor: theme.surface }]}>

        <Animated.View entering={FadeInDown.duration(360)} style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.pageTitleEyebrow, { color: theme.primary }]}>ACCOUNT</Text>
              <Text style={[styles.pageTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Profile</Text>
            </View>
            <AnimatedPressable
              onPress={() => router.push('/(tabs)/profile/edit')}
              style={[styles.editBtn, { borderColor: theme.border, backgroundColor: 'transparent' }]}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <MaterialIcons name="edit" size={14} color={theme.primary} />
              <Text style={[styles.editBtnText, { color: theme.primary }]}>EDIT</Text>
            </AnimatedPressable>
          </View>

          {/* Avatar + identity */}
          <View style={styles.profileRow}>
            {user?.profilePhotoUrl ? (
              <Image
                source={{ uri: user.profilePhotoUrl }}
                style={[styles.avatar, { borderColor: isDark ? 'rgba(59,130,246,0.4)' : '#FFFFFF' }]}
                accessibilityIgnoresInvertColors
                accessibilityLabel={`${user?.name || 'Your'} profile photo`}
              />
            ) : (
              <LinearGradient
                colors={['#8B5547', '#B07060']}
                style={[styles.avatar, styles.avatarFallback, { borderColor: isDark ? 'rgba(139,85,71,0.4)' : 'rgba(139,85,71,0.2)' }]}
              >
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </LinearGradient>
            )}

            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: theme.text, fontFamily: theme.fontSerif }]} numberOfLines={1}>
                {user?.name || 'Guest User'}
              </Text>
              <Text style={[styles.phone, { color: theme.textMuted }]} numberOfLines={1}>
                {phone ?? 'Add your phone number'}
              </Text>
              {memberSince && (
                <View style={[styles.memberRow, { backgroundColor: 'transparent', borderWidth: 1, borderColor: hexToRgba(theme.primary, 0.3), paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 8 }]}>
                  <MaterialIcons name="verified" size={11} color={theme.primary} />
                  <Text style={[styles.memberText, { color: theme.primary }]}>Member since {memberSince}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick stats row */}
          <View style={[styles.statsRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(37,99,235,0.12)' }]}>
            {[
              { value: '0', label: 'Orders', icon: 'receipt-long' as IconName, color: '#3B82F6' },
              { value: '?0', label: 'Wallet', icon: 'account-balance-wallet' as IconName, color: '#F59E0B' },
              { value: '0', label: 'Points', icon: 'stars' as IconName, color: '#8B5CF6' },
            ].map((stat, i) => (
              <View key={stat.label} style={[styles.statItem, i > 0 && { borderLeftWidth: 1, borderLeftColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' }]}>
                <MaterialIcons name={stat.icon} size={18} color={stat.color} />
                <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <View style={styles.contentPad}>
          <MenuGroup title="MY ACCOUNT" delay={100} theme={theme} isDark={isDark}>
            <MenuItem
              icon="receipt-long"
              label="My Orders"
              subLabel="Track, rate, or view invoices"
              onPress={() => router.push('/(tabs)/orders')}
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon="location-on"
              label="Saved Addresses"
              subLabel="Manage home and work addresses"
              onPress={() => router.push('/(tabs)/profile/addresses')}
              theme={theme}
              isDark={isDark}
              isLast
            />
          </MenuGroup>

          <MenuGroup title="PAYMENTS & OFFERS" delay={180} theme={theme} isDark={isDark}>
            <MenuItem
              icon="workspace-premium"
              label="FreshPress Premium"
              subLabel="Unlimited pickups and 24hr delivery"
              onPress={() => router.push('/subscription' as any)}
              theme={theme}
              isDark={isDark}
              accent
              trailing="Plans"
            />
            <MenuItem
              icon="account-balance-wallet"
              label="FreshPress Wallet"
              subLabel="Check balance and history"
              onPress={() => router.push('/(tabs)/profile/wallet')}
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon="local-offer"
              label="Coupons & Offers"
              subLabel="Available discounts"
              onPress={() => router.push('/(tabs)/profile/coupons')}
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon="card-giftcard"
              label="Refer & Earn"
              subLabel="Invite friends, get ?100"
              onPress={() => router.push('/(tabs)/profile/referral')}
              theme={theme}
              isDark={isDark}
              isLast
            />
          </MenuGroup>

          <MenuGroup title="PREFERENCES" delay={260} theme={theme} isDark={isDark}>
            <MenuItem
              icon="notifications-none"
              label="Notifications"
              subLabel="Order updates and offers"
              onPress={() => router.push('/(tabs)/profile/notifications')}
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon="translate"
              label="Language"
              subLabel="App display language"
              onPress={() => router.push('/(tabs)/profile/language')}
              theme={theme}
              isDark={isDark}
            />
            <MenuItem
              icon="settings"
              label="Settings"
              subLabel="Theme, privacy and account"
              onPress={() => router.push('/(tabs)/profile/settings')}
              theme={theme}
              isDark={isDark}
              isLast
            />
          </MenuGroup>

          <MenuGroup title="SUPPORT" delay={340} theme={theme} isDark={isDark}>
            <MenuItem
              icon="help-outline"
              label="Help & Support"
              subLabel="FAQs and contact options"
              onPress={() => router.push('/(tabs)/profile/help')}
              theme={theme}
              isDark={isDark}
              isLast
            />
          </MenuGroup>

          {/* -- Sign out ------------------------------------------------------ */}
          <Animated.View entering={FadeInDown.delay(420).duration(360)}>
            <AnimatedPressable
              style={[
                styles.logoutButton,
                { borderColor: hexToRgba(theme.danger, isDark ? 0.3 : 0.2), opacity: loggingOut ? 0.6 : 1 },
              ]}
              onPress={handleLogout}
              disabled={loggingOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              accessibilityState={{ disabled: loggingOut, busy: loggingOut }}
            >
              <View style={[styles.logoutGradient, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)' }]}>
                {loggingOut ? (
                  <ActivityIndicator size="small" color={theme.danger} />
                ) : (
                  <MaterialIcons name="logout" size={19} color={theme.danger} />
                )}
                <Text style={[styles.logoutText, { color: theme.danger }]}>
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </Text>
              </View>
            </AnimatedPressable>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.appInfo}>
            <View style={[styles.appLogoRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 }]}>
              <MaterialIcons name="local-laundry-service" size={14} color={theme.textMuted} />
              <Text style={[styles.appInfoText, { color: theme.textMuted }]}>FreshPress v{APP_VERSION}</Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: {
    paddingBottom: 20,
    overflow: 'hidden',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitleEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 36,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 0,
    borderWidth: 1,
  },
  editBtnText: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5 },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 3,
    marginRight: 16,
    ...shadow.md,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: { flex: 1 },
  name: {
    fontSize: 26,
    marginBottom: 3,
    letterSpacing: 0,
  },
  phone: { fontSize: 14, fontWeight: '500' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberText: { fontSize: 11, fontWeight: '700' },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 4,
    ...shadow.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 14,
  },
  statValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: { fontSize: 11, fontWeight: '600' },

  contentPad: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Menu
  menuGroup: { marginBottom: 20 },
  menuGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 62,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextContent: { flex: 1, justifyContent: 'center' },
  menuItemLabel: { fontSize: 15, fontWeight: '600' },
  menuItemSubLabel: { fontSize: 12.5, marginTop: 2 },
  trailingTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginRight: 6,
  },
  trailingTagText: { fontSize: 11, fontWeight: '800' },
  menuDivider: {
    position: 'absolute',
    left: 68,
    right: 0,
    bottom: 0,
    height: 1,
  },

  // Sign out
  logoutButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700' },

  // App info
  appInfo: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
  },
  appLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appInfoText: { fontSize: 12, fontWeight: '600' },
});
