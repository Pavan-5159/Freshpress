import { useAuthStore } from '@/store/authStore';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { ThemeProvider } from '@/context/ThemeContext';
import { useTheme } from '@/context/ThemeContext';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';


// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const { isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="shop/[id]"
          options={{
            headerShown: true,
            title: 'Shop',
          }}
        />
        <Stack.Screen
          name="cart/index"
          options={{
            headerShown: true,
            title: 'Cart',
          }}
        />
        <Stack.Screen
          name="checkout/index"
          options={{
            headerShown: true,
            title: 'Checkout',
          }}
        />
        <Stack.Screen
          name="checkout/confirmation"
          options={{
            headerShown: true,
            title: 'Order Confirmed',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>

      <StatusBar style={isDark ? 'light' : 'dark'} />
      {showSplash && (
        <AnimatedSplashScreen onAnimationComplete={() => setShowSplash(false)} />
      )}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  const loadToken = useAuthStore((state) => state.loadToken);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}