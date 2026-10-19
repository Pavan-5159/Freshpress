/**
 * Wishlist screen — Lovable "Maison" editorial style.
 * Saved laundry shops displayed as tall editorial image cards.
 * Dark-mode, animated, and accessible.
 * Requirement: 11.5
 */

import { View, Text, StyleSheet, ScrollView, Alert, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useWishlistStore } from '@/store/wishlistStore';
import type { Shop } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { MaisonImages } from '@/assets/images/maison';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Fallback editorial images for shops without cover photos
const EDITORIAL_FALLBACKS = [
  MaisonImages.shop1,
  MaisonImages.shop2,
  MaisonImages.shop3,
  MaisonImages.about,
];

export default function WishlistScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, removeItem } = useWishlistStore();

  const handleRemove = (shop: Shop) => {
    Alert.alert('Remove Shop', `Remove "${shop.name}" from your wishlist?`, [
      { text: 'Cancel', style: 'cancel' as any },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(shop.id) },
    ]);
  };

  const handleShopPress = (shopId: string) => {
    router.push(`/shop/${shopId}`);
  };

  // ── Empty State ─────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        {/* Editorial Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>SAVED</Text>
          <Text style={[styles.pageTitle, { color: theme.text }]}>My Wishlist</Text>
        </View>

        <Animated.View entering={FadeIn.delay(300).duration(700)} style={styles.emptyState}>
          {/* Editorial hero image strip */}
          <View style={styles.emptyImageStrip}>
            {EDITORIAL_FALLBACKS.slice(0, 3).map((img, i) => (
              <View key={i} style={[styles.emptyThumb, { opacity: 1 - i * 0.2 }]}>
                <Image source={img} style={styles.emptyThumbImage} resizeMode="cover" />
              </View>
            ))}
          </View>

          <MaterialIcons name="favorite-border" size={36} color={theme.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Saved Shops</Text>
          <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
            Discover exceptional laundry services and save your favourites for quick access.
          </Text>
          <AnimatedPressable
            style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.replace('/(tabs)')}
            accessibilityLabel="Browse shops"
            accessibilityRole="button"
            scaleOnPress={0.97}
          >
            <Text style={[styles.ctaBtnText, { color: theme.primaryText }]}>BROWSE SHOPS</Text>
            <MaterialIcons name="arrow-forward" size={14} color={theme.primaryText} />
          </AnimatedPressable>
        </Animated.View>
      </View>
    );
  }

  // ── Wishlist Items ──────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Editorial Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>SAVED</Text>
        <View style={styles.headerRow}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>My Wishlist</Text>
          <Text style={[styles.itemCount, { color: theme.textMuted }]}>{items.length} {items.length === 1 ? 'shop' : 'shops'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {/* Intro divider */}
        <View style={[styles.dividerRow, { borderColor: theme.border }]}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.dividerLabel, { color: theme.textMuted }]}>YOUR SAVED PLACES</Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        {/* Editorial product cards */}
        <View style={styles.cardGrid}>
          {items.map((shop, index) => (
            <Animated.View
              key={shop.id}
              entering={FadeInDown.delay(index * 100).duration(600)}
            >
              <AnimatedPressable
                style={styles.card}
                onPress={() => handleShopPress(shop.id)}
                accessibilityLabel={`${shop.name} wishlist item`}
                accessibilityHint="Tap to view shop details"
                accessibilityRole="button"
                scaleOnPress={0.98}
              >
                {/* Tall editorial image */}
                <View style={styles.cardImageWrap}>
                  {shop.coverPhotoUrl ? (
                    <Image source={{ uri: shop.coverPhotoUrl }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <Image source={EDITORIAL_FALLBACKS[index % EDITORIAL_FALLBACKS.length]} style={styles.cardImage} resizeMode="cover" />
                  )}
                  {/* Gradient overlay */}
                  <View style={styles.cardImageOverlay} />

                  {/* Remove button — top right */}
                  <AnimatedPressable
                    style={styles.removeBtn}
                    onPress={() => handleRemove(shop)}
                    accessibilityLabel="Remove from wishlist"
                    accessibilityRole="button"
                    scaleOnPress={0.9}
                  >
                    <MaterialIcons name="favorite" size={18} color={theme.primary} />
                  </AnimatedPressable>

                  {/* Distance badge — top left */}
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceBadgeText}>{shop.distanceKm.toFixed(1)} km</Text>
                  </View>

                  {/* Bottom content overlaid on image */}
                  <View style={styles.cardOverlayContent}>
                    <Text style={styles.cardEyebrow} numberOfLines={1}>
                      {shop.serviceTypes.slice(0, 2).join(' · ').toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Below-image editorial info */}
                <View style={[styles.cardContent, { backgroundColor: theme.bg }]}>
                  <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>
                    {shop.name}
                  </Text>
                  <Text style={[styles.cardAddress, { color: theme.textMuted }]} numberOfLines={1}>
                    {shop.address}
                  </Text>
                  <View style={styles.cardMeta}>
                    <View style={styles.ratingRow}>
                      <MaterialIcons name="star" size={13} color="#D97706" />
                      <Text style={[styles.ratingText, { color: theme.text }]}>
                        {shop.averageRating.toFixed(1)}
                      </Text>
                      <Text style={[styles.reviewCount, { color: theme.textMuted }]}>
                        ({shop.reviewCount})
                      </Text>
                    </View>
                    <Text style={[styles.metaDot, { color: theme.border }]}>·</Text>
                    <Text style={[styles.turnaround, { color: theme.textMuted }]}>
                      {shop.turnaroundHours}h turnaround
                    </Text>
                  </View>
                </View>
              </AnimatedPressable>
            </Animated.View>
          ))}
        </View>

        {/* Footer CTA */}
        <View style={[styles.footerCta, { borderTopColor: theme.border }]}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Discover more exceptional laundry services.
          </Text>
          <AnimatedPressable
            style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/(tabs)/search')}
            accessibilityLabel="Find more shops"
            accessibilityRole="button"
            scaleOnPress={0.97}
          >
            <Text style={[styles.ctaBtnText, { color: theme.primaryText }]}>FIND MORE SHOPS</Text>
            <MaterialIcons name="arrow-forward" size={14} color={theme.primaryText} />
          </AnimatedPressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 36,
    fontFamily: 'CormorantGaramond_500Medium',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  itemCount: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },

  // Divider ornament
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2.5 },

  // Cards
  cardGrid: { paddingHorizontal: 20, gap: 28 },
  card: {},
  cardImageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    backgroundColor: '#2A2018',
  },
  cardImage: { width: '100%', height: '100%' },
  cardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)',
    backgroundImage: undefined, // gradient via nested views
  },

  // Badges
  removeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 0,
    backgroundColor: 'rgba(249,245,240,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

  // Overlay text at bottom of image
  cardOverlayContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  cardEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.7)',
  },

  // Card info below image
  cardContent: {
    paddingTop: 14,
    paddingBottom: 4,
    gap: 4,
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_500Medium',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  cardAddress: { fontSize: 12, fontWeight: '500' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '600' },
  reviewCount: { fontSize: 12 },
  metaDot: { fontSize: 12 },
  turnaround: { fontSize: 12, fontWeight: '500' },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyImageStrip: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 32,
    overflow: 'hidden',
  },
  emptyThumb: { width: 80, height: 100, overflow: 'hidden' },
  emptyThumbImage: { width: '100%', height: '100%' },
  emptyTitle: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond_500Medium',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  // Footer CTA
  footerCta: {
    marginTop: 32,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  ctaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
