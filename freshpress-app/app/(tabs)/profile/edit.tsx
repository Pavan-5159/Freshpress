/**
 * Edit profile screen — update name and profile photo.
 * Lovable "Maison" editorial style.
 * Requirement: 11.2, 11.3, 11.8
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length > 50) newErrors.name = 'Name must be under 50 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!user) {
      showAlert('Error', 'You must be logged in to update your profile.');
      return;
    }
    setSaving(true);
    try {
      setUser({ ...user, name: name.trim() });
      showAlert('Saved', 'Your profile has been updated.');
      router.back();
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={[styles.eyebrow, { color: theme.primary }]}>SETTINGS</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { borderColor: theme.border, backgroundColor: isDark ? theme.surface : theme.linen }]}>
            <MaterialIcons name="person" size={40} color={theme.primary} />
          </View>
          <AnimatedPressable style={styles.changePhotoButton} accessibilityLabel="Change profile photo" accessibilityRole="button">
            <Text style={[styles.changePhotoText, { color: theme.primary }]}>CHANGE PHOTO</Text>
          </AnimatedPressable>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.primary }]}>FULL NAME</Text>
          <TextInput
            style={[styles.input, { borderColor: errors.name ? theme.danger : theme.border, color: theme.text, backgroundColor: 'transparent' }]}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="words"
            maxLength={50}
            accessibilityLabel="Your name"
          />
          {errors.name && <Text style={[styles.errorText, { color: theme.danger }]}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.primary }]}>PHONE NUMBER</Text>
          <View style={[styles.inputDisabled, { borderColor: theme.border, backgroundColor: isDark ? theme.surface : theme.inputBg }]}>
            <Text style={[styles.inputDisabledText, { color: theme.textMuted }]}>{user?.phone || 'Not available'}</Text>
          </View>
          <Text style={[styles.helperText, { color: theme.textMuted }]}>Phone number cannot be changed</Text>
        </View>

        <AnimatedPressable
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSave}
          disabled={saving}
          scaleOnPress={0.97}
        >
          {saving ? (
            <ActivityIndicator color={theme.primaryText} size="small" />
          ) : (
            <Text style={[styles.saveBtnText, { color: theme.primaryText }]}>SAVE CHANGES</Text>
          )}
        </AnimatedPressable>
      </View>
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
  headerRight: { width: 32 },

  content: { paddingHorizontal: 20, paddingTop: 32 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatar: { 
    width: 90, 
    height: 90, 
    borderWidth: 1,
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 16,
  },
  changePhotoButton: { padding: 8 },
  changePhotoText: { fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
  },
  inputDisabled: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputDisabledText: { fontSize: 15 },
  helperText: { fontSize: 11, marginTop: 6, fontWeight: '500' },
  errorText: { fontSize: 11, marginTop: 6, fontWeight: '500' },

  saveBtn: {
    marginTop: 24,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
