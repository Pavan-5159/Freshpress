/**
 * Button — Lovable "Maison" visual style adapted for React Native.
 *
 * Premium feel: terracotta primary, subtle letter-spacing, clean variants,
 * press animation, loading state, dark-mode, 44px min touch target.
 */

import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedPressable from './AnimatedPressable';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  variant?: Variant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string;
  iconRight?: string;
  disabled?: boolean;
  style?: any;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  onPress?: () => void;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  onPress,
}: ButtonProps) {
  const { theme, isDark } = useTheme();

  const getVariantStyle = (v: Variant) => {
    switch (v) {
      case 'primary':
        return { bg: theme.primary, text: theme.primaryText, border: theme.primary };
      case 'secondary':
        return { bg: theme.surface, text: theme.text, border: theme.border };
      case 'outline':
        return { bg: 'transparent', text: theme.text, border: theme.border };
      case 'ghost':
        return { bg: 'transparent', text: theme.primary, border: 'transparent' };
      case 'danger':
        return { bg: theme.danger, text: '#FFFFFF', border: theme.danger };
      default:
        return { bg: theme.primary, text: theme.primaryText, border: theme.primary };
    }
  };

  const s = SIZE_STYLES[size];
  const v = getVariantStyle(variant);

  return (
    <AnimatedPressable
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: 1,
          paddingVertical: s.paddingV,
          paddingHorizontal: s.paddingH,
          minHeight: s.minHeight,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      disabledAnimation={loading}
      scaleOnPress={0.97}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && (
            <MaterialIcons name={icon as any} size={s.iconSize} color={v.text} />
          )}
          <Text
            style={[
              styles.text,
              {
                color: v.text,
                fontSize: s.fontSize,
                letterSpacing: s.letterSpacing,
              },
            ]}
          >
            {title}
          </Text>
          {iconRight && (
            <MaterialIcons name={iconRight as any} size={s.iconSize} color={v.text} />
          )}
        </View>
      )}
    </AnimatedPressable>
  );
}

// ─── Size tokens ─────────────────────────────────────────────────────────────

const SIZE_STYLES: Record<
  ButtonSize,
  { paddingV: number; paddingH: number; minHeight: number; fontSize: number; letterSpacing: number; iconSize: number }
> = {
  sm:  { paddingV: 10, paddingH: 18, minHeight: 40, fontSize: 13, letterSpacing: 0.4, iconSize: 16 },
  md:  { paddingV: 14, paddingH: 24, minHeight: 48, fontSize: 15, letterSpacing: 0.5, iconSize: 18 },
  lg:  { paddingV: 17, paddingH: 28, minHeight: 54, fontSize: 16, letterSpacing: 0.6, iconSize: 20 },
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
