import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

/**
 * Bottom Tab Navigator layout.
 * Restored to bottom position with Maison styling.
 */
export default function TabLayout() {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textMuted,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            elevation: 8,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 4,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            height: Platform.OS === 'ios' ? 82 : 64,
          },
          tabBarLabelStyle: {
            fontSize: 9,
            marginTop: 4,
            letterSpacing: 0.5,
            fontFamily: 'CormorantGaramond_500Medium',
            textTransform: 'uppercase',
            fontWeight: '600'
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
            tabBarAccessibilityLabel: 'Home tab',
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="search" size={24} color={color} />
            ),
            tabBarAccessibilityLabel: 'Search tab',
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="map" size={24} color={color} />
            ),
            tabBarAccessibilityLabel: 'Map tab',
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Wishlist',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="favorite" size={24} color={color} />
            ),
            tabBarAccessibilityLabel: 'Wishlist tab',
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="receipt-long" size={24} color={color} />
            ),
            tabBarAccessibilityLabel: 'Orders tab',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="person" size={24} color={color} />
            ),
            tabBarAccessibilityLabel: 'Profile tab',
          }}
        />
      </Tabs>
    </View>
  );
}
