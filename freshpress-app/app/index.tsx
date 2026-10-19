import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { token } = useAuthStore();

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}