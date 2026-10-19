/**
 * Order confirmation screen — success animation, order ID, estimated turnaround.
 * Lovable "Maison" editorial style.
 * Requirement: 7.4
 */

import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, FadeInDown } from 'react-native-reanimated';
import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaisonImages } from '@/assets/images/maison';
import AnimatedPressable from '@/components/AnimatedPressable';

export default function OrderConfirmationScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Animated.View style={[styles.content, contentStyle]}>
        
        <Animated.View style={[styles.imageContainer, imageStyle]}>
          <Image source={MaisonImages.featuredService} style={styles.image} resizeMode="cover" />
          <View style={styles.checkBadge}>
            <MaterialIcons name="check" size={24} color="#FFFFFF" />
          </View>
        </Animated.View>
        
        <Text style={[styles.eyebrow, { color: theme.primary }]}>THANK YOU</Text>
        <Text style={[styles.title, { color: theme.text, fontFamily: theme.fontSerif }]}>Order Confirmed</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Your laundry order has been placed successfully and is being prepared for pickup.
        </Text>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.orderMetaBox, { backgroundColor: isDark ? theme.surface : theme.linen, borderColor: theme.border }]}>
          <Text style={[styles.metaLabel, { color: theme.textMuted }]}>ORDER NUMBER</Text>
          <Text style={[styles.metaValue, { color: theme.text }]}>#FP-8472-X</Text>
          <View style={[styles.divider, { borderColor: theme.border }]} />
          <Text style={[styles.metaLabel, { color: theme.textMuted }]}>EXPECTED PICKUP</Text>
          <Text style={[styles.metaValue, { color: theme.text }]}>Today, 03:00 PM</Text>
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.footer, contentStyle, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <AnimatedPressable
          style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.replace('/(tabs)/orders')}
          scaleOnPress={0.97}
        >
          <Text style={[styles.primaryBtnText, { color: theme.primaryText }]}>VIEW ORDER STATUS</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={[styles.secondaryBtn, { borderColor: theme.border }]}
          onPress={() => router.replace('/(tabs)')}
          scaleOnPress={0.97}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.text }]}>BACK TO HOME</Text>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  imageContainer: {
    width: 140,
    height: 180,
    marginBottom: 32,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -16,
    right: -16,
    width: 48,
    height: 48,
    backgroundColor: '#8B5547',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F9F5F0',
  },

  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 8 },
  title: { fontSize: 42, letterSpacing: -0.5, marginBottom: 16, textAlign: 'center', lineHeight: 46 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 32, paddingHorizontal: 10 },
  
  orderMetaBox: {
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  metaLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  metaValue: { fontSize: 16, fontWeight: '600' },
  divider: { width: 40, borderTopWidth: 1, marginVertical: 16 },

  footer: { width: '100%', gap: 12 },
  primaryBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  secondaryBtn: {
    paddingVertical: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  secondaryBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
});
