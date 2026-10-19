/**
 * ShopCard — Lovable "ProductCard" editorial style.
 * Tall aspect-ratio image, minimal overlay text, hover scale.
 * All shop data (rating, distance, serviceTypes) preserved.
 */

import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from './AnimatedPressable';
import type { Shop } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShopCardProps {
  shop: Shop;
  onPress?: () => void;
}

export default function ShopCard({ shop, onPress }: ShopCardProps) {
  const { theme, isDark } = useTheme();

  return (
    <AnimatedPressable
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`${shop.name}, ${shop.averageRating.toFixed(1)} stars, ${shop.distanceKm.toFixed(1)} km away`}
      accessibilityHint="Tap to view shop details and services"
      accessibilityRole="button"
      scaleOnPress={0.97}
    >
      {/* Tall editorial image */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: shop.coverPhotoUrl }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel="Shop cover photo"
        />
        {/* Dark overlay at bottom */}
        <View style={styles.imageOverlay} />

        {/* Rating badge — top right */}
        <View style={[styles.ratingBadge, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <MaterialIcons name="star" size={12} color="#D97706" />
          <Text style={styles.ratingBadgeText}>{shop.averageRating.toFixed(1)}</Text>
        </View>

        {/* Distance badge — top left */}
        <View style={[styles.distanceBadge, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <Text style={styles.distanceBadgeText}>{shop.distanceKm.toFixed(1)} km</Text>
        </View>
      </View>

      {/* Below-image content — minimal editorial */}
      <View style={[styles.content, { backgroundColor: theme.bg }]}>
        {/* Eyebrow: service types */}
        <Text style={[styles.eyebrow, { color: theme.primary }]} numberOfLines={1}>
          {shop.serviceTypes.slice(0, 2).join(' · ').toUpperCase()}
        </Text>

        {/* Shop name in serif */}
        <Text
          style={[styles.name, { color: theme.text }]}
          numberOfLines={1}
          maxFontSizeMultiplier={1.4}
        >
          {shop.name}
        </Text>

        {/* Turnaround + reviews row */}
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: theme.textMuted }]}>
            {shop.turnaroundHours}h turnaround
          </Text>
          <Text style={[styles.metaDot, { color: theme.border }]}>·</Text>
          <Text style={[styles.metaText, { color: theme.textMuted }]}>
            {shop.reviewCount} reviews
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    backgroundColor: '#2A2018',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  distanceBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    paddingTop: 12,
    paddingBottom: 4,
    gap: 4,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  name: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: 0,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
  },
});
