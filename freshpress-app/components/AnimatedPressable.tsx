/**
 * AnimatedPressable — reusable pressable with smooth scale animation,
 * haptic-like visual feedback, and full accessibility support.
 *
 * Wraps React Native's Pressable with react-native-reanimated
 * for touch feedback and supports accessibility roles, labels, hints.
 */

import { PressableProps, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ReactNode } from 'react';

interface AnimatedPressableProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  scaleOnPress?: number;
  disabledAnimation?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Full RN role set: radio, checkbox and switch are used by selectable rows. */
  accessibilityRole?: PressableProps['accessibilityRole'];
}

const AnimatedPressableView = Animated.createAnimatedComponent(Pressable);

export default function AnimatedPressable({
  children,
  scaleOnPress = 0.97,
  disabledAnimation = false,
  style,
  onPressIn,
  onPressOut,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = (e: any) => {
    if (!disabledAnimation) {
      scale.value = withTiming(scaleOnPress, { duration: 80 });
      opacity.value = withTiming(0.85, { duration: 80 });
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!disabledAnimation) {
      scale.value = withTiming(1, { duration: 150 });
      opacity.value = withTiming(1, { duration: 150 });
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedPressableView
      style={[animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      {...props}
    >
      {children}
    </AnimatedPressableView>
  );
}
