import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Auth group layout — unauthenticated screens.
 * Redirects authenticated users to the main app.
 */
export default function AuthLayout() {
  const { token, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && token) {
      router.replace('/(tabs)');
    }
  }, [isLoading, token, router]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
