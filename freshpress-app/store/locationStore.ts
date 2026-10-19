import { create } from 'zustand';
import * as Location from 'expo-location';

export interface LocationState {
  currentLocation: Location.LocationObject | null;
  permissionStatus: Location.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;

  requestPermissionAndFetchLocation: () => Promise<void>;
  updateLocation: (location: Location.LocationObject) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  permissionStatus: null,
  isLoading: false,
  error: null,

  requestPermissionAndFetchLocation: async () => {
    set({ isLoading: true, error: null });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      set({ permissionStatus: status });

      if (status !== 'granted') {
        set({ error: 'Permission to access location was denied', isLoading: false });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      set({ currentLocation: location, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch location', isLoading: false });
    }
  },

  updateLocation: (location) => {
    set({ currentLocation: location });
  },
}));
