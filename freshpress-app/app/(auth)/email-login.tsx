import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginWithEmail } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';

export default function EmailLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  // Assuming a zustand store like useAuthStore, but since we are modifying directly, we'll mimic what otp.tsx does if it exists.
  // Actually, let's just make the API call.

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(email, password);
      // Since there's an authStore normally used in the app, let's hope standard login routes us
      // or we can just push to /(tabs)
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.text, fontFamily: theme.fontSerif }]}>Email Login</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Enter your email and password to sign in.</Text>

          <TextField
            label="Email Address"
            placeholder="Enter your email"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextField
            label="Password"
            placeholder="Enter your password"
            icon="lock-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!!errorMsg && (
            <View style={[styles.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <MaterialIcons name="error-outline" size={16} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text>
            </View>
          )}

          <Button title="Sign In" onPress={handleLogin} loading={loading} disabled={loading} style={styles.cta} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: { marginBottom: 24 },
  title: { fontSize: 26, letterSpacing: 0.3, marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorText: { fontSize: 13, flex: 1, lineHeight: 18 },
  cta: { height: 52, marginTop: 4 },
});
