import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: any | null;
  setToken: (token: string) => Promise<void>;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setToken: async (token: string) => {
    await AsyncStorage.setItem('token', token);
    set({ token });
  },
  setUser: (user: any) => set({ user }),
  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ token: null, user: null });
  },
  loadToken: async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      set({ token });
    }
  },
}));
