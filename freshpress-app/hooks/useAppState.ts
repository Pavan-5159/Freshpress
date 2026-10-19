/**
 * useAppState — tracks the current React Native app state (active / inactive / background).
 *
 * @usage const { appState } = useAppState();
 */

import { useState, useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useAppState() {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setAppState(nextState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { appState, isActive: appState === 'active' };
}
