/**
 * Pickup & Delivery Slot Selection Screen — Lovable "Maison" editorial style.
 * Dark-mode, animated, and accessible.
 * Requirement: 8.1 - 8.5
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AnimatedPressable from '@/components/AnimatedPressable';
import DatePicker from '@/components/DatePicker';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '01:00 PM - 03:00 PM',
  '03:00 PM - 05:00 PM',
  '05:00 PM - 07:00 PM',
];

export default function SlotSelectionScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupSlot, setPickupSlot] = useState<string | null>(null);

  const defaultDeliveryDate = new Date(pickupDate);
  defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 2);
  const [deliveryDate, setDeliveryDate] = useState(defaultDeliveryDate);
  const [deliverySlot, setDeliverySlot] = useState<string | null>(null);

  const canContinue = pickupSlot && deliverySlot;

  const handleContinue = () => {
    router.push('/checkout');
  };

  const renderSlotCards = (
    selectedSlot: string | null,
    onSelect: (s: string) => void,
    disabledIndices: number[] = []
  ) => (
    <View style={styles.slotGrid}>
      {TIME_SLOTS.map((slot, index) => {
        const isSelected = selectedSlot === slot;
        const isDisabled = disabledIndices.includes(index);
        const [start, end] = slot.split(' - ');
        return (
          <AnimatedPressable
            key={slot}
            style={[
              styles.slotCard,
              {
                backgroundColor: isSelected ? theme.primary : 'transparent',
                borderColor: isSelected ? theme.primary : theme.border,
                opacity: isDisabled ? 0.35 : 1,
              },
            ]}
            onPress={() => !isDisabled && onSelect(slot)}
            disabled={isDisabled}
            scaleOnPress={0.97}
            accessibilityLabel={`Select ${slot}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
          >
            <Text style={[styles.slotTimeFrom, { color: isSelected ? theme.primaryText : theme.textMuted }]}>
              {start}
            </Text>
            <Text style={[styles.slotTimeTo, { color: isSelected ? 'rgba(249,245,240,0.7)' : theme.textMuted }]}>
              to {end}
            </Text>
            {isSelected && (
              <View style={styles.slotCheck}>
                <MaterialIcons name="check" size={10} color={theme.primaryText} />
              </View>
            )}
          </AnimatedPressable>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>

      {/* ── Editorial Header ─────────────────────────────────────────────── */}
      <View style={[styles.pageHeader, { borderBottomColor: theme.border, paddingTop: insets.top + 12 }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>STEP 1 OF 2</Text>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Schedule</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <View style={[styles.breadcrumb, { borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} scaleOnPress={0.97}>
          <Text style={[styles.breadcrumbLink, { color: theme.textMuted }]}>Cart</Text>
        </AnimatedPressable>
        <Text style={[styles.breadcrumbSep, { color: theme.border }]}>/</Text>
        <Text style={[styles.breadcrumbText, { color: theme.text }]}>Schedule</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>

        {/* ── Pickup Section ────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>PICKUP</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Collection Schedule</Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : theme.linen, borderColor: theme.border }]}>
            <DatePicker
              label="Select Date"
              value={pickupDate}
              onChange={(d) => {
                setPickupDate(d);
                const newDel = new Date(d);
                newDel.setDate(newDel.getDate() + 2);
                setDeliveryDate(newDel);
              }}
            />
            <View style={[styles.cardDivider, { borderColor: theme.border }]} />
            <Text style={[styles.subLabel, { color: theme.textMuted }]}>SELECT TIME SLOT</Text>
            {renderSlotCards(pickupSlot, setPickupSlot, [3, 4])}
          </View>
        </Animated.View>

        {/* ── Delivery Section ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(500)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>DELIVERY</Text>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Return Schedule</Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : theme.linen, borderColor: theme.border }]}>
            <DatePicker
              label="Select Date"
              value={deliveryDate}
              onChange={setDeliveryDate}
              minimumDate={pickupDate}
            />
            <View style={[styles.cardDivider, { borderColor: theme.border }]} />
            <Text style={[styles.subLabel, { color: theme.textMuted }]}>SELECT TIME SLOT</Text>
            {renderSlotCards(deliverySlot, setDeliverySlot, [0])}
          </View>
        </Animated.View>

        {/* ── Promise strip ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(240).duration(500)} style={styles.promiseRow}>
          {[
            { icon: 'schedule' as const, label: 'ON-TIME PICKUP' },
            { icon: 'local-shipping' as const, label: 'DOOR-TO-DOOR' },
            { icon: 'verified' as const, label: 'GUARANTEED' },
          ].map((p, i) => (
            <View key={p.label} style={[styles.promiseItem, i < 2 && { borderRightColor: theme.border, borderRightWidth: 1 }]}>
              <MaterialIcons name={p.icon} size={16} color={theme.primary} />
              <Text style={[styles.promiseLabel, { color: theme.textMuted }]}>{p.label}</Text>
            </View>
          ))}
        </Animated.View>

      </ScrollView>

      {/* ── Sticky Footer ────────────────────────────────────────────────── */}
      <View style={[
        styles.footer,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: insets.bottom || 20,
        }
      ]}>
        <AnimatedPressable
          style={[
            styles.continueBtn,
            {
              backgroundColor: canContinue ? theme.primary : theme.inputBg,
              borderColor: canContinue ? theme.primary : theme.border,
            },
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
          scaleOnPress={0.97}
          accessibilityLabel="Continue to address selection"
          accessibilityRole="button"
        >
          <View style={styles.continueBtnInner}>
            <Text style={[styles.continueBtnText, { color: canContinue ? theme.primaryText : theme.textMuted }]}>
              CONFIRM SCHEDULE
            </Text>
            <MaterialIcons name="arrow-forward" size={16} color={canContinue ? theme.primaryText : theme.textMuted} />
          </View>
        </AnimatedPressable>
        {!canContinue && (
          <Text style={[styles.slotHint, { color: theme.textMuted }]}>
            Select both pickup and delivery time slots to continue
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 2 },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
  },
  headerRight: { width: 32 },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  breadcrumbLink: { fontSize: 12, fontWeight: '500' },
  breadcrumbSep: { fontSize: 12 },
  breadcrumbText: { fontSize: 12, fontWeight: '600' },

  // Sections
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 26,
    fontFamily: 'CormorantGaramond_500Medium',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  card: {
    borderWidth: 1,
    padding: 20,
  },
  cardDivider: { borderTopWidth: 1, marginVertical: 16 },
  subLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2.5, marginBottom: 12 },

  // Slot grid
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    width: '48%',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotTimeFrom: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  slotTimeTo: { fontSize: 11, fontWeight: '500' },
  slotCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    backgroundColor: 'rgba(249,245,240,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Promise strip
  promiseRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  promiseItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  promiseLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 12 },
    }),
  },
  continueBtn: {
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  continueBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  continueBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  slotHint: { fontSize: 11, textAlign: 'center', fontWeight: '500' },
});
