/**
 * Home Feed screen — Lovable Maison editorial aesthetic.
 * Full-bleed hero image, italic serif typography, editorial grids.
 * Preserves all FreshPress API calls, Zustand state, and navigation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { getHomeData } from '@/services/shopService';
import type { Shop, Banner as BannerType } from '@/types';
import ShopCard from '@/components/ShopCard';
import BannerCarousel from '@/components/BannerCarousel';
import SkeletonCard from '@/components/SkeletonCard';
import AnimatedPressable from '@/components/AnimatedPressable';
import { SKELETON_COUNT } from '@/constants/config';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '@/constants/theme';
import { MaisonImages } from '@/assets/images/maison';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SERVICE_CATEGORIES = [
  {
    id: 'wash_fold',
    label: 'Wash & Fold',
    tagline: 'Fresh & clean',
    image: MaisonImages.washFold,
    aspectRatio: 1.5,
  },
  {
    id: 'dry_clean',
    label: 'Dry Cleaning',
    tagline: 'Delicate care',
    image: MaisonImages.dryCleaning,
    aspectRatio: 3.0,
  },
  {
    id: 'ironing',
    label: 'Ironing',
    tagline: 'Crisp perfection',
    image: MaisonImages.ironing,
    aspectRatio: 1.5,
  },
  {
    id: 'shoe_clean',
    label: 'Shoe Care',
    tagline: 'Pristine finish',
    image: MaisonImages.shoeClean,
    aspectRatio: 1.5,
  },
  {
    id: 'premium',
    label: 'Premium',
    tagline: 'White glove',
    image: MaisonImages.premium,
    aspectRatio: 1.5,
  },
];

const LIFESTYLE_GRID = [
  MaisonImages.grid1,
  MaisonImages.grid2,
  MaisonImages.grid3,
  MaisonImages.grid4,
  MaisonImages.grid5,
  MaisonImages.grid6,
];

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const cartItemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const [shops, setShops] = useState<Shop[]>([]);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Ken Burns animation on hero image
  const heroScale = useSharedValue(1);
  useEffect(() => {
    heroScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 12000 }),
        withTiming(1, { duration: 12000 })
      ),
      -1,
      true
    );
  }, []);

  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  // Scroll indicator bounce
  const scrollBounce = useSharedValue(0);
  useEffect(() => {
    scrollBounce.value = withRepeat(
      withSequence(withTiming(8, { duration: 800 }), withTiming(0, { duration: 800 })),
      -1,
      true
    );
  }, []);
  const scrollIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollBounce.value }],
  }));

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);
        let loc = location;
        if (!loc) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            showAlert('Location Required', 'Please enable location to find nearby shops.');
            setLoading(false);
            setRefreshing(false);
            return;
          }
          const currentLocation = await Location.getCurrentPositionAsync({});
          loc = {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
          };
          setLocation(loc);
        }
        const data = await getHomeData({ lat: loc.lat, lng: loc.lng });
        setShops(data.shops || []);
        setBanners(data.banners || []);
      } catch (err: any) {
        showAlert('Error', err?.message || 'Failed to load nearby shops.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [location, selectedFilter]
  );

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (location) fetchData(); }, [selectedFilter]);

  const onRefresh = () => { setRefreshing(true); fetchData(true); };
  const handleShopPress = (shop: Shop) => router.push(`/shop/${shop.id}`);
  const handleBannerPress = (banner: BannerType) => { if (banner.deepLinkUrl) {} };

  const filteredShops = selectedFilter
    ? shops.filter((s) => s.serviceTypes.some((t) => t.toLowerCase().includes(selectedFilter.toLowerCase())))
    : shops;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            progressViewOffset={insets.top}
          />
        }
      >

        {/* ── HERO SECTION — Full-bleed Maison style ─────────────────── */}
        <View style={[styles.heroSection, { height: SCREEN_HEIGHT * 0.82 }]}>
          {/* Background image with Ken Burns */}
          <View style={StyleSheet.absoluteFillObject}>
            <Animated.Image
              source={MaisonImages.hero}
              style={[StyleSheet.absoluteFillObject, { width: '100%', height: '120%' }, heroImageStyle]}
              resizeMode="cover"
            />
            {/* Dark gradient overlay — top + bottom */}
            <View style={styles.heroGradientTop} />
            <View style={styles.heroGradientBottom} />
          </View>

          {/* Top nav bar overlay */}
          <View style={[styles.heroNav, { paddingTop: insets.top + 12 }]}>
            <View>
              <Text style={styles.heroBrand}>FreshPress</Text>
            </View>
            <View style={styles.heroNavActions}>
              <AnimatedPressable
                style={styles.heroNavBtn}
                onPress={() => router.push('/(tabs)/notifications')}
                accessibilityLabel="Notifications"
              >
                <MaterialIcons name="notifications-none" size={22} color="#FFFFFF" />
              </AnimatedPressable>
              <AnimatedPressable
                style={styles.heroNavBtn}
                onPress={() => router.push('/cart')}
                accessibilityLabel={`Cart. ${cartItemCount} items`}
              >
                <MaterialIcons name="shopping-cart-checkout" size={22} color="#FFFFFF" />
                {cartItemCount > 0 && (
                  <View style={[styles.cartBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                  </View>
                )}
              </AnimatedPressable>
            </View>
          </View>

          {/* Hero editorial text — bottom-aligned */}
          <View style={styles.heroContent}>
            <Animated.View entering={FadeInUp.delay(300).duration(800)}>
              <Text style={styles.heroEyebrow}>CURATED FOR CLEAN LIVING</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500).duration(900)}>
              <Text style={styles.heroH1}>
                Clothes of{'\n'}
                <Text style={styles.heroH1Italic}>Pure Freshness</Text>
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(700).duration(800)}>
              <Text style={styles.heroSubtitle}>
                Premium laundry and dry-cleaning services,{'\n'}crafted for your everyday life.
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(900).duration(700)}>
              <TouchableOpacity
                style={styles.heroBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/search')}
                accessibilityLabel="Book a Pickup"
                accessibilityRole="button"
              >
                <Text style={styles.heroBtnText}>BOOK A PICKUP</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Scroll indicator */}
          <Animated.View style={[styles.scrollIndicator, scrollIndicatorStyle]}>
            <Text style={styles.scrollText}>SCROLL</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color="rgba(255,255,255,0.5)" />
          </Animated.View>
        </View>

        {/* ── FEATURED SERVICE — editorial 2-column ──────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.featuredSection, { backgroundColor: theme.bg }]}
        >
          <View style={styles.featuredGrid}>
            {/* Left: tall image */}
            <View style={styles.featuredImageWrap}>
              <Image
                source={MaisonImages.featuredService}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.featuredImageOverlay} />
            </View>

            {/* Right: editorial text */}
            <View style={styles.featuredText}>
              <Text style={[styles.eyebrow, { color: theme.primary }]}>FEATURED SERVICE</Text>
              <Text style={[styles.editorialHeading, { color: theme.text }]}>
                Premium{'\n'}
                <Text style={styles.editorialHeadingItalic}>Dry Cleaning</Text>
              </Text>
              <Text style={[styles.editorialBody, { color: theme.textMuted }]}>
                Expert care for your finest garments. We treat every piece with the attention it deserves.
              </Text>
              <TouchableOpacity
                style={[styles.squareBtn, { backgroundColor: theme.primary }]}
                activeOpacity={0.85}
                onPress={() => setSelectedFilter('dry_clean')}
              >
                <Text style={styles.squareBtnText}>EXPLORE</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* ── SERVICES GRID — Lovable "Collections" asymmetric ───────── */}
        <View style={[styles.servicesSection, { backgroundColor: isDark ? theme.surface : '#EDE8E0' }]}>
          <View style={styles.sectionHeaderBlock}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>EXPLORE</Text>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>Our Services</Text>
          </View>

          {/* Asymmetric grid: large + small */}
          <View style={styles.servicesGrid}>
            {/* Top row: 1 wide + 1 narrow */}
            <View style={styles.servicesRow}>
              <ServiceCard
                item={SERVICE_CATEGORIES[0]}
                style={styles.serviceCardWide}
                onPress={() => setSelectedFilter(SERVICE_CATEGORIES[0].id)}
                theme={theme}
              />
              <ServiceCard
                item={SERVICE_CATEGORIES[1]}
                style={styles.serviceCardNarrow}
                onPress={() => setSelectedFilter(SERVICE_CATEGORIES[1].id)}
                theme={theme}
              />
            </View>
            {/* Bottom row: 3 equal */}
            <View style={styles.servicesRow}>
              {SERVICE_CATEGORIES.slice(2).map((item) => (
                <ServiceCard
                  key={item.id}
                  item={item}
                  style={styles.serviceCardThird}
                  onPress={() => setSelectedFilter(item.id)}
                  theme={theme}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ── BANNERS (Offers) ────────────────────────────────────────── */}
        {banners.length > 0 && (
          <View style={[styles.sectionPad, { backgroundColor: theme.bg }]}>
            <View style={styles.sectionHeaderBlock}>
              <Text style={[styles.eyebrow, { color: theme.primary }]}>THIS WEEK</Text>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Offers & Deals</Text>
            </View>
            <BannerCarousel banners={banners} onBannerPress={handleBannerPress} />
          </View>
        )}

        {/* ── NEARBY SHOPS — editorial ProductCard style ──────────────── */}
        <View style={[styles.sectionPad, { backgroundColor: theme.bg }]}>
          <View style={[styles.sectionHeaderBlock, styles.sectionHeaderRow]}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.primary }]}>NEAR YOU</Text>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>Nearby Shops</Text>
            </View>
            {!loading && filteredShops.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Text style={[styles.viewAllText, { color: theme.textMuted }]}>View All</Text>
                <MaterialIcons name="arrow-forward" size={14} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Service type filter chips — minimal Maison style */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                !selectedFilter && { backgroundColor: theme.primary, borderColor: theme.primary },
                selectedFilter && { borderColor: theme.border, backgroundColor: 'transparent' },
              ]}
              onPress={() => setSelectedFilter(null)}
            >
              <Text style={[styles.chipText, !selectedFilter ? { color: '#FFFFFF' } : { color: theme.textMuted }]}>
                All
              </Text>
            </TouchableOpacity>
            {SERVICE_CATEGORIES.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.chip,
                  selectedFilter === s.id && { backgroundColor: theme.primary, borderColor: theme.primary },
                  selectedFilter !== s.id && { borderColor: theme.border, backgroundColor: 'transparent' },
                ]}
                onPress={() => setSelectedFilter(s.id)}
              >
                <Text style={[
                  styles.chipText,
                  selectedFilter === s.id ? { color: '#FFFFFF' } : { color: theme.textMuted },
                ]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonCard key={i} />)}
            </View>
          ) : filteredShops.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <MaterialIcons name="store-mall-directory" size={40} color={theme.primary} />
              <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>
                No shops found nearby
              </Text>
              <Text style={[styles.emptyBody, { color: theme.textMuted }]}>
                Try adjusting your filters or search for a different location.
              </Text>
              <TouchableOpacity
                style={[styles.squareBtn, { backgroundColor: theme.primary, marginTop: 16 }]}
                onPress={() => setSelectedFilter(null)}
              >
                <Text style={styles.squareBtnText}>CLEAR FILTERS</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.shopList}>
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} onPress={() => handleShopPress(shop)} />
              ))}
            </View>
          )}
        </View>

        {/* ── ABOUT STRIP — centered editorial quote ──────────────────── */}
        <View style={[styles.aboutSection, { backgroundColor: isDark ? theme.surface : '#EDE8E0' }]}>
          <Text style={[styles.eyebrow, { color: theme.primary, textAlign: 'center', marginBottom: 16 }]}>
            ABOUT US
          </Text>
          <Text style={[styles.aboutQuote, { color: theme.text }]}>
            We believe in the beauty of clean—in garments cared for with intention, returned fresh and ready for life's every{' '}
            <Text style={styles.aboutQuoteItalic}>moment.</Text>
          </Text>
          <TouchableOpacity
            style={[styles.squareBtnOutline, { borderColor: theme.primary }]}
            onPress={() => router.push('/subscription')}
          >
            <Text style={[styles.squareBtnOutlineText, { color: theme.primary }]}>OUR PLANS</Text>
            <MaterialIcons name="arrow-forward" size={14} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* ── LIFESTYLE GRID — 3×2 editorial image strip ─────────────── */}
        <View style={[styles.lifestyleSection, { backgroundColor: theme.bg }]}>
          <View style={styles.sectionHeaderBlock}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>FOLLOW US</Text>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>@freshpress</Text>
          </View>
          <View style={styles.lifestyleGrid}>
            {LIFESTYLE_GRID.map((img, i) => (
              <View key={i} style={styles.lifestyleCell}>
                <Image source={img} style={styles.lifestyleImage} resizeMode="cover" />
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Service Card sub-component ─────────────────────────────────────────────────
function ServiceCard({
  item,
  style,
  onPress,
  theme,
}: {
  item: (typeof SERVICE_CATEGORIES)[0];
  style: any;
  onPress: () => void;
  theme: any;
}) {
  return (
    <TouchableOpacity style={[styles.serviceCard, style]} activeOpacity={0.9} onPress={onPress}>
      <Image 
        source={item.image} 
        style={{ width: '100%', height: undefined, aspectRatio: item.aspectRatio }} 
        resizeMode="contain" 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Hero ──────────────────────────────────────────────────────
  heroSection: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#1A1511',
  },
  heroGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'transparent',
    backgroundGradient: 'rgba(0,0,0,0.35)',
    // React Native gradient trick via overlay
    zIndex: 1,
  },
  heroGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // Simulated gradient bottom
    zIndex: 1,
  },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  heroBrand: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: 1,
  },
  heroNavActions: {
    flexDirection: 'row',
    gap: 8,
  },
  heroNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF' },
  heroContent: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  heroH1: {
    color: '#FFFFFF',
    fontSize: 56,
    fontFamily: 'CormorantGaramond_500Medium',
    lineHeight: 60,
    letterSpacing: -1,
    marginBottom: 16,
  },
  heroH1Italic: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontStyle: 'italic',
    fontSize: 60,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 280,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#8B5547',
    paddingHorizontal: 24,
    paddingVertical: 14,
    // Square — Lovable uses 0 radius
    borderRadius: 0,
  },
  heroBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  scrollText: {
    fontSize: 9,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },

  // ── Featured Section ──────────────────────────────────────────
  featuredSection: { paddingVertical: 48, paddingHorizontal: 20 },
  featuredGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  featuredImageWrap: {
    flex: 1,
    aspectRatio: 4 / 5,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(41,36,32,0.15)',
  },
  featuredText: {
    flex: 1,
    paddingVertical: 12,
    gap: 0,
  },

  // ── Services Grid ─────────────────────────────────────────────
  servicesSection: { paddingVertical: 48 },
  sectionHeaderBlock: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionHeading: {
    fontSize: 38,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  servicesGrid: {
    paddingHorizontal: 12,
    gap: 6,
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  serviceCard: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  serviceCardWide: {
    flex: 1.6,
  },
  serviceCardNarrow: {
    flex: 1,
  },
  serviceCardThird: {
    flex: 1,
  },
  serviceCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  serviceCardContent: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  serviceCardTagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  serviceCardLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: 0.3,
  },

  // ── Section padding ───────────────────────────────────────────
  sectionPad: {
    paddingVertical: 40,
  },

  // ── Filter Chips ──────────────────────────────────────────────
  chipRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 0, // Square — Maison style
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // ── Shop list ─────────────────────────────────────────────────
  shopList: {
    paddingTop: 4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },

  // ── Empty State ───────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 26,
    letterSpacing: 0,
    marginTop: 12,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  // ── About Strip ───────────────────────────────────────────────
  aboutSection: {
    paddingVertical: 56,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  aboutQuote: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond_500Medium',
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.2,
  },
  aboutQuoteItalic: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontStyle: 'italic',
  },

  // ── Lifestyle Grid ────────────────────────────────────────────
  lifestyleSection: {
    paddingTop: 48,
    paddingBottom: 8,
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lifestyleCell: {
    width: SCREEN_WIDTH / 3,
    height: SCREEN_WIDTH / 3,
    overflow: 'hidden',
    padding: 1,
  },
  lifestyleImage: {
    width: '100%',
    height: '100%',
  },

  // ── Shared Buttons ────────────────────────────────────────────
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3.5,
    marginBottom: 10,
  },
  editorialHeading: {
    fontSize: 34,
    fontFamily: 'CormorantGaramond_500Medium',
    lineHeight: 38,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  editorialHeadingItalic: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontStyle: 'italic',
  },
  editorialBody: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  squareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
  },
  squareBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  squareBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 1,
  },
  squareBtnOutlineText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
