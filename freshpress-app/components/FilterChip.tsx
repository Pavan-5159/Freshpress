/**
 * FilterChipRow — horizontal scrollable list of selectable filter chips.
 * Dark-mode, animated, and accessible.
 */

import { Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/constants/theme';
import AnimatedPressable from './AnimatedPressable';

export interface FilterChip {
  id: string;
  label: string;
}

interface FilterChipRowProps {
  chips: FilterChip[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function FilterChipRow({ chips, selectedId, onSelect }: FilterChipRowProps) {
  const { theme } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      accessibilityLabel="Filter options"
      accessibilityRole="menu"
    >
      {chips.map((chip) => {
        const isActive = chip.id === selectedId;
        return (
          <AnimatedPressable
            key={chip.id}
            onPress={() => onSelect(isActive ? null : chip.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? theme.primary : theme.inputBg,
                borderColor: isActive ? theme.primary : theme.border,
                borderWidth: 1,
              },
            ]}
            accessibilityLabel={chip.label}
            accessibilityHint={isActive ? 'Double tap to remove filter' : 'Double tap to apply filter'}
            accessibilityRole="menuitem"
          >
            <Text
              style={[
                styles.chipText,
                { color: isActive ? theme.primaryText : theme.textMuted },
              ]}
              maxFontSizeMultiplier={1.5}
            >
              {chip.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
