/**
 * Themed component primitives that automatically respond to dark/light mode.
 *
 * These wrappers read the current theme from ThemeContext and apply the
 * correct colour tokens, removing the need for inline colours in screen files.
 * All colour values are driven by the single source-of-truth in constants/theme.ts.
 */

import { Text as DefaultText, View as DefaultView, TextStyle, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

/** Small helper: pick a value from the current theme */
function useThemeColor(
  props: { light?: string; dark?: string },
  colorKey: 'text' | 'background'
) {
  const { isDark, theme } = useTheme();
  if (props.light != null && props.dark != null) {
    return isDark ? props.dark : props.light;
  }
  return colorKey === 'text' ? theme.text : theme.bg;
}

/* ──────────────────────────────────────────────────────────────────────── */

export function ThemedText(props: TextProps) {
  const { style, lightColor, darkColor, ...rest } = props;
  const { theme } = useTheme();
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <DefaultText
      style={[{ color }, style]}
      maxFontSizeMultiplier={1.5}
      {...rest}
    />
  );
}

export function ThemedView(props: ViewProps) {
  const { style, lightColor, darkColor, ...rest } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <DefaultView
      style={[{ backgroundColor: color }, style]}
      {...rest}
    />
  );
}

export function ThemedBackgroundView(props: ViewProps) {
  const { theme } = useTheme();
  const { style, ...rest } = props;

  return (
    <DefaultView
      style={[{ backgroundColor: theme.bg }, style]}
      {...rest}
    />
  );
}

/* ───────────── Typography scale (optional helpers) ────────────────── */

export const typography: Record<
  'greeting' | 'title'  | 'subtitle' | 'body' | 'caption',
  TextStyle
> = {
  greeting:  { fontSize: 14, fontWeight: '500' } as TextStyle,
  title:     { fontSize: 18, fontWeight: '700' } as TextStyle,
  subtitle:  { fontSize: 15 },
  body:      { fontSize: 14, fontWeight: '400' },
  caption:   { fontSize: 12, fontWeight: '400' },
};

/* ───────────── Spacing scale (kept for reference) ────────────────── */

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};
