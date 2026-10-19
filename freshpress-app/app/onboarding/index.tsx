/**
 * Onboarding screen — Lovable "Maison" full-bleed editorial style.
 * 3-slide intro shown on first app launch. Uses MaisonImages as full-bleed
 * hero backgrounds with Ken Burns animation and editorial overlay text.
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { MaisonImages } from '@/assets/images/maison';
import Animated2, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  image: any;
  eyebrow: string;
  title: string;
  titleItalic: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    image: MaisonImages.onboarding1,
    eyebrow: 'CURATED FOR CLEAN LIVING',
    title: 'Clothes of',
    titleItalic: 'Pure Freshness',
    description: 'Premium laundry and dry-cleaning services, crafted for your everyday life.',
  },
  {
    id: '2',
    image: MaisonImages.onboarding2,
    eyebrow: 'DOOR-TO-DOOR SERVICE',
    title: 'Pickup at Your',
    titleItalic: 'Convenience',
    description: 'Schedule pickups and deliveries at your convenience. Track your order in real time.',
  },
  {
    id: '3',
    image: MaisonImages.onboarding3,
    eyebrow: 'TRUSTED PARTNERS',
    title: 'Quality You Can',
    titleItalic: 'Trust',
    description: 'Rated and verified laundry shops with transparent pricing and guaranteed results.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  // Animated dot widths (native Animated for FlatList compatibility)
  const dotWidths = useRef(SLIDES.map(() => new Animated.Value(8))).current;

  // Ken Burns scale for hero image
  const heroScale = useSharedValue(1);

  useEffect(() => {
    heroScale.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 8000 }),
        withTiming(1, { duration: 8000 })
      ),
      -1,
      true
    );
  }, [currentIndex]);

  const heroImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
  }));

  useEffect(() => {
    const animations = SLIDES.map((_, index) =>
      Animated.spring(dotWidths[index], {
        toValue: index === currentIndex ? 24 : 8,
        useNativeDriver: false,
        speed: 14,
        bounciness: 4,
      })
    );
    Animated.parallel(animations).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      handleDone();
    }
  };

  const handleDone = async () => {
    await AsyncStorage.setItem('freshpress:onboarding', 'done');
    router.replace('/(auth)');
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      {/* Full-bleed background image with Ken Burns */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated2.Image
          source={item.image}
          style={[StyleSheet.absoluteFillObject as any, { width: '100%', height: '120%' }, heroImageStyle]}
          resizeMode="cover"
        />
        {/* Multi-layer gradient overlay */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayBottom} />
      </View>

      {/* Editorial content — bottom aligned */}
      <View style={[styles.slideContent, { paddingBottom: insets.bottom + 160 }]}>
        <Text style={styles.eyebrow}>{item.eyebrow}</Text>
        <Text style={styles.slideTitle}>
          {item.title}{'\n'}
          <Text style={styles.slideTitleItalic}>{item.titleItalic}</Text>
        </Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      />

      {/* Skip button — top right */}
      <View style={[styles.skipWrap, { paddingTop: insets.top + 16 }]}>
        <Pressable
          style={styles.skipButton}
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>

      {/* Footer — dots + CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 32) }]}>
        {/* Maison-style progress bars */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((slide, index) => (
            <Animated.View
              key={slide.id}
              style={[
                styles.dot,
                {
                  width: dotWidths[index],
                  backgroundColor: index === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                },
              ]}
            />
          ))}
        </View>

        {/* CTA Button — Maison square style */}
        <Pressable
          style={styles.ctaBtn}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next slide'}
        >
          <Text style={styles.ctaBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'GET STARTED' : 'NEXT'}
          </Text>
          <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1511' },
  slide: { height, position: 'relative', overflow: 'hidden' },

  // Overlays
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(41,36,32,0.25)',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(41,36,32,0.65)',
  },

  // Slide content
  slideContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  slideTitle: {
    fontSize: 48,
    fontFamily: 'CormorantGaramond_500Medium',
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  slideTitleItalic: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontStyle: 'italic',
  },
  slideDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 24,
  },

  // Skip
  skipWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingRight: 24,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    gap: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 2,
    borderRadius: 0, // Square Maison style
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(139,85,71,1)',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  ctaBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: '#F9F5F0',
  },
});
