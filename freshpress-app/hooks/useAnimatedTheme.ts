/**
 * Animated theme adapter that integrates useTheme tokens
 * with react-native-reanimated.
 */

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

const ANIMATION_DURATION = 300;

/**
 * Returns animated backgroundColor and text color that smoothly
 * transition when the theme changes.
 */
export function useAnimatedBackground() {
  const { isDark, theme } = useTheme();
  const progress = useSharedValue(isDark ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isDark ? 1 : 0, { duration: ANIMATION_DURATION });
  }, [isDark, progress]);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.bg, theme.bg]
    ),
  }));

  return { bgStyle, theme };
}

/**
 * Returns animated scale for press-in / press-out.
 */
export function usePressScale() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withTiming(0.97, { duration: 80 });
  };

  const onPressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  return { animatedStyle, onPressIn, onPressOut };
}
