/**
 * Subscription Plans Screen
 * Pricing cards, a side by side comparison, and a persistent CTA.
 * Presentation only: plan data, billing cycle and selection behaviour are unchanged.
 * Requirement: 13
 */

import { useState, useEffect } from 'react';
import type { ComponentProps } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  Layout,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import type { ThemeColors } from '@/constants/theme';
import { radius } from '@/constants/theme';
import { shadow } from '@/constants/shadows';
import AnimatedPressable from '@/components/AnimatedPressable';

type IconName = ComponentProps<typeof MaterialIcons>['name'];
type BillingCycle = 'MONTHLY' | 'YEARLY';

interface Plan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  benefits: { icon: IconName; text: string }[];
  popular: boolean;
  gradientColors: [string, string];
}

const PLANS: Plan[] = [
  {
    id: 'BASIC',
    name: 'Basic Wash',
    tagline: 'Steady weekly laundry, nothing fancy.',
    priceMonthly: 499,
    priceYearly: 4990,
    benefits: [
      { icon: 'local-shipping', text: '4 Free Pickups/Month' },
      { icon: 'local-laundry-service', text: 'Wash & Fold only' },
      { icon: 'schedule', text: 'Standard 48hr delivery' },
    ],
    popular: false,
    gradientColors: ['#374151', '#1F2937'],
  },
  {
    id: 'PREMIUM',
    name: 'FreshPress Premium',
    tagline: 'Everything cleaned, collected and returned faster.',
    priceMonthly: 999,
    priceYearly: 9990,
    benefits: [
      { icon: 'all-inclusive', text: 'Unlimited Pickups' },
      { icon: 'dry-cleaning', text: 'All services (Dry Clean, Press)' },
      { icon: 'bolt', text: 'Priority 24hr delivery' },
      { icon: 'savings', text: 'Zero delivery fees' },
    ],
    popular: true,
    gradientColors: ['#7A4439', '#8B5547'],
  },
];

const COMPARISON: { label: string; basic: boolean | string; premium: boolean | string }[] = [
  { label: 'Pickups included',  basic: '4 / month',             premium: 'Unlimited' },
  { label: 'Dry cleaning',      basic: false,                   premium: true },
  { label: 'Express pressing',  basic: false,                   premium: true },
  { label: 'Priority queue',    basic: false,                   premium: true },
  { label: 'Turnaround',        basic: '48 hr',                 premium: '24 hr' },
  { label: 'Delivery fees',     basic: 'Per order',             premium: 'Free' },
];

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const hexToRgba = (hex: string, alpha: number) => {
  const value = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

const savingPercent = (plan: Plan) =>
  Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100);

const MAX_SAVING_PERCENT = Math.max(...PLANS.map(savingPercent));

// --- Comparison cell ----------------------------------------------------------

function ComparisonCell({ value, highlight, theme, isDark }: { value: boolean | string; highlight: boolean; theme: ThemeColors; isDark: boolean }) {
  if (typeof value === 'boolean') {
    return (
      <View style={[styles.comparisonCol, highlight && { backgroundColor: hexToRgba(theme.primary, isDark ? 0.1 : 0.05) }]}>
        <View style={[styles.comparisonIconBg, { backgroundColor: value ? hexToRgba(theme.success, isDark ? 0.18 : 0.1) : hexToRgba(theme.danger, isDark ? 0.14 : 0.06) }]}>
          <MaterialIcons name={value ? 'check' : 'close'} size={14} color={value ? theme.success : theme.danger} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.comparisonCol, highlight && { backgroundColor: hexToRgba(theme.primary, isDark ? 0.1 : 0.05) }]}>
      <Text style={[styles.comparisonValue, { color: highlight ? theme.primary : theme.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// --- Plan card ----------------------------------------------------------------

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  billingCycle: BillingCycle;
  theme: ThemeColors;
  isDark: boolean;
  index: number;
  onSelect: () => void;
}

function PlanCard({ plan, selected, billingCycle, theme, isDark, index, onSelect }: PlanCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 220 });
  }, [selected, progress]);

  const restingBorder = isDark ? 'rgba(255,255,255,0.08)' : theme.border;
  const selectedFill = hexToRgba(theme.primary, isDark ? 0.12 : 0.05);

  const animatedCard = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.value, [0, 1], [restingBorder, theme.primary]),
    backgroundColor: interpolateColor(progress.value, [0, 1], [theme.surface, selectedFill]),
  }));

  const yearly = billingCycle === 'YEARLY';
  const perMonth = yearly ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;
  const yearlySaving = plan.priceMonthly * 12 - plan.priceYearly;

  if (plan.popular) {
    // Premium card: gradient header + white text on dark panel
    return (
      <Animated.View
        entering={FadeInDown.delay(100 + index * 90).duration(360)}
        layout={Layout.springify()}
        style={styles.popularSpacer}
      >
        <AnimatedPressable
          style={[styles.planCard, animatedCard, selected ? shadow.lg : shadow.md]}
          onPress={onSelect}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          accessibilityLabel={`${plan.name}, ${formatPrice(perMonth)} per month${yearly ? `, billed ${formatPrice(plan.priceYearly)} yearly` : ''}`}
        >
          {/* Gradient header panel */}
          <LinearGradient
            colors={['#7A4439', '#8B5547', '#A0665A']}
            style={styles.premiumHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Decorative circles */}
            <View style={styles.premiumCircle1} />
            <View style={styles.premiumCircle2} />

            <View style={styles.premiumBadgeRow}>
              <View style={styles.premiumBadge}>
                <MaterialIcons name="star" size={12} color="#FDE68A" />
                <Text style={styles.premiumBadgeText}>MOST POPULAR</Text>
              </View>
              <View style={[styles.selectMark, { backgroundColor: selected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.5)' }]}>
                {selected && <MaterialIcons name="check" size={16} color="#1D4ED8" />}
              </View>
            </View>

            <Text style={styles.premiumPlanName}>{plan.name}</Text>
            <Text style={styles.premiumTagline}>{plan.tagline}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.premiumPriceAmount}>{formatPrice(perMonth)}</Text>
              <Text style={styles.premiumPricePeriod}>/mo</Text>
            </View>
            {yearly ? (
              <View style={styles.priceCaptionRow}>
                <Text style={styles.premiumPriceCaption}>{formatPrice(plan.priceYearly)} billed yearly</Text>
                <View style={styles.premiumSavingTag}>
                  <Text style={styles.premiumSavingTagText}>Save {formatPrice(yearlySaving)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.premiumPriceCaption}>Billed monthly, cancel any time</Text>
            )}
          </LinearGradient>

          {/* Benefits */}
          <View style={styles.benefitsList}>
            {plan.benefits.map((benefit) => (
              <View key={benefit.text} style={styles.benefitRow}>
                <View style={[styles.benefitIcon, { backgroundColor: hexToRgba(theme.primary, isDark ? 0.18 : 0.09) }]}>
                  <MaterialIcons name={benefit.icon} size={16} color={theme.primary} />
                </View>
                <Text style={[styles.benefitText, { color: theme.text }]}>{benefit.text}</Text>
                <MaterialIcons name="check-circle" size={16} color={theme.success} />
              </View>
            ))}
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  }

  // Basic card
  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 90).duration(360)} layout={Layout.springify()}>
      <AnimatedPressable
        style={[styles.planCard, animatedCard, selected ? shadow.md : shadow.sm]}
        onPress={onSelect}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={`${plan.name}, ${formatPrice(perMonth)} per month`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderText}>
            <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
            <Text style={[styles.planTagline, { color: theme.textMuted }]}>{plan.tagline}</Text>
          </View>
          <View style={[styles.selectMark, { backgroundColor: selected ? theme.primary : 'transparent', borderColor: selected ? theme.primary : theme.border }]}>
            {selected && <MaterialIcons name="check" size={16} color={theme.primaryText} />}
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.priceAmount, { color: theme.text }]}>{formatPrice(perMonth)}</Text>
          <Text style={[styles.pricePeriod, { color: theme.textMuted }]}>/mo</Text>
        </View>

        {yearly ? (
          <View style={styles.priceCaptionRow}>
            <Text style={[styles.priceCaption, { color: theme.textMuted }]}>{formatPrice(plan.priceYearly)} billed yearly</Text>
            <View style={[styles.savingTag, { backgroundColor: hexToRgba(theme.success, isDark ? 0.18 : 0.1) }]}>
              <Text style={[styles.savingTagText, { color: theme.success }]}>Save {formatPrice(yearlySaving)}</Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.priceCaption, { color: theme.textMuted }]}>Billed monthly, cancel any time</Text>
        )}

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.benefitsList}>
          {plan.benefits.map((benefit) => (
            <View key={benefit.text} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.inputBg }]}>
                <MaterialIcons name={benefit.icon} size={16} color={theme.textMuted} />
              </View>
              <Text style={[styles.benefitText, { color: theme.textMuted }]}>{benefit.text}</Text>
            </View>
          ))}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// --- Screen ------------------------------------------------------------------

export default function SubscriptionScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('YEARLY');
  const [selectedPlan, setSelectedPlan] = useState<string>('PREMIUM');

  const getPrice = (plan: Plan) => (billingCycle === 'YEARLY' ? plan.priceYearly : plan.priceMonthly);
  const activePlan = PLANS.find((p) => p.id === selectedPlan) ?? PLANS[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* -- Header ----------------------------------------------------------- */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <AnimatedPressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.surface, borderColor: theme.border }]}
          accessibilityRole="button"
          accessibilityLabel="Close plans"
        >
          <MaterialIcons name="close" size={22} color={theme.text} />
        </AnimatedPressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 200 }}>
        {/* -- Hero --------------------------------------------------------- */}
        <Animated.View entering={FadeInDown.duration(360)} style={styles.heroSection}>
          <View style={[styles.heroBadge, { backgroundColor: hexToRgba(theme.primary, isDark ? 0.2 : 0.1) }]}>
            <MaterialIcons name="workspace-premium" size={16} color={theme.primary} />
            <Text style={[styles.heroBadgeText, { color: theme.primary }]}>FRESHPRESS PLANS</Text>
          </View>
          <Text style={[styles.mainTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Choose your plan</Text>
          <Text style={[styles.subTitle, { color: theme.textMuted }]}>
            Save {MAX_SAVING_PERCENT}% on yearly billing. Switch or cancel whenever you want.
          </Text>

          {/* Billing toggle */}
          <View style={[styles.toggleContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.inputBg, borderColor: theme.border }]}>
            {(['MONTHLY', 'YEARLY'] as BillingCycle[]).map((cycle) => {
              const active = billingCycle === cycle;
              return (
                <AnimatedPressable
                  key={cycle}
                  style={[styles.toggleButton, active && [styles.toggleActive, { backgroundColor: theme.surface }]]}
                  onPress={() => setBillingCycle(cycle)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`${cycle === 'MONTHLY' ? 'Monthly' : 'Yearly'} billing`}
                >
                  <Text style={[styles.toggleText, { color: active ? theme.text : theme.textMuted }]}>
                    {cycle === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                  </Text>
                  {cycle === 'YEARLY' && (
                    <View style={[styles.saveBadge, { backgroundColor: hexToRgba(theme.success, isDark ? 0.22 : 0.14) }]}>
                      <Text style={[styles.saveBadgeText, { color: theme.success }]}>-{MAX_SAVING_PERCENT}%</Text>
                    </View>
                  )}
                </AnimatedPressable>
              );
            })}
          </View>
        </Animated.View>

        {/* -- Pricing cards ------------------------------------------------ */}
        <View style={styles.cardsContainer}>
          {PLANS.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={index}
              selected={selectedPlan === plan.id}
              billingCycle={billingCycle}
              theme={theme}
              isDark={isDark}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>

        {/* -- Comparison --------------------------------------------------- */}
        <Animated.View entering={FadeInDown.delay(280).duration(360)} style={styles.comparisonSection}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>What's included</Text>

          <View style={[styles.comparisonCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }, shadow.sm]}>
            {/* Header row */}
            <View style={styles.comparisonHead}>
              <View style={styles.comparisonLabelCol} />
              {PLANS.map((plan) => (
                <View key={plan.id} style={[styles.comparisonCol, selectedPlan === plan.id && { backgroundColor: hexToRgba(theme.primary, isDark ? 0.1 : 0.05) }]}>
                  {plan.popular && <MaterialIcons name="star" size={14} color={theme.primary} style={{ marginBottom: 2 }} />}
                  <Text style={[styles.comparisonHeadText, { color: selectedPlan === plan.id ? theme.primary : theme.textMuted }]} numberOfLines={1}>
                    {plan.id === 'PREMIUM' ? 'Premium' : 'Basic'}
                  </Text>
                </View>
              ))}
            </View>

            {COMPARISON.map((row, i) => (
              <View key={row.label} style={[styles.comparisonRow, i > 0 && { borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : theme.border }]}>
                <View style={styles.comparisonLabelCol}>
                  <Text style={[styles.comparisonLabel, { color: theme.textMuted }]}>{row.label}</Text>
                </View>
                <ComparisonCell value={row.basic} highlight={selectedPlan === 'BASIC'} theme={theme} isDark={isDark} />
                <ComparisonCell value={row.premium} highlight={selectedPlan === 'PREMIUM'} theme={theme} isDark={isDark} />
              </View>
            ))}
          </View>

          {/* Assurance row */}
          <View style={styles.assuranceRow}>
            {[
              { icon: 'lock-outline' as IconName, text: 'Secure payments' },
              { icon: 'pause-circle-outline' as IconName, text: 'Pause any time' },
              { icon: 'support-agent' as IconName, text: 'Priority support' },
            ].map((item) => (
              <View key={item.text} style={[styles.assuranceItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.07)' : theme.border }]}>
                <MaterialIcons name={item.icon} size={20} color={theme.primary} />
                <Text style={[styles.assuranceText, { color: theme.textMuted }]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* -- Footer CTA ------------------------------------------------------- */}
      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: isDark ? 'rgba(255,255,255,0.07)' : theme.border, paddingBottom: (insets.bottom || 12) + 8 }]}>
        <Animated.View entering={FadeIn.duration(240)} style={styles.footerSummary}>
          <View style={styles.footerSummaryText}>
            <Text style={[styles.footerPlanName, { color: theme.text }]} numberOfLines={1}>{activePlan.name}</Text>
            <Text style={[styles.footerPlanCycle, { color: theme.textMuted }]}>{billingCycle === 'YEARLY' ? 'Billed yearly' : 'Billed monthly'}</Text>
          </View>
          <Text style={[styles.footerPrice, { color: theme.text }]}>{formatPrice(getPrice(activePlan))}</Text>
        </Animated.View>

        <AnimatedPressable
          style={[styles.subscribeBtn, shadow.md]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={`Subscribe to ${activePlan.name}`}
        >
          <LinearGradient
            colors={['#7A4439', '#8B5547', '#A0665A']}
            style={styles.subscribeBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialIcons name="workspace-premium" size={18} color="#FFFFFF" />
            <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
          </LinearGradient>
        </AnimatedPressable>

        <Text style={[styles.footerTerms, { color: theme.textMuted }]}>
          You can cancel or change your plan at any time.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 38,
    letterSpacing: -0.5,
    marginBottom: 8,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  subTitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 340,
  },

  toggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.pill,
  },
  toggleActive: { ...shadow.sm },
  toggleText: { fontSize: 15, fontWeight: '700' },
  saveBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  saveBadgeText: { fontSize: 11, fontWeight: '800' },

  cardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  popularSpacer: { marginTop: 12 },

  planCard: {
    borderRadius: radius.lg,
    borderWidth: 2,
    overflow: 'hidden',
  },

  // Premium card header
  premiumHeader: {
    padding: 20,
    paddingTop: 22,
    overflow: 'hidden',
  },
  premiumCircle1: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  premiumCircle2: {
    position: 'absolute',
    right: 40,
    bottom: -40,
    width: 100,
    height: 100,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  premiumBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(253,230,138,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  premiumBadgeText: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  premiumPlanName: {
    color: '#FFFFFF',
    fontSize: 26,
    letterSpacing: -0.4,
    marginBottom: 4,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  premiumTagline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  premiumPriceAmount: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.4,
  },
  premiumPricePeriod: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 7,
    marginLeft: 3,
  },
  premiumPriceCaption: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  premiumSavingTag: {
    backgroundColor: 'rgba(52,211,153,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  premiumSavingTagText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },

  // Basic card
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
    padding: 20,
    paddingBottom: 0,
  },
  cardHeaderText: { flex: 1 },
  planName: {
    fontSize: 22,
    letterSpacing: -0.3,
    marginBottom: 4,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  planTagline: { fontSize: 13, lineHeight: 18 },
  selectMark: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  priceAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.4,
  },
  pricePeriod: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 7,
    marginLeft: 3,
  },
  priceCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 20,
  },
  priceCaption: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  savingTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    marginTop: 6,
  },
  savingTagText: { fontSize: 11, fontWeight: '800' },

  divider: {
    height: 1,
    marginTop: 18,
    marginBottom: 18,
    marginHorizontal: 20,
  },

  benefitsList: {
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { fontSize: 14, fontWeight: '600', flex: 1 },

  // Comparison
  comparisonSection: {
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  sectionTitle: {
    fontSize: 26,
    letterSpacing: -0.3,
    marginBottom: 14,
    fontFamily: 'CormorantGaramond_500Medium',
  },
  comparisonCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  comparisonHead: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 48,
  },
  comparisonLabelCol: {
    flex: 1.4,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
  },
  comparisonCol: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  comparisonHeadText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  comparisonLabel: { fontSize: 13, fontWeight: '600' },
  comparisonValue: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  comparisonIconBg: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  assuranceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  assuranceItem: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  assuranceText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  footerSummaryText: { flex: 1 },
  footerPlanName: { fontSize: 15, fontWeight: '700' },
  footerPlanCycle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  footerPrice: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  subscribeBtn: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  subscribeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerTerms: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});
