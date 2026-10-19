/**
 * DatePicker — cross-platform date selection component.
 * Dark-mode and accessible.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/constants/theme';
import AnimatedPressable from './AnimatedPressable';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Quick-select day options for the modal
  const generateDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  return (
    <View>
      {label && (
        <Text
          style={[styles.label, { color: theme.text }]}
          maxFontSizeMultiplier={1.5}
        >
          {label}
        </Text>
      )}
      <Pressable
        style={[
          styles.container,
          { backgroundColor: theme.inputBg, borderColor: theme.border },
        ]}
        onPress={() => setVisible(true)}
        accessibilityLabel={label || 'Select date'}
        accessibilityHint="Opens date picker"
        accessibilityRole="button"
      >
        <MaterialIcons name="calendar-today" size={20} color={theme.textMuted} />
        <Text
          style={[styles.value, { color: theme.text }]}
          maxFontSizeMultiplier={1.5}
        >
          {formatDate(value)}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={theme.textMuted} />
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date</Text>
            {generateDays().map((day) => (
              <AnimatedPressable
                key={day.toISOString()}
                onPress={() => { onChange(day); setVisible(false); }}
                style={[
                  styles.dayRow,
                  {
                    borderBottomColor: theme.border,
                    backgroundColor: day.toDateString() === value.toDateString() ? theme.inputBg : 'transparent',
                  },
                ]}
                accessibilityLabel={`${formatDate(day)}`}
                accessibilityHint="Select this date"
                accessibilityRole="menuitem"
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: theme.text },
                    day.toDateString() === value.toDateString() && [styles.dayTextSelected, { color: theme.primary }],
                  ]}
                >
                  {formatDate(day)}
                </Text>
                {day.toDateString() === value.toDateString() && (
                  <MaterialIcons name="check" size={20} color={theme.primary} />
                )}
              </AnimatedPressable>
            ))}
            <AnimatedPressable
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={() => setVisible(false)}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    height: 52,
    gap: 8,
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  dayText: {
    fontSize: 16,
  },
  dayTextSelected: {
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
