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
          title: 'Overview',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'chart.bar.fill',
                android: 'bar-chart',
                web: 'bar-chart',
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
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'person.crop.circle.fill',
                android: 'person',
                web: 'person',
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
