/**
 * TextField — Lovable "Maison" style: warm bordered input, clean label above,
 * error state, helper text, leading icon support, dark-mode, accessibility.
 */

import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { radius } from '@/constants/theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  icon?: string; // MaterialIcons name
  inputRef?: React.Ref<TextInput>;
}

export default function TextField({
  label,
  error,
  helper,
  icon,
  inputRef,
  style,
  ...props
}: TextFieldProps) {
  const { theme } = useTheme();

  return (
    <View
      style={styles.container}
      accessibilityLabel={label}
      accessibilityRole="none"
    >
      {label && (
        <Text style={[styles.label, { color: theme.text }]} accessibilityLabel={label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: theme.inputBg,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
        accessibilityRole="none"
        accessibilityLabel={label ? `${label} input` : undefined}
      >
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={18}
            color={theme.textMuted}
            style={styles.icon}
          />
        )}
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.text }, style]}
          placeholderTextColor={theme.textMuted}
          accessible
          accessibilityLabel={label || 'Text field'}
          accessibilityHint={helper || undefined}
          maxFontSizeMultiplier={1.5}
          {...props}
        />
      </View>
      {error ? (
        <Text
          style={[styles.message, { color: theme.danger }]}
          accessibilityLiveRegion="assertive"
        >
          {error}
        </Text>
      ) : helper ? (
        <Text style={[styles.message, { color: theme.textMuted }]}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 7,
    letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  icon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 13,
  },
  message: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
