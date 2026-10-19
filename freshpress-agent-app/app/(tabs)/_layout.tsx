import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'car.fill',
                android: 'car',
                web: 'car',
              }}
              tintColor={color}
              size={28}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'gearshape',
                android: 'settings',
                web: 'settings',
              }}
              tintColor={color}
              size={28}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
