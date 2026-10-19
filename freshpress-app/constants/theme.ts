/**
 * Theme tokens — Lovable "Maison" warm palette adapted for React Native.
 *
 * Primary brand:  Terracotta  hsl(18,45%,45%) = #8B5547
 * Background:     Warm cream  hsl(40,33%,97%) = #F9F5F0
 * Surface/card:   Linen       hsl(40,30%,95%) = #F5EFE7
 * Serif font:     Cormorant Garamond (loaded in _layout.tsx)
 *
 * Import `useTheme` from the context to access these in components.
 */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  /** Primary brand (terracotta) */         primary: string;
  /** Lighter primary for hover/tint */     primaryLight: string;
  /** Text on primary backgrounds */        primaryText: string;
  /** Danger / Error */                     danger: string;
  /** Success */                            success: string;
  /** Warning / star color */              warning: string;
  /** Page background (warm cream) */       bg: string;
  /** Card / surface background (linen) */  surface: string;
  /** Linen accent background */            linen: string;
  /** Primary text (charcoal) */            text: string;
  /** Secondary / muted text */             textMuted: string;
  /** Borders / dividers */                 border: string;
  /** Input background */                  inputBg: string;
  /** Serif font family name */             fontSerif: string;
  /** Sans font family name */              fontSans: string;
}

export const lightTheme: ThemeColors = {
  // Brand
  primary:      '#8B5547',   // Lovable terracotta hsl(18,45%,45%)
  primaryLight: '#B07060',   // terracotta-light hsl(18,45%,55%)
  primaryText:  '#F9F5F0',   // warm cream on primary

  // Semantic
  danger:   '#DC2626',
  success:  '#10B981',
  warning:  '#D97706',

  // Surfaces
  bg:       '#F9F5F0',   // warm cream hsl(40,33%,97%)
  surface:  '#F5EFE7',   // linen card hsl(40,30%,95%)
  linen:    '#EDE5D8',   // deeper linen for summary panels

  // Text
  text:      '#292420',  // charcoal hsl(30,10%,15%)
  textMuted: '#7A6E67',  // warm muted hsl(30,8%,45%)

  // Structure
  border:   '#E3D9D0',   // warm border hsl(30,15%,88%)
  inputBg:  '#F0E8DF',   // slightly warmer input

  // Fonts
  fontSerif: 'CormorantGaramond_500Medium',
  fontSans:  'System',
};

/**
 * Corner-radius scale. Lovable uses very subtle radius (0.25rem ≈ 4px).
 * We keep mobile-appropriate values but lean softer.
 */
export const radius = {
  sm:   4,
  md:   8,
  lg:  12,
  pill: 24,
} as const;

export const darkTheme: ThemeColors = {
  // Brand
  primary:      '#B07060',   // terracotta-light for dark bg contrast
  primaryLight: '#C48878',
  primaryText:  '#1A1511',

  // Semantic
  danger:   '#F87171',
  success:  '#34D399',
  warning:  '#FBBF24',

  // Surfaces
  bg:       '#1A1511',   // Lovable dark bg hsl(30,10%,10%)
  surface:  '#221C17',   // Lovable dark surface hsl(30,10%,12%)
  linen:    '#2A221B',   // deep linen dark

  // Text
  text:      '#EDE5D8',  // warm cream text on dark
  textMuted: '#9C8E84',  // warm muted dark

  // Structure
  border:   '#3A2F28',   // warm dark border
  inputBg:  '#221C17',

  // Fonts
  fontSerif: 'CormorantGaramond_500Medium',
  fontSans:  'System',
};
