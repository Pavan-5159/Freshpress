/**
 * QuantityStepper — minus / plus buttons with min(1) / max(99) bounds.
 * Dark-mode, animated, and accessible.
 */

import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from './AnimatedPressable';
import { radius } from '@/constants/theme';

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  quantity,
  onChange,
  min = 1,
  max = 99,
}: QuantityStepperProps) {
  const { theme } = useTheme();
  const canDecrement = quantity > min;
  const canIncrement = quantity < max;

  return (
    <View
      style={[
        styles.container,
        { borderColor: theme.border },
      ]}
      accessibilityLabel={`Change quantity. Currently ${quantity}.`}
      accessibilityRole="spinbutton"
    >
      <AnimatedPressable
        onPress={() => canDecrement && onChange(quantity - 1)}
        disabled={!canDecrement}
        style={[styles.button, { backgroundColor: theme.inputBg }]}
        accessibilityLabel="Decrease quantity"
        accessibilityHint="Reduce the item count by one"
        accessibilityRole="button"
      >
        <MaterialIcons
          name="remove"
          size={18}
          color={canDecrement ? theme.text : theme.textMuted}
        />
      </AnimatedPressable>

      <Text
        style={[styles.quantity, { color: theme.text }]}
        maxFontSizeMultiplier={1.5}
      >
        {quantity}
      </Text>

      <AnimatedPressable
        onPress={() => canIncrement && onChange(quantity + 1)}
        disabled={!canIncrement}
        style={[styles.button, { backgroundColor: theme.inputBg }]}
        accessibilityLabel="Increase quantity"
        accessibilityHint="Increase the item count by one"
        accessibilityRole="button"
      >
        <MaterialIcons
          name="add"
          size={18}
          color={canIncrement ? theme.text : theme.textMuted}
        />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    minWidth: 36,
    textAlign: 'center',
  },
});
