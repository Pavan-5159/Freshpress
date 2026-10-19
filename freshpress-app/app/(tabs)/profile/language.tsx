/**
 * Language Selection screen — multi-language support (English, Marathi, Hindi).
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

export default function LanguageScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState('en');

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Select Language</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Choose your preferred language for the app interface.
        </Text>

        {LANGUAGES.map((lang) => (
          <AnimatedPressable
            key={lang.code}
            style={[
              styles.languageCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
              selected === lang.code && { borderColor: theme.primary, backgroundColor: `${theme.primary}15` },
            ]}
            onPress={() => setSelected(lang.code)}
            accessibilityLabel={`Select ${lang.name}`}
            accessibilityRole="radio"
          >
            <View style={styles.languageInfo}>
              <Text style={styles.flag}>{lang.flag}</Text>
              <View>
                <Text style={[styles.languageName, { color: theme.text }]}>{lang.name}</Text>
                <Text style={[styles.nativeName, { color: theme.textMuted }]}>{lang.nativeName}</Text>
              </View>
            </View>
            {selected === lang.code && (
              <MaterialIcons name="check-circle" size={24} color={theme.primary} />
            )}
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, letterSpacing: 0, flex: 1, textAlign: 'center', marginRight: 32 },
  spacer: { width: 32 },
  subtitle: { fontSize: 14, paddingHorizontal: 16, paddingVertical: 12 },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  languageInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flag: { fontSize: 24 },
  languageName: { fontSize: 16, fontWeight: '600' },
  nativeName: { fontSize: 13, marginTop: 2 },
});
