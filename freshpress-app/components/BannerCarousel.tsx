/**
 * BannerCarousel — Lovable "Maison" editorial style.
 * Full-bleed cinematic banners with text overlay and progress dots.
 * Dark-mode aware with accessibility support.
 */

import { View, FlatList, Image, Text, StyleSheet, useWindowDimensions, Pressable } from 'react-native';
import { useRef, useEffect, useState, useCallback } from 'react';
import type { Banner } from '@/types';
import { BANNER_AUTOSCROLL_MS } from '@/constants/config';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from './AnimatedPressable';
import { MaterialIcons } from '@expo/vector-icons';

interface BannerCarouselProps {
  banners: Banner[];
  autoScrollIntervalMs?: number;
  onBannerPress?: (banner: Banner) => void;
}

export default function BannerCarousel({
  banners,
  autoScrollIntervalMs = BANNER_AUTOSCROLL_MS,
  onBannerPress,
}: BannerCarouselProps) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Banner>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, autoScrollIntervalMs);
  }, [banners.length, autoScrollIntervalMs]);

  useEffect(() => {
    if (banners.length > 1) {
      startAutoScroll();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoScroll, banners.length]);

  const onScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    [width]
  );

  if (!banners.length) return null;

  return (
    <View style={styles.container} accessibilityLabel="Promotional banner carousel">
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={200}
        accessible={false}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onBannerPress?.(item)}
            style={[styles.slide, { width }]}
            accessibilityLabel={`Banner ${index + 1}: ${item.title || 'promotional offer'}`}
            accessibilityHint="Tap to open offer"
            accessibilityRole="link"
          >
            {/* Full-bleed image */}
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />

            {/* Cinematic gradient overlay */}
            <View style={styles.overlay} />

            {/* Editorial text overlay — bottom left */}
            {(item.title || item.subtitle) && (
              <View style={styles.textOverlay}>
                {item.subtitle && (
                  <Text style={styles.bannerEyebrow} numberOfLines={1}>
                    {item.subtitle.toUpperCase()}
                  </Text>
                )}
                {item.title && (
                  <Text style={styles.bannerTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                )}
                {item.ctaLabel && (
                  <View style={styles.bannerCta}>
                    <Text style={styles.bannerCtaText}>{item.ctaLabel.toUpperCase()}</Text>
                    <MaterialIcons name="arrow-forward" size={12} color="rgba(255,255,255,0.8)" />
                  </View>
                )}
              </View>
            )}
          </Pressable>
        )}
      />

      {/* Progress bar dots — Maison editorial style */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer} accessibilityLabel="Banner page indicators">
          {banners.map((_, index) => (
            <AnimatedPressable
              key={index}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index, animated: true });
                setActiveIndex(index);
              }}
              scaleOnPress={0.9}
              accessibilityLabel={`Go to banner ${index + 1}`}
            >
              <View
                style={[
                  styles.dot,
                  index === activeIndex
                    ? { backgroundColor: theme.primary, width: 24 }
                    : { backgroundColor: theme.border, width: 8 },
                ]}
                accessibilityRole="none"
              />
            </AnimatedPressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  slide: {
    aspectRatio: 21 / 9,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Multi-stop gradient via layered views
    backgroundColor: 'rgba(41,36,32,0.35)',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 60,
  },
  bannerEyebrow: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond_500Medium',
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 8,
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bannerCtaText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.8)',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    gap: 6,
  },
  dot: {
    height: 2,
    borderRadius: 0, // Square Maison style
  },
});
