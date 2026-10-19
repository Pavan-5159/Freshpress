import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={[styles.title, { color: theme.text }]}>This screen doesn't exist.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={[styles.linkText, { color: theme.primary }]}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
});
