/**
 * SkeletonCard — shimmer placeholder matching ShopCard dimensions.
 * Dark-mode aware with theme-coloured shimmer.
 */

import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export default function SkeletonCard() {
  const { theme, isDark } = useTheme();
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, [shimmerProgress]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerProgress.value,
          [0, 1],
          [-CARD_WIDTH, CARD_WIDTH]
        ),
      },
    ],
  }));

  const bgColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const lineBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      {/* Thumbnail placeholder */}
      <View style={[styles.thumbnail, { backgroundColor: bgColor }]} />
      {/* Shimmer overlay */}
      <Animated.View style={[styles.shimmerStrip, shimmerStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerStrip}
        />
      </Animated.View>
      {/* Text placeholders */}
      <View style={styles.content}>
        <View style={[styles.line, { width: '60%', backgroundColor: lineBg }]} />
        <View style={styles.row}>
          <View style={[styles.line, { width: '30%', backgroundColor: lineBg }]} />
          <View style={[styles.line, { width: '20%', backgroundColor: lineBg }]} />
        </View>
        <View style={[styles.line, { width: '40%', backgroundColor: lineBg }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  shimmerStrip: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
  },
  content: {
    padding: 12,
    gap: 8,
  },
  line: {
    height: 14,
    borderRadius: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
});
