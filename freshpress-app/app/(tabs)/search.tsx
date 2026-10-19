/**
 * Search tab — Lovable "Maison" editorial style.
 * Search for laundry shops by name or service type.
 * Dark-mode, animated, and accessible.
 * Requirement: 3.1–3.8
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchShops } from '@/services/shopService';
import type { Shop } from '@/types';
import ShopCard from '@/components/ShopCard';
import SkeletonCard from '@/components/SkeletonCard';
import AnimatedPressable from '@/components/AnimatedPressable';
import { SEARCH_DEBOUNCE_MS, MAX_RECENT_SEARCHES, SKELETON_COUNT } from '@/constants/config';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaisonImages } from '@/assets/images/maison';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RECENT_SEARCHES_KEY = 'freshpress:recent_searches';

// Service category quick-filters (Maison "Collections" style)
const SERVICE_FILTERS = [
  { id: 'wash', label: 'Wash & Fold' },
  { id: 'dry_clean', label: 'Dry Cleaning' },
  { id: 'ironing', label: 'Ironing' },
  { id: 'shoe', label: 'Shoe Care' },
  { id: 'premium', label: 'Premium' },
];

export default function SearchScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Shop[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (raw) setRecentSearches(JSON.parse(raw));
    } catch { /* ignore */ }
  };

  const saveRecentSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const trimmed = searchQuery.trim().toLowerCase();
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    try { await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)); }
    catch { /* ignore */ }
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    try { await AsyncStorage.removeItem(RECENT_SEARCHES_KEY); }
    catch { /* ignore */ }
  };

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) { setResults([]); setHasSearched(false); return; }
    setLoading(true); setHasSearched(true);
    try {
      const shops = await searchShops(searchQuery);
      setResults(shops);
      await saveRecentSearch(searchQuery);
    } catch (err: any) {
      showAlert('Search Error', err?.message || 'Failed to search shops.');
    } finally { setLoading(false); }
  }, [recentSearches]);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleShopPress = (shop: Shop) => router.push(`/shop/${shop.id}`);

  const handleFilterPress = (filterId: string) => {
    const newFilter = activeFilter === filterId ? null : filterId;
    setActiveFilter(newFilter);
    if (newFilter) {
      setQuery(newFilter.replace('_', ' '));
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* ── Compact Hero Banner ─────────────────────────────────────────────── */}
      <View style={[styles.heroBanner, { paddingTop: insets.top + 8 }]}>
        {/* Background image */}
        <Image
          source={MaisonImages.featuredService}
          style={StyleSheet.absoluteFillObject as any}
          resizeMode="cover"
        />
        {/* Dark overlay */}
        <View style={styles.heroOverlay} />

        {/* Header content */}
        <View style={styles.heroContent}>
          <View>
            <Text style={styles.heroEyebrow}>EXPLORE</Text>
            <Text style={styles.heroTitle}>Find Shops</Text>
          </View>
        </View>

        {/* Search bar integrated into hero bottom */}
        <View style={[styles.searchBarWrap, { backgroundColor: theme.bg }]}>
          <View style={[styles.searchInputRow, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
            <MaterialIcons name="search" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search shops or services..."
              placeholderTextColor={theme.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Search shops"
              accessibilityHint="Enter a shop name or service type to search"
            />
            {query.length > 0 && (
              <AnimatedPressable
                onPress={() => { setQuery(''); setResults([]); setHasSearched(false); Keyboard.dismiss(); }}
                accessibilityLabel="Clear search"
                scaleOnPress={0.9}
              >
                <MaterialIcons name="close" size={18} color={theme.textMuted} />
              </AnimatedPressable>
            )}
          </View>
        </View>
      </View>

      {/* ── Service Filter Chips — Maison square-button style ───────────────── */}
      <View style={[styles.filtersRow, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <AnimatedPressable
            style={[
              styles.chip,
              !activeFilter
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: 'transparent', borderColor: theme.border },
            ]}
            onPress={() => { setActiveFilter(null); setQuery(''); setResults([]); setHasSearched(false); }}
            scaleOnPress={0.95}
          >
            <Text style={[styles.chipText, { color: !activeFilter ? theme.primaryText : theme.textMuted }]}>
              ALL
            </Text>
          </AnimatedPressable>
          {SERVICE_FILTERS.map((f) => (
            <AnimatedPressable
              key={f.id}
              style={[
                styles.chip,
                activeFilter === f.id
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: 'transparent', borderColor: theme.border },
              ]}
              onPress={() => handleFilterPress(f.id)}
              scaleOnPress={0.95}
            >
              <Text style={[styles.chipText, { color: activeFilter === f.id ? theme.primaryText : theme.textMuted }]}>
                {f.label.toUpperCase()}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Recent searches */}
        {!hasSearched && recentSearches.length > 0 && (
          <Animated.View entering={FadeIn.duration(400)} style={[styles.recentSection, { backgroundColor: theme.surface }]}>
            <View style={styles.recentHeader}>
              <View>
                <Text style={[styles.eyebrow, { color: theme.primary }]}>HISTORY</Text>
                <Text style={[styles.recentTitle, { color: theme.text }]}>Recent Searches</Text>
              </View>
              <AnimatedPressable onPress={clearRecentSearches} accessibilityLabel="Clear recent searches" scaleOnPress={0.95}>
                <Text style={[styles.clearText, { color: theme.textMuted, borderColor: theme.border }]}>CLEAR</Text>
              </AnimatedPressable>
            </View>
            {recentSearches.map((term, idx) => (
              <AnimatedPressable
                key={term}
                style={[styles.recentItem, { borderBottomColor: theme.border }]}
                onPress={() => setQuery(term)}
                accessibilityLabel={`Search for ${term}`}
                scaleOnPress={0.98}
              >
                <MaterialIcons name="history" size={16} color={theme.textMuted} />
                <Text style={[styles.recentItemText, { color: theme.text }]}>{term}</Text>
                <MaterialIcons name="north-west" size={14} color={theme.border} style={{ marginLeft: 'auto' }} />
              </AnimatedPressable>
            ))}
          </Animated.View>
        )}

        {/* Empty prompt (no search yet) */}
        {!hasSearched && recentSearches.length === 0 && (
          <Animated.View entering={FadeIn.delay(200).duration(500)} style={styles.promptState}>
            {/* Editorial image trio */}
            <View style={styles.promptImages}>
              <Image source={MaisonImages.shop1} style={[styles.promptThumb, { height: 100 }]} resizeMode="cover" />
              <Image source={MaisonImages.shop2} style={[styles.promptThumb, { height: 120 }]} resizeMode="cover" />
              <Image source={MaisonImages.shop3} style={[styles.promptThumb, { height: 100 }]} resizeMode="cover" />
            </View>
            <Text style={[styles.promptTitle, { color: theme.text }]}>
              Discover Exceptional{'  '}
              <Text style={styles.promptTitleItalic}>Laundry Services</Text>
            </Text>
            <Text style={[styles.promptBody, { color: theme.textMuted }]}>
              Search by shop name, location, or the service you need.
            </Text>
          </Animated.View>
        )}

        {/* Search results */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            {/* Results count header */}
            {!loading && (
              <View style={[styles.resultsMeta, { borderBottomColor: theme.border }]}>
                <Text style={[styles.eyebrow, { color: theme.primary }]}>RESULTS</Text>
                <Text style={[styles.resultsCount, { color: theme.text }]}>
                  {results.length} {results.length === 1 ? 'shop found' : 'shops found'}
                </Text>
              </View>
            )}

            {loading ? (
              <View style={{ paddingTop: 16 }}>
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
              </View>
            ) : results.length === 0 ? (
              <Animated.View entering={FadeIn.duration(400)} style={styles.emptyState}>
                {/* Editorial image */}
                <Image source={MaisonImages.about} style={styles.emptyImage} resizeMode="cover" />
                <View style={styles.emptyTextBlock}>
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No Results Found</Text>
                  <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
                    Try adjusting your search or browse our service categories above.
                  </Text>
                  <AnimatedPressable
                    style={[styles.ctaBtn, { borderColor: theme.border }]}
                    onPress={() => { setQuery(''); setResults([]); setHasSearched(false); setActiveFilter(null); }}
                    scaleOnPress={0.97}
                  >
                    <Text style={[styles.ctaBtnText, { color: theme.text }]}>CLEAR SEARCH</Text>
                  </AnimatedPressable>
                </View>
              </Animated.View>
            ) : (
              <View style={styles.shopList}>
                {results.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} onPress={() => handleShopPress(shop)} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero banner
  heroBanner: {
    height: SCREEN_HEIGHT * 0.22,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(41,36,32,0.55)',
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingBottom: 56,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 38,
    fontFamily: 'CormorantGaramond_500Medium',
    color: '#FFFFFF',
    lineHeight: 42,
    letterSpacing: -0.5,
  },

  // Search bar overlapping hero
  searchBarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 0,
    paddingTop: 12,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, letterSpacing: 0.2 },

  // Filter chips
  filtersRow: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  filtersScroll: { paddingHorizontal: 20, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  chipText: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },

  // Recent searches
  recentSection: { margin: 20, padding: 20 },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 4 },
  recentTitle: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
  },
  clearText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    gap: 12,
  },
  recentItemText: { fontSize: 14, fontWeight: '500', textTransform: 'capitalize', flex: 1 },

  // Prompt (idle) state
  promptState: {
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  promptImages: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
    marginBottom: 28,
  },
  promptThumb: { flex: 1, overflow: 'hidden' },
  promptTitle: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_500Medium',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  promptTitleItalic: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
  },
  promptBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Results
  resultsSection: { paddingTop: 8 },
  resultsMeta: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  resultsCount: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
  },
  shopList: { paddingTop: 20, paddingBottom: 24 },

  // Empty state
  emptyState: { marginHorizontal: 20, marginTop: 24 },
  emptyImage: { width: '100%', height: 200 },
  emptyTextBlock: { padding: 24 },
  emptyTitle: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_500Medium',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyBody: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  ctaBtn: {
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ctaBtnText: { fontSize: 9, fontWeight: '700', letterSpacing: 2 },
});
