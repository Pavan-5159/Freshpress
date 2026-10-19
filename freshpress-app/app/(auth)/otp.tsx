/**
 * OTP Verification screen — Lovable "Maison" visual style.
 *
 * UI:          Warm cream bg, terracotta focus ring on OTP boxes, linen card.
 * Functionality: shake animation, resend cooldown, success overlay — ALL PRESERVED.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { verifyOtp, requestOtp } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { OTP_RESEND_COOLDOWN_S } from '@/constants/config';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { radius } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  useReducedMotion,
} from 'react-native-reanimated';

export default function OtpScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_COOLDOWN_S);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [successState, setSuccessState] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { setToken, setUser } = useAuthStore();
  const reducedMotion = useReducedMotion();

  // Animation values
  const shakeAnim = useSharedValue(0);
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const loadingPulse = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnim.value }],
  }));

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loadingPulse.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const triggerShake = () => {
    if (reducedMotion) return;
    shakeAnim.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  };

  const triggerSuccess = () => {
    if (reducedMotion) {
      setSuccessState(true);
      return;
    }
    setSuccessState(true);
    cardOpacity.value = withTiming(0, { duration: 200 });
    successScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    successOpacity.value = withTiming(1, { duration: 300 });
  };

  useEffect(() => {
    if (loading && !reducedMotion) {
      loadingPulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      loadingPulse.value = withTiming(1, { duration: 200 });
    }
  }, [loading, reducedMotion]);

  useEffect(() => {
    if (resendTimer <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResend = useCallback(async () => {
    if (!canResend || !phone) return;
    try {
      await requestOtp({ phone });
      setCanResend(false);
      setResendTimer(OTP_RESEND_COOLDOWN_S);
      setOtp(['', '', '', '', '', '']);
      setHasError(false);
      inputRefs.current[0]?.focus();
      showAlert('OTP Resent', 'A new OTP has been sent to your phone.');
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to resend OTP.');
    }
  }, [canResend, phone]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setHasError(false);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    if (index === 5 && digit) {
      handleVerify(newOtp.map((d, i) => (i === 5 ? digit : d)));
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };

  const handleVerify = async (otpArray = otp) => {
    const code = otpArray.join('');
    if (code.length !== 6 || !phone) {
      setHasError(true);
      triggerShake();
      showAlert('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp({ phone, otp: code });
      setToken(response.token);
      setUser(response.user);
      triggerSuccess();
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 800);
    } catch (err: any) {
      setHasError(true);
      triggerShake();
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
      showAlert('Verification Failed', err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  // Timer progress (0–1)
  const timerProgress = resendTimer / OTP_RESEND_COOLDOWN_S;

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top, paddingBottom: insets.bottom + 24 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Success overlay */}
              {successState && (
                <Animated.View
                  style={[styles.successOverlay, successStyle]}
                  accessible
                  accessibilityLabel="OTP verified successfully"
                >
                  <View style={[styles.successCircle, { backgroundColor: theme.success }]}>
                    <MaterialIcons name="check" size={56} color={theme.primaryText} />
                  </View>
                  <Text style={[styles.successText, { color: theme.text, fontFamily: theme.fontSerif }]}>
                    Verified!
                  </Text>
                  <Text style={[styles.successSubtext, { color: theme.textMuted }]}>
                    Taking you to the app...
                  </Text>
                </Animated.View>
              )}

              {/* Brand header */}
              <View style={styles.brandHeader}>
                <View
                  style={[
                    styles.logoCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <MaterialIcons name="local-laundry-service" size={32} color={theme.primary} />
                </View>
              </View>

              {/* OTP Card */}
              <Animated.View
                style={[
                  styles.card,
                  shakeStyle,
                  cardStyle,
                  {
                    backgroundColor: theme.surface,
                    borderColor: hasError
                      ? theme.danger
                      : theme.border,
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconBadge,
                      { backgroundColor: isDark ? 'rgba(139,85,71,0.15)' : 'rgba(139,85,71,0.08)' },
                    ]}
                  >
                    <MaterialIcons name="sms" size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.title, { color: theme.text, fontFamily: theme.fontSerif }]}>
                    OTP Verification
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                    Enter the 6-digit code sent to
                  </Text>
                  <Text style={[styles.phoneDisplay, { color: theme.primary }]}>
                    +91 {phone}
                  </Text>
                </View>

                {/* OTP Input Grid */}
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => {
                    const isFocused = index === focusedIndex;
                    const isFilled = digit !== '';
                    return (
                      <View key={index} style={styles.otpCellWrapper}>
                        <TextInput
                          ref={(ref) => { inputRefs.current[index] = ref; }}
                          style={[
                            styles.otpInput,
                            {
                              color: hasError ? theme.danger : theme.text,
                              backgroundColor: isFilled
                                ? (isDark ? 'rgba(139,85,71,0.12)' : 'rgba(139,85,71,0.05)')
                                : theme.inputBg,
                              borderColor: hasError
                                ? theme.danger
                                : isFocused
                                  ? theme.primary
                                  : (isFilled ? theme.primary : theme.border),
                              borderWidth: isFocused || isFilled ? 2 : 1.5,
                            },
                            loading && styles.otpInputDisabled,
                          ]}
                          keyboardType="numeric"
                          maxLength={1}
                          value={digit}
                          onChangeText={(text) => handleOtpChange(index, text)}
                          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                          onFocus={() => setFocusedIndex(index)}
                          editable={!loading && !successState}
                          autoFocus={index === 0}
                          selectTextOnFocus
                          accessible
                          accessibilityLabel={`OTP digit ${index + 1}`}
                          accessibilityHint={`Enter the ${index + 1} digit of your 6-digit OTP`}
                        />
                        {/* Bottom focus bar */}
                        {isFocused && !hasError && (
                          <View style={[styles.focusBar, { backgroundColor: theme.primary }]} />
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Error message */}
                {hasError && (
                  <View
                    style={[
                      styles.errorBox,
                      {
                        backgroundColor: isDark ? 'rgba(220,38,38,0.12)' : '#FEF2F2',
                        borderColor: isDark ? 'rgba(220,38,38,0.3)' : '#FECACA',
                      },
                    ]}
                  >
                    <MaterialIcons name="error-outline" size={16} color={theme.danger} />
                    <Text style={[styles.errorText, { color: theme.danger }]}>
                      Incorrect code. Please try again.
                    </Text>
                  </View>
                )}

                {/* Verify button */}
                <Animated.View style={loading ? loadingStyle : undefined}>
                  <AnimatedPressable
                    style={[
                      styles.button,
                      { backgroundColor: hasError ? theme.danger : theme.primary },
                      (!otp.every(Boolean) || loading || successState) && styles.buttonDisabled,
                    ]}
                    onPress={() => handleVerify()}
                    disabled={!otp.every(Boolean) || loading || successState}
                    accessibilityLabel="Verify OTP"
                    accessibilityHint="Submit OTP to verify your phone number"
                    accessibilityRole="button"
                  >
                    {loading ? (
                      <View style={styles.buttonInner}>
                        <View style={[styles.loadingDot, { backgroundColor: theme.primaryText }]} />
                        <View style={[styles.loadingDot, styles.loadingDotMid, { backgroundColor: theme.primaryText }]} />
                        <View style={[styles.loadingDot, { backgroundColor: theme.primaryText }]} />
                      </View>
                    ) : (
                      <Text style={[styles.buttonText, { color: theme.primaryText }]}>
                        {hasError ? 'Try Again' : 'Verify'}
                      </Text>
                    )}
                  </AnimatedPressable>
                </Animated.View>

                {/* Resend section */}
                <View style={styles.resendSection}>
                  {!canResend ? (
                    <View style={styles.timerContainer}>
                      {/* Circular timer track */}
                      <View
                        style={[
                          styles.timerTrack,
                          { borderColor: theme.border },
                        ]}
                      >
                        {/* Timer fill approximation using opacity */}
                        <View
                          style={[
                            styles.timerFill,
                            {
                              backgroundColor: theme.primary,
                              opacity: 1 - timerProgress,
                            },
                          ]}
                        />
                        <Text style={[styles.timerCount, { color: theme.textMuted }]}>
                          {resendTimer}s
                        </Text>
                      </View>
                      <Text style={[styles.resendLabel, { color: theme.textMuted }]}>
                        Resend code in{' '}
                        <Text style={{ color: theme.primary, fontWeight: '700' }}>
                          {resendTimer}s
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <AnimatedPressable
                      onPress={handleResend}
                      style={[styles.resendButton, { backgroundColor: isDark ? 'rgba(139,85,71,0.12)' : 'rgba(139,85,71,0.08)' }]}
                      accessibilityLabel="Resend OTP"
                      accessibilityHint="Request a new OTP code"
                      accessibilityRole="button"
                    >
                      <MaterialIcons name="refresh" size={18} color={theme.primary} />
                      <Text style={[styles.resendText, { color: theme.primary }]}>
                        Resend OTP
                      </Text>
                    </AnimatedPressable>
                  )}
                </View>
              </Animated.View>

              <Text style={[styles.footerNote, { color: theme.textMuted }]}>
                Didn't receive? Check your SMS inbox or spam folder.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCard: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  card: {
    borderRadius: radius.pill,
    borderWidth: 1,
    padding: 28,
    width: '100%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24 },
      android: { elevation: 5 },
    }),
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneDisplay: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  otpCellWrapper: {
    flex: 1,
    position: 'relative',
  },
  otpInput: {
    height: 60,
    borderRadius: radius.md,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    ...Platform.select({
      ios: { fontFamily: 'System' },
      android: { fontFamily: 'sans-serif-condensed' },
    }),
  },
  focusBar: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    borderRadius: 1.5,
  },
  otpInputDisabled: {
    opacity: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  button: {
    width: '100%',
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonInner: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
  loadingDotMid: {
    opacity: 0.5,
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  timerContainer: {
    alignItems: 'center',
    gap: 10,
  },
  timerTrack: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  timerFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: radius.pill,
  },
  timerCount: {
    fontSize: 14,
    fontWeight: '800',
  },
  resendLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '700',
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    gap: 16,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#10B981', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20 },
      android: { elevation: 8 },
    }),
  },
  successText: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  successSubtext: {
    fontSize: 15,
    fontWeight: '500',
  },
  footerNote: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
});
