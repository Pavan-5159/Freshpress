import { useColorScheme as _useColorScheme } from 'react-native';

/**
 * Returns the active color scheme ('light' | 'dark').
 * Wraps React Native's useColorScheme for future theming logic.
 */
export function useColorScheme() {
  return _useColorScheme() ?? 'light';
}
