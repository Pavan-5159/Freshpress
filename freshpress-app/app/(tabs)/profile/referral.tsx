/**
 * Referral screen — invite friends and earn rewards.
 * Dark-mode, animated, and accessible.
 */

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { radius } from '@/constants/theme';

export default function ReferralScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [referralCode] = useState('FRESH250');
  const [referralsEarned] = useState(12);
  const [totalEarned] = useState(2400);

  const handleCopyCode = () => {
    showAlert('Copied!', 'Referral code copied to clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join FreshPress and get ₹50 off your first order! Use my referral code: ${referralCode}`,
      });
    } catch {
      showAlert('Error', 'Unable to share at this time.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Refer & Earn</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <MaterialIcons name="card-giftcard" size={64} color={theme.primary} />
          <Text style={[styles.heroTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Invite Friends & Earn</Text>
          <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
            Share your unique code and get ₹50 for every friend who places their first order.
          </Text>
        </View>

        <View style={[styles.statsRow, { paddingHorizontal: 16, marginBottom: 24 }]}>
          <View style={[styles.statCard, { backgroundColor: theme.surface, elevation: 2 }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>₹{totalEarned}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Earned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface, elevation: 2 }]}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{referralsEarned}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Friends Invited</Text>
          </View>
        </View>

        <View style={[styles.codeSection, { paddingHorizontal: 16, marginBottom: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Your Referral Code</Text>
          <View style={[styles.codeCard, { borderColor: theme.primary, backgroundColor: theme.surface }]}>
            <Text style={[styles.codeText, { color: theme.primary }]}>{referralCode}</Text>
            <AnimatedPressable style={[styles.copyButton, { backgroundColor: theme.inputBg }]} onPress={handleCopyCode} accessibilityLabel="Copy referral code" accessibilityRole="button">
              <MaterialIcons name="content-copy" size={20} color={theme.primary} />
              <Text style={[styles.copyText, { color: theme.primary }]}>Copy</Text>
            </AnimatedPressable>
          </View>
        </View>

        <View style={[styles.shareSection, { paddingHorizontal: 16, marginBottom: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Share Via</Text>
          <View style={styles.shareGrid}>
            <AnimatedPressable style={[styles.shareButton, { backgroundColor: theme.surface, elevation: 2 }]} onPress={handleShare} accessibilityLabel="Share" accessibilityRole="button">
              <MaterialIcons name="share" size={24} color={theme.primary} />
              <Text style={[styles.shareLabel, { color: theme.textMuted }]}>Share</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.shareButton, { backgroundColor: theme.surface, elevation: 2 }]} onPress={handleShare} accessibilityLabel="Share via WhatsApp" accessibilityRole="button">
              <MaterialIcons name="message" size={24} color="#22C55E" />
              <Text style={[styles.shareLabel, { color: theme.textMuted }]}>WhatsApp</Text>
            </AnimatedPressable>
            <AnimatedPressable style={[styles.shareButton, { backgroundColor: theme.surface, elevation: 2 }]} onPress={handleShare} accessibilityLabel="Share via email" accessibilityRole="button">
              <MaterialIcons name="email" size={24} color="#EF4444" />
              <Text style={[styles.shareLabel, { color: theme.textMuted }]}>Email</Text>
            </AnimatedPressable>
          </View>
        </View>

        <View style={[styles.howItWorks, { paddingHorizontal: 16, paddingBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>How It Works</Text>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.primaryText, fontWeight: '700', fontSize: 14 }}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Share Your Code</Text>
              <Text style={[styles.stepDesc, { color: theme.textMuted }]}>Send your referral code to friends via any platform.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.primaryText, fontWeight: '700', fontSize: 14 }}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Friend Places Order</Text>
              <Text style={[styles.stepDesc, { color: theme.textMuted }]}>Your friend signs up and places their first laundry order.</Text>
            </View>
          </View>
          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.primaryText, fontWeight: '700', fontSize: 14 }}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Earn Rewards</Text>
              <Text style={[styles.stepDesc, { color: theme.textMuted }]}>You both get ₹50 credited to your FreshPress wallet.</Text>
            </View>
          </View>
        </View>
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
  hero: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  heroTitle: { fontSize: 28, letterSpacing: 0, marginTop: 16, fontFamily: 'CormorantGaramond_500Medium' },
  heroSubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: radius.md, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 4 },
  codeSection: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 20, letterSpacing: 0, marginBottom: 12, fontFamily: 'CormorantGaramond_500Medium' },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  codeText: { fontSize: 22, fontWeight: '700', letterSpacing: 2 },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  copyText: { fontSize: 14, fontWeight: '600' },
  shareSection: { paddingHorizontal: 16, marginBottom: 24 },
  shareGrid: { flexDirection: 'row', gap: 12 },
  shareButton: { flex: 1, borderRadius: radius.md, padding: 16, alignItems: 'center' },
  shareLabel: { fontSize: 12, marginTop: 8 },
  howItWorks: { paddingHorizontal: 16, paddingBottom: 32 },
  step: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  stepNumber: { width: 32, height: 32, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600' },
  stepDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
});
