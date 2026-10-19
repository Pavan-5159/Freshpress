/**
 * Settings screen — App Preferences, Theme, Notifications, Privacy, About.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { showAlert } from '@/utils/alert';
import { radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* General Section */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>General</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable style={[styles.row, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]} onPress={() => router.push('/(tabs)/profile/notifications')}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="notifications" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Notification Preferences</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
          </Pressable>

          <Pressable style={styles.row} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="language" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Language</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowValue, { color: theme.textMuted }]}>English</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
            </View>
          </Pressable>
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Preferences</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.row, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="notifications-active" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: isDark ? 'rgba(139, 85, 71, 0.5)' : '#D6BBA5' }}
              thumbColor={notificationsEnabled ? theme.primary : theme.textMuted}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="dark-mode" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.border, true: isDark ? 'rgba(139, 85, 71, 0.5)' : '#D6BBA5' }}
              thumbColor={darkMode ? theme.primary : theme.textMuted}
            />
          </View>

          <View style={[styles.row, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="fingerprint" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Biometric Login</Text>
            </View>
            <Switch
              value={biometricLogin}
              onValueChange={setBiometricLogin}
              trackColor={{ false: theme.border, true: isDark ? 'rgba(139, 85, 71, 0.5)' : '#D6BBA5' }}
              thumbColor={biometricLogin ? theme.primary : theme.textMuted}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="mail" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Marketing Emails</Text>
            </View>
            <Switch
              value={marketingEmails}
              onValueChange={setMarketingEmails}
              trackColor={{ false: theme.border, true: isDark ? 'rgba(139, 85, 71, 0.5)' : '#D6BBA5' }}
              thumbColor={marketingEmails ? theme.primary : theme.textMuted}
            />
          </View>
        </View>

        {/* Account */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Account</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable style={[styles.row, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]} onPress={() => showAlert('Coming Soon', 'Change password will be available shortly.')}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="lock" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Change Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
          </Pressable>

          <Pressable style={[styles.row, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="privacy-tip" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Privacy Policy</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
          </Pressable>

          <Pressable style={styles.row} onPress={() => {}}>
            <View style={styles.rowLeft}>
              <MaterialIcons name="description" size={22} color={theme.primary} />
              <Text style={[styles.rowLabel, { color: theme.text }]}>Terms of Service</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Danger Zone</Text>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Pressable
            style={styles.dangerRow}
            onPress={() =>
              showAlert(
                'Delete Account',
                'This action is permanent and cannot be undone. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' as any },
                  {
                    text: 'Delete',
                    style: 'destructive' as any,
                    onPress: () => showAlert('Not Available', 'Account deletion is not yet implemented.'),
                  },
                ]
              )
            }
          >
            <MaterialIcons name="delete-forever" size={22} color={theme.danger} />
            <Text style={[styles.dangerLabel, { color: theme.danger }]}>Delete Account</Text>
          </Pressable>
        </View>

        <View style={{ height: 24 }} />
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
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, letterSpacing: 0, flex: 1, textAlign: 'center', marginRight: 32 },
  spacer: { width: 32 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 14, marginRight: 4 },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dangerLabel: { fontSize: 15, fontWeight: '500' },
});
