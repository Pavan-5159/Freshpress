/**
 * Auth Login / Sign-Up screen — Lovable "Maison" visual style.
 *
 * UI:          Warm cream bg, Cormorant Garamond serif headline, terracotta
 *              primary, minimal bordered inputs, elegant CTA button.
 * Functionality: FreshPress OTP flow, phone validation, sign-up fields,
 *              Google/Apple/Email social stubs — ALL PRESERVED.
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { requestOtp, loginWithSocial } from '@/services/authService';
import { showAlert } from '@/utils/alert';
import Button from '@/components/Button';
import TextField from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { radius } from '@/constants/theme';
import { MaisonImages } from '@/assets/images/maison';

export default function AuthIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  // Mode state: false = Sign Up, true = Login
  const [isLogin, setIsLogin] = useState(false);

  // Form State — ALL PRESERVED
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [dob, setDob] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const isValidPhone = /^[6-9]\d{9}$/.test(phone);

  // ─── Business Logic — ALL PRESERVED ────────────────────────────────────────

  const handleContinue = async () => {
    setErrorMsg('');

    if (!isLogin && !fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      showAlert('Missing Field', 'Please enter your full name.');
      return;
    }
    if (!isValidPhone) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      showAlert('Invalid Number', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!isLogin && !city) {
      setErrorMsg('Please choose your city.');
      showAlert('Missing Field', 'Please choose your city.');
      return;
    }
    if (!isLogin && !gender) {
      setErrorMsg('Please select your gender.');
      showAlert('Missing Field', 'Please select your gender.');
      return;
    }
    if (!isLogin && !agreed) {
      setErrorMsg('You must agree to the Terms & Conditions to continue.');
      showAlert('Required', 'You must agree to the Terms & Conditions to continue.');
      return;
    }

    setLoading(true);
    try {
      await requestOtp({ phone });
      router.push({ pathname: '/otp', params: { phone } });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send OTP. Please try again.';
      setErrorMsg(msg);
      showAlert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Alert.alert('Google Login', 'Google OAuth flow will be initiated here.');
    // In a real implementation with expo-auth-session, you would use:
    // const [request, response, promptAsync] = Google.useAuthRequest({ clientId: 'YOUR_CLIENT_ID' });
    // if (response?.type === 'success') { await loginWithSocial('google', response.authentication.accessToken); }
    try {
      setLoading(true);
      await loginWithSocial('google', 'dummy_google_token_' + Date.now());
      router.replace('/(tabs)');
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      await loginWithSocial('apple', 'dummy_apple_token_' + Date.now());
      router.replace('/(tabs)');
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = () => {
    router.push('/(auth)/email-login');
  };

  // ─── UI ─────────────────────────────────────────────────────────────────────

  const serifFont = theme.fontSerif;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand hero header ────────────────────────────────────────── */}
          <View style={styles.brand}>
            {/* Editorial background image */}
            <View style={styles.brandHeroWrap}>
              <Image
                source={MaisonImages.authBg}
                style={styles.brandHeroImage}
                resizeMode="cover"
              />
              <View style={styles.brandHeroOverlay} />
              <View style={styles.brandHeroContent}>
                <View style={[styles.logoWrap, { borderColor: 'rgba(255,255,255,0.2)' }]}>
                  <MaterialIcons name="local-laundry-service" size={32} color="#F9F5F0" />
                </View>
                <Text style={[styles.brandName, { color: '#FFFFFF', fontFamily: serifFont }]}>
                  FreshPress
                </Text>
                <Text style={[styles.brandTagline, { color: 'rgba(255,255,255,0.65)' }]}>
                  CLEAN CLOTHES · HAPPY YOU
                </Text>
              </View>
            </View>
          </View>

          {/* ── Form card ────────────────────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>

            {/* Heading */}
            <Text style={[styles.cardTitle, { color: theme.text, fontFamily: serifFont }]}>
              {isLogin ? 'Welcome Back' : "Let's Get Started"}
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textMuted }]}>
              {isLogin
                ? 'Enter your mobile number to sign in'
                : 'Enter your details to continue'}
            </Text>

            {/* Full Name (Sign Up only) */}
            {!isLogin && (
              <TextField
                label="Full Name"
                placeholder="Enter your full name"
                icon="person-outline"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            )}

            {/* Mobile Number */}
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Mobile Number</Text>
              <View
                style={[
                  styles.phoneRow,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor: isPhoneFocused ? theme.primary : theme.border,
                  },
                ]}
              >
                <MaterialIcons
                  name="smartphone"
                  size={18}
                  color={isPhoneFocused ? theme.primary : theme.textMuted}
                  style={styles.phoneIcon}
                />
                <Text style={[styles.countryCode, { color: theme.text }]}>+91</Text>
                <View style={[styles.codeDivider, { backgroundColor: theme.border }]} />
                <TextInput
                  style={[styles.phoneInput, { color: theme.text }]}
                  placeholder="10-digit number"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
                  accessible
                  accessibilityLabel="Phone Number Input"
                  accessibilityHint="Enter your 10-digit Indian mobile number"
                />
              </View>
            </View>

            {/* Email (Sign Up only) */}
            {!isLogin && (
              <TextField
                label="Email Address (Optional)"
                placeholder="Enter your email"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            {/* City (Sign Up only) */}
            {!isLogin && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Select City</Text>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={[styles.pickerRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={() => setCity('Mumbai')}
                  accessible
                  accessibilityLabel="City Picker"
                  accessibilityHint="Choose your current city"
                >
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={city ? theme.primary : theme.textMuted}
                    style={styles.phoneIcon}
                  />
                  <Text
                    style={[
                      styles.pickerText,
                      { color: city ? theme.text : theme.textMuted },
                    ]}
                  >
                    {city || 'Choose your city'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Gender (Sign Up only) */}
            {!isLogin && (
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>Gender</Text>
                <View style={styles.genderRow}>
                  {(['Male', 'Female', 'Other'] as const).map((opt) => {
                    const active = gender === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        style={[
                          styles.genderChip,
                          {
                            backgroundColor: active ? theme.primary : theme.inputBg,
                            borderColor: active ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setGender(opt)}
                      >
                        <Text
                          style={[
                            styles.genderChipText,
                            { color: active ? theme.primaryText : theme.textMuted },
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Date of Birth (Sign Up only) */}
            {!isLogin && (
              <TextField
                label="Date of Birth (Optional)"
                placeholder="DD / MM / YYYY"
                icon="calendar-today"
                value={dob}
                onChangeText={setDob}
              />
            )}

            {/* Terms & Conditions (Sign Up only) */}
            {!isLogin && (
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.7}
                accessible
                accessibilityLabel="Agree to Terms and Conditions"
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: agreed ? theme.primary : 'transparent',
                      borderColor: agreed ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {agreed && <MaterialIcons name="check" size={14} color={theme.primaryText} />}
                </View>
                <Text style={[styles.termsText, { color: theme.textMuted }]}>
                  I agree to the{' '}
                  <Text style={{ color: theme.primary }}>Terms & Conditions</Text>
                  {' '}and{' '}
                  <Text style={{ color: theme.primary }}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Error message */}
            {!!errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(220,38,38,0.12)' : '#FEF2F2', borderColor: isDark ? 'rgba(220,38,38,0.3)' : '#FECACA' }]}>
                <MaterialIcons name="error-outline" size={16} color={theme.danger} />
                <Text style={[styles.errorText, { color: theme.danger }]}>{errorMsg}</Text>
              </View>
            )}

            {/* Primary CTA */}
            <Button
              title={isLogin ? 'Send OTP' : 'Continue'}
              onPress={handleContinue}
              loading={loading}
              disabled={loading}
              style={styles.cta}
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerLabel, { color: theme.textMuted }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.socialBtn, { backgroundColor: theme.bg, borderColor: theme.border }]}
                onPress={handleGoogleLogin}
              >
                <FontAwesome name="google" size={18} color="#EA4335" />
                <Text style={[styles.socialBtnLabel, { color: theme.text }]}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.socialBtn, { backgroundColor: theme.bg, borderColor: theme.border }]}
                onPress={handleAppleLogin}
              >
                <FontAwesome name="apple" size={18} color={isDark ? '#EDE5D8' : '#000'} />
                <Text style={[styles.socialBtnLabel, { color: theme.text }]}>Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.socialBtn, { backgroundColor: theme.bg, borderColor: theme.border }]}
                onPress={handleEmailLogin}
              >
                <MaterialIcons name="mail-outline" size={18} color={theme.primary} />
                <Text style={[styles.socialBtnLabel, { color: theme.text }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Toggle Login / Sign Up */}
          <View style={styles.toggle}>
            <Text style={[styles.toggleText, { color: theme.textMuted }]}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
            </Text>
            <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setErrorMsg(''); }} activeOpacity={0.7}>
              <Text style={[styles.toggleLink, { color: theme.primary }]}>
                {isLogin ? 'Sign Up' : 'Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },

  // Brand hero
  brand: { marginBottom: 28, marginHorizontal: -24 },
  brandHeroWrap: {
    height: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  brandHeroImage: {
    width: '100%',
    height: '120%',
  },
  brandHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(41,36,32,0.6)',
  },
  brandHeroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 24,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 0,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brandName: { fontSize: 34, letterSpacing: 0.5 },
  brandTagline: { fontSize: 10, marginTop: 4, letterSpacing: 3, fontWeight: '700' },
  brandAccent: { width: 28, height: 2, marginTop: 12, borderRadius: 0, opacity: 0.7 },

  // Card
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#292420', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 16 },
      android: { elevation: 3 },
    }),
  },
  cardTitle: { fontSize: 26, letterSpacing: 0.3, marginBottom: 6 },
  cardSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },

  // Fields
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '500', marginBottom: 7, letterSpacing: 0.2 },

  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 50,
  },
  phoneIcon: { marginRight: 8 },
  countryCode: { fontSize: 15, fontWeight: '600', letterSpacing: 0.3 },
  codeDivider: { width: 1, height: 18, marginHorizontal: 10 },
  phoneInput: { flex: 1, fontSize: 15 },

  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 50,
  },
  pickerText: { flex: 1, fontSize: 15 },

  genderRow: { flexDirection: 'row', gap: 8 },
  genderChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipText: { fontSize: 13, fontWeight: '500', letterSpacing: 0.2 },

  // Terms
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, marginTop: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  termsText: { marginLeft: 10, fontSize: 13, flex: 1, lineHeight: 19 },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorText: { fontSize: 13, flex: 1, lineHeight: 18 },

  // CTA
  cta: { height: 52, marginTop: 4 },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { marginHorizontal: 12, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },

  // Social
  socialRow: { flexDirection: 'row', gap: 8 },
  socialBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    gap: 6,
  },
  socialBtnLabel: { fontSize: 13, fontWeight: '500' },

  // Toggle
  toggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  toggleText: { fontSize: 14 },
  toggleLink: { fontSize: 14, fontWeight: '700' },
});
