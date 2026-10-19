/**
 * ThemeContext – provides light/dark theme tokens and mode toggle
 * to the entire app. Wraps children in a provider that responds
 * to system color scheme changes (when not overridden).
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { lightTheme, darkTheme, type ThemeColors } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'system',
  isDark: false,
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  const getThemeColors = useCallback(
    (m: ThemeMode): ThemeColors => {
      if (m === 'system') {
        return systemScheme === 'dark' ? darkTheme : lightTheme;
      }
      return m === 'dark' ? darkTheme : lightTheme;
    },
    [systemScheme]
  );

  const [theme, setTheme] = useState<ThemeColors>(getThemeColors('system'));

  useEffect(() => {
    setTheme(getThemeColors(mode));
  }, [mode, systemScheme, getThemeColors]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setTheme(getThemeColors(newMode));
  };

  const toggle = () => {
    const next: ThemeMode = mode === 'dark' || (mode === 'system' && systemScheme === 'dark') ? 'light' : 'dark';
    setMode(next);
  };

  const isDark = theme === darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, setMode, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
