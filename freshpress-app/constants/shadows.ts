/**
 * Platform-aware box-shadow tokens.
 * Prefer these over inline shadow* styles to avoid react-native-web
 * deprecation warnings.
 */

import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

type ShadowLevel = 'sm' | 'md' | 'lg';

const shadowWeb: Record<ShadowLevel, { boxShadow: string }> = {
  sm: { boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' },
  md: { boxShadow: '0 2px 4px -1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.1)' },
  lg: { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' },
};

const shadowNative: Record<ShadowLevel, any> = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const shadow = {
  sm: isWeb ? shadowWeb.sm : shadowNative.sm,
  md: isWeb ? shadowWeb.md : shadowNative.md,
  lg: isWeb ? shadowWeb.lg : shadowNative.lg,
};
