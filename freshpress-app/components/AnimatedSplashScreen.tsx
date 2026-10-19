import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  runOnJS,
  useReducedMotion,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const systemReducedMotion = useReducedMotion();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoGlowScale = useSharedValue(1);
  const logoGlowOpacity = useSharedValue(0.4);

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  const progress = useSharedValue(0);

  const splashScale = useSharedValue(1);
  const splashOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Logo entry animation
    if (systemReducedMotion) {
      logoScale.value = 1;
      logoOpacity.value = 1;
      textOpacity.value = 1;
      textTranslateY.value = 0;
    } else {
      logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
      logoOpacity.value = withTiming(1, { duration: 600 });

      // Staggered text entry
      textOpacity.value = withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(1, { duration: 600 })
      );
      textTranslateY.value = withSequence(
        withTiming(20, { duration: 300 }),
        withSpring(0, { damping: 15, stiffness: 100 })
      );

      // Looping pulse glow behind the logo
      logoGlowScale.value = withRepeat(
        withTiming(1.4, { duration: 1800 }),
        -1,
        false
      );
      logoGlowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 900 }),
          withTiming(0, { duration: 900 })
        ),
        -1,
        false
      );
    }

    // 2. Loading progress line animation
    progress.value = withTiming(1, { duration: 1800 }, (isFinished) => {
      if (isFinished) {
        // 3. Exit transition animation
        if (systemReducedMotion) {
          splashOpacity.value = withTiming(0, { duration: 300 }, (exitFinished) => {
            if (exitFinished) {
              runOnJS(onAnimationComplete)();
            }
          });
        } else {
          splashScale.value = withTiming(1.06, { duration: 400 });
          splashOpacity.value = withTiming(0, { duration: 400 }, (exitFinished) => {
            if (exitFinished) {
              runOnJS(onAnimationComplete)();
            }
          });
        }
      }
    });
  }, [onAnimationComplete, systemReducedMotion]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const logoGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoGlowScale.value }],
    opacity: logoGlowOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: splashScale.value }],
    opacity: splashOpacity.value,
  }));

  // Maison warm palette gradients
  const gradientColors = isDark
    ? ['#1A1511', '#221C17', '#1A1511'] as const // Maison dark: deep warm charcoal
    : ['#F9F5F0', '#EDE5D8', '#F5EFE7'] as const; // Maison light: warm cream → linen

  return (
    <Animated.View style={[styles.absoluteContainer, containerAnimatedStyle]}>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent />
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.mainContent, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Logo Section */}
          <View style={styles.logoWrapper}>
            {/* Soft decorative pulsing glow */}
            {!systemReducedMotion && (
              <Animated.View
                style={[
                  styles.glowCircle,
                  logoGlowStyle,
                  { backgroundColor: isDark ? 'rgba(139,85,71,0.15)' : 'rgba(139,85,71,0.08)' }
                ]}
              />
            )}
            
            {/* Logo container with micro-shadow and border refraction */}
            <Animated.View
              style={[
                styles.logoCard,
                logoAnimatedStyle,
                {
                  backgroundColor: isDark ? 'rgba(34,28,23,0.85)' : 'rgba(245,239,231,0.92)',
                  borderColor: isDark ? 'rgba(139,85,71,0.15)' : 'rgba(139,85,71,0.2)',
                }
              ]}
            >
              <MaterialIcons name="local-laundry-service" size={64} color={theme.primary} />
            </Animated.View>
          </View>

          {/* Brand Info */}
          <Animated.View style={[styles.textWrapper, textAnimatedStyle]}>
            <Text style={[styles.brandTitle, { color: isDark ? theme.text : theme.primary }]}>
              FreshPress
            </Text>
            <Text style={[styles.brandTagline, { color: theme.textMuted }]}>
              Clean Clothes. Happy You!
            </Text>
            {/* Sleek, sophisticated divider */}
            <View style={[styles.taglineUnderline, { backgroundColor: theme.primary }]} />
          </Animated.View>

          {/* Sleek Progress Indicator */}
          <View style={styles.footer}>
            <View style={[styles.progressBarTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }]}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  progressBarStyle,
                  { backgroundColor: theme.primary }
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  glowCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: radius.md,
  },
  logoCard: {
    width: 112,
    height: 112,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
      }
    }),
  },
  textWrapper: {
    alignItems: 'center',
    marginTop: 8,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1.5,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif-condensed',
      },
    }),
  },
  brandTagline: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'center',
  },
  taglineUnderline: {
    width: 24,
    height: 3,
    borderRadius: 2,
    marginTop: 16,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: 112,
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 1.5,
  },
});
