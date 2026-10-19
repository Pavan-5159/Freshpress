/**
 * VerifiedBadge — displays a verified badge for shops/delivery partners.
 * Dark-mode aware.
 */

import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
}

export default function VerifiedBadge({ label = 'Verified', size = 'sm' }: VerifiedBadgeProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.badge,
        size === 'md' && styles.badgeMd,
        { backgroundColor: theme.inputBg },
      ]}
      accessibilityLabel={`${label} badge`}
      accessibilityRole="none"
    >
      <MaterialIcons
        name="verified"
        size={size === 'sm' ? 14 : 16}
        color={theme.primary}
      />
      <Text
        style={[
          styles.text,
          size === 'md' && styles.textMd,
          { color: theme.primary },
        ]}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  textMd: {
    fontSize: 12,
  },
});
