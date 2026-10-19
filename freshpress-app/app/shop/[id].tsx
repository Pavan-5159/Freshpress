/**
 * Shop detail screen — menu categories, service items, reviews, add to cart.
 * Dark-mode, animated, and accessible.
 * Requirement: 4.1–4.14
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { getShopById, getShopReviews } from '@/services/shopService';
import { useCartStore } from '@/store/cartStore';
import type { Shop, Review, ServiceItem } from '@/types';
import StarRating from '@/components/StarRating';
import QuantityStepper from '@/components/QuantityStepper';
import AnimatedPressable from '@/components/AnimatedPressable';
import SkeletonCard from '@/components/SkeletonCard';
import { useTheme } from '@/context/ThemeContext';
import { showAlert } from '@/utils/alert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { radius } from '@/constants/theme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';

interface ShopDetail extends Shop {
  serviceItems: ServiceItem[];
  description?: string;
}

const HEADER_IMAGE_HEIGHT = 220;

export default function ShopDetailScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const cart = useCartStore();
  const cartItemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  // Cart bar animation
  const cartBarY = useSharedValue(100);
  const cartBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cartBarY.value }],
  }));

  useEffect(() => {
    if (!reducedMotion) {
      cartBarY.value = withSpring(cartItemCount > 0 ? 0 : 100, {
        damping: 16,
        stiffness: 120,
      });
    } else {
      cartBarY.value = withTiming(cartItemCount > 0 ? 0 : 100, { duration: 0 });
    }
  }, [cartItemCount, reducedMotion]);

  useEffect(() => {
    if (!id) return;
    loadShop();
  }, [id]);

  const loadShop = async () => {
    try {
      setLoading(true);
      const shopData = await getShopById(id) as unknown as ShopDetail;
      setShop(shopData);
      const reviewsData = await getShopReviews(id);
      setReviews(reviewsData.reviews);
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (item: ServiceItem, qty: number) => {
    setQuantities((prev) => ({ ...prev, [item.id]: qty }));
    if (qty > 0) {
      const existingItem = cart.items.find((ci) => ci.serviceItem.id === item.id);
      if (existingItem) {
        cart.setQuantity(item.id, qty);
      } else {
        cart.addItem(item, shop?.name || '');
        if (qty > 1) {
          cart.setQuantity(item.id, qty);
        }
      }
    } else {
      cart.setQuantity(item.id, 0);
    }
  };

  const handleAddToCart = (item: ServiceItem) => {
    if (cart.shopId && cart.shopId !== shop?.id) {
      showAlert('Cart Conflict', 'Your cart has items from a different shop. Clear it first?');
      return;
    }
    cart.addItem(item, shop?.name || '');
    setQuantities((prev) => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const groupedItems = useMemo(() => {
    if (!shop?.serviceItems) return {};
    return shop.serviceItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ServiceItem[]>);
  }, [shop?.serviceItems]);

  const categories = useMemo(() => Object.keys(groupedItems), [groupedItems]);

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return groupedItems;
    return selectedCategory in groupedItems
      ? { [selectedCategory]: groupedItems[selectedCategory] }
      : groupedItems;
  }, [groupedItems, selectedCategory]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={[styles.skeletonHero, { backgroundColor: isDark ? '#1F2937' : '#E5E7EB' }]} />
        <View style={{ padding: 16 }}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (!shop) return null;

  const gradientColors = isDark
    ? ['transparent', 'rgba(17,24,39,0.95)', '#111827'] as const
    : ['transparent', 'rgba(249,250,251,0.95)', '#F9FAFB'] as const;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style="light" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* ── Hero Image with gradient overlay ─────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: shop.coverPhotoUrl }}
            style={styles.headerImage as any}
            resizeMode="cover"
            accessibilityLabel={`${shop.name} cover photo`}
          />
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 0, y: 1 }}
          />
          {/* Back button */}
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 12 }]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialIcons name="arrow-back" size={22} color={theme.primaryText} />
          </TouchableOpacity>

          {/* Open/Closed badge */}
          <View style={[
            styles.openBadge,
            {
              backgroundColor: shop.isOpen
                ? 'rgba(16,185,129,0.9)'
                : 'rgba(239,68,68,0.85)',
              top: insets.top + 12,
            },
          ]}>
            <View style={[styles.openDot, { backgroundColor: theme.primaryText }]} />
            <Text style={styles.openBadgeText}>
              {shop.isOpen ? 'Open Now' : 'Closed'}
            </Text>
          </View>

          {/* Shop name & meta overlaid at bottom of image */}
          <View style={styles.heroMeta}>
            <Text style={[styles.heroShopName, { fontFamily: theme.fontSerif }]} numberOfLines={2} maxFontSizeMultiplier={1.3}>
              {shop.name}
            </Text>
            <Text style={styles.heroAddress} numberOfLines={1}>
              {shop.address}
            </Text>
            <View style={styles.heroMetaRow}>
              <View style={styles.heroMetaChip}>
                <MaterialIcons name="star" size={14} color={theme.warning} />
                <Text style={styles.heroMetaChipText}>
                  {typeof shop.averageRating === 'number' ? shop.averageRating.toFixed(1) : '0.0'} ({shop.reviewCount || 0})
                </Text>
              </View>
              <View style={styles.heroMetaDot} />
              <View style={styles.heroMetaChip}>
                <MaterialIcons name="near-me" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroMetaChipText}>
                  {typeof shop.distanceKm === 'number' 
                    ? shop.distanceKm.toFixed(1) 
                    : typeof (shop as any).distance_km === 'number' 
                      ? (shop as any).distance_km.toFixed(1) 
                      : '--'} km
                </Text>
              </View>
              <View style={styles.heroMetaDot} />
              <View style={styles.heroMetaChip}>
                <MaterialIcons name="schedule" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroMetaChipText}>{shop.turnaroundHours || 24}h turnaround</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Sticky Tab Bar ───────────────────────────────────────────────── */}
        <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          {(['menu', 'reviews'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <AnimatedPressable
                key={tab}
                style={[styles.tab, isActive && [styles.tabActive, { borderBottomColor: theme.primary }]]}
                onPress={() => setActiveTab(tab)}
                accessibilityLabel={tab === 'menu' ? 'Menu tab' : `Reviews tab, ${shop.reviewCount} reviews`}
                accessibilityRole="tab"
              >
                <Text style={[
                  styles.tabText,
                  { color: isActive ? theme.primary : theme.textMuted },
                  isActive && styles.tabTextActive,
                ]}>
                  {tab === 'menu' ? 'Menu' : `Reviews (${shop.reviewCount})`}
                </Text>
              </AnimatedPressable>
            );
          })}
        </View>

        {/* ── Menu Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'menu' && (
          <View style={styles.menuContainer}>
            {/* Category filter chips (horizontal scroll) */}
            {categories.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChipsRow}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: !selectedCategory
                        ? theme.primary
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      borderColor: !selectedCategory ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(null)}
                  activeOpacity={0.75}
                  accessibilityLabel="All categories"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: !selectedCategory ? theme.primaryText : theme.textMuted },
                  ]}>
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isActive
                            ? theme.primary
                            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                          borderColor: isActive ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => setSelectedCategory(isActive ? null : cat)}
                      activeOpacity={0.75}
                      accessibilityLabel={`Filter by ${cat}`}
                      accessibilityRole="button"
                    >
                      <Text style={[
                        styles.categoryChipText,
                        { color: isActive ? theme.primaryText : theme.textMuted },
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Service item cards */}
            {Object.entries(filteredItems).length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                <View style={[styles.emptyIconBg, { backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)' }]}>
                  <MaterialIcons name="restaurant-menu" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No items available</Text>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  This shop hasn't listed any services yet.
                </Text>
              </View>
            ) : (
              Object.entries(filteredItems).map(([category, items]) => (
                <View key={category} style={styles.categoryBlock}>
                  {/* Category header */}
                  <View style={[styles.categoryHeader, { borderLeftColor: theme.primary }]}>
                    <Text style={[styles.categoryTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>
                      {category}
                    </Text>
                    <Text style={[styles.categoryCount, { color: theme.textMuted }]}>
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  {/* Item cards */}
                  {items.map((item, index) => {
                    const qty = quantities[item.id] || 0;
                    const isLast = index === items.length - 1;
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.serviceCard,
                          {
                            backgroundColor: theme.surface,
                            borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                          },
                          !isLast && { marginBottom: 10 },
                        ]}
                      >
                        <View style={styles.serviceCardInner}>
                          {/* Item info */}
                          <View style={styles.serviceItemInfo}>
                            <Text
                              style={[styles.serviceItemName, { color: theme.text }]}
                              numberOfLines={1}
                              maxFontSizeMultiplier={1.4}
                            >
                              {item.name}
                            </Text>
                            {!!item.description && (
                              <Text
                                style={[styles.serviceItemDesc, { color: theme.textMuted }]}
                                numberOfLines={2}
                                maxFontSizeMultiplier={1.2}
                              >
                                {item.description}
                              </Text>
                            )}
                            {/* Price */}
                            <View style={styles.priceRow}>
                              <Text style={[styles.currencySymbol, { color: theme.primary }]}>₹</Text>
                              <Text style={[styles.priceAmount, { color: theme.primary }]}>
                                {item.priceInr % 1 === 0
                                  ? item.priceInr.toString()
                                  : Number(item.priceInr || 0).toFixed(2)}
                              </Text>
                              <Text style={[styles.priceUnit, { color: theme.textMuted }]}>
                                /item
                              </Text>
                            </View>
                          </View>

                          {/* Add / Quantity control */}
                          <View style={styles.serviceItemAction}>
                            {qty > 0 ? (
                              <View style={[
                                styles.stepperWrapper,
                                {
                                  backgroundColor: isDark
                                    ? 'rgba(59,130,246,0.12)'
                                    : 'rgba(37,99,235,0.06)',
                                  borderColor: isDark
                                    ? 'rgba(59,130,246,0.25)'
                                    : 'rgba(37,99,235,0.15)',
                                },
                              ]}>
                                <QuantityStepper
                                  quantity={qty}
                                  onChange={(q) => handleQuantityChange(item, q)}
                                />
                              </View>
                            ) : (
                              <AnimatedPressable
                                style={[styles.addBtn, { borderColor: theme.primary }]}
                                onPress={() => handleAddToCart(item)}
                                accessibilityLabel={`Add ${item.name} to cart`}
                                accessibilityHint="Tap to add this item to your cart"
                                accessibilityRole="button"
                              >
                                <MaterialIcons name="add" size={18} color={theme.primary} />
                                <Text style={[styles.addBtnText, { color: theme.primary }]}>
                                  ADD
                                </Text>
                              </AnimatedPressable>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </View>
        )}

        {/* ── Reviews Tab ───────────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <View style={styles.reviewsContainer}>
            {reviews.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                <View style={[styles.emptyIconBg, { backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.06)' }]}>
                  <MaterialIcons name="rate-review" size={40} color={theme.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No reviews yet</Text>
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                  Be the first to review this shop.
                </Text>
              </View>
            ) : (
              reviews.map((review) => (
                <View
                  key={review.id}
                  style={[
                    styles.reviewCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    },
                  ]}
                >
                  <View style={styles.reviewTopRow}>
                    {/* Avatar initials */}
                    <View style={[styles.reviewAvatar, { backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.1)' }]}>
                      <Text style={[styles.reviewAvatarText, { color: theme.primary }]}>
                        {review.customerName?.charAt(0)?.toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View style={styles.reviewAuthorBlock}>
                      <Text style={[styles.reviewAuthor, { color: theme.text }]}>
                        {review.customerName}
                      </Text>
                      <StarRating rating={review.stars} size={13} />
                    </View>
                  </View>
                  <Text
                    style={[styles.reviewText, { color: theme.textMuted }]}
                    maxFontSizeMultiplier={1.4}
                  >
                    {review.text}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Bottom padding for cart bar */}
        <View style={{ height: cartItemCount > 0 ? 90 : 32 }} />
      </ScrollView>

      {/* ── Floating Cart Bar ─────────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.cartBar,
          cartBarStyle,
          { bottom: insets.bottom + 12 },
        ]}
      >
        <AnimatedPressable
          style={[styles.cartBarBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/cart')}
          accessibilityLabel={`View cart with ${cartItemCount} items, total ₹${(cart.grandTotal || 0).toFixed(2)}`}
          accessibilityHint="Tap to review cart and checkout"
          accessibilityRole="button"
        >
          <View style={styles.cartBarLeft}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{cartItemCount}</Text>
            </View>
            <Text style={styles.cartBarLabel}>
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarTotal}>₹{(cart.grandTotal || 0).toFixed(2)}</Text>
            <Text style={styles.cartBarAction}>View Cart</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color={theme.primaryText} />
          </View>
        </AnimatedPressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Hero ──────────────────────────────────
  heroContainer: {
    height: HEADER_IMAGE_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: HEADER_IMAGE_HEIGHT,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBadge: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  openBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  heroMeta: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroShopName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroAddress: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    marginBottom: 8,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  heroMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  heroMetaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  heroMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  // ── Tab Bar ───────────────────────────────
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },

  // ── Menu ──────────────────────────────────
  menuContainer: {
    paddingBottom: 16,
  },
  categoryChipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  categoryBlock: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    borderLeftWidth: 3,
    marginBottom: 12,
    marginTop: 16,
  },
  categoryTitle: {
    fontSize: 20,
    letterSpacing: 0,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Service Card ──────────────────────────
  serviceCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  serviceCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  serviceItemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  serviceItemName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
    marginBottom: 3,
  },
  serviceItemDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: '700',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  priceUnit: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },
  serviceItemAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperWrapper: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ── Empty State ───────────────────────────
  emptyState: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 32,
    borderRadius: radius.pill,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Skeleton ──────────────────────────────
  skeletonHero: {
    width: '100%',
    height: HEADER_IMAGE_HEIGHT,
  },

  // ── Reviews ───────────────────────────────
  reviewsContainer: {
    padding: 16,
    gap: 12,
  },
  reviewCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  reviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  reviewAuthorBlock: {
    gap: 3,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },

  // ── Cart Bar ──────────────────────────────
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    ...Platform.select({
      ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  cartBarBtn: {
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  cartBarLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBarTotal: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },
  cartBarAction: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
