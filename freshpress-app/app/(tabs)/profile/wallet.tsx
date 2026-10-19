/**
 * Wallet screen — shows balance, loyalty points, and transaction history.
 * Dark-mode, animated, and accessible.
 */

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '@/constants/theme';
import { getWallet, topUpWallet, WalletTransaction } from '@/services/walletService';
import { showAlert } from '@/utils/alert';

export default function WalletScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [loyaltyPoints] = useState(2450); // Mocked loyalty points for now

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await getWallet();
      setBalance(Number(data.balance));
      setTransactions(data.transactions);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to fetch wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    Alert.alert(
      'Top Up Wallet',
      'Choose an amount to add to your wallet',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '₹500', onPress: () => performTopUp(500) },
        { text: '₹1000', onPress: () => performTopUp(1000) },
        { text: '₹2000', onPress: () => performTopUp(2000) },
      ]
    );
  };

  const performTopUp = async (amount: number) => {
    try {
      setTopUpLoading(true);
      const data = await topUpWallet(amount);
      setBalance(Number(data.balance));
      setTransactions(data.transactions);
      showAlert('Success', `₹${amount} added to your wallet!`);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to top up');
    } finally {
      setTopUpLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const totalCredit = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + Number(t.amount), 0);
  const totalDebit = transactions.filter((t) => t.type === 'DEBIT').reduce((s, t) => s + Number(t.amount), 0);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>My Wallet</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── BALANCE CARD ─────────────────────────────────────────────── */}
        <View style={[styles.balanceCard, { backgroundColor: theme.primary }]}>
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
            </View>
            <View style={[styles.loyaltyBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <MaterialIcons name="stars" size={18} color="#FCD34D" />
              <Text style={styles.loyaltyText}>{loyaltyPoints.toLocaleString()} pts</Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={[styles.statsRow, { borderTopColor: 'rgba(255,255,255,0.15)' }]}>
            <View style={styles.statItem}>
              <MaterialIcons name="arrow-downward" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLabel}>Total Added</Text>
              <Text style={styles.statValue}>₹{totalCredit}</Text>
            </View>
            <View style={[styles.statDivider]} />
            <View style={styles.statItem}>
              <MaterialIcons name="arrow-upward" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLabel}>Total Spent</Text>
              <Text style={styles.statValue}>₹{totalDebit}</Text>
            </View>
            <View style={[styles.statDivider]} />
            <View style={styles.statItem}>
              <MaterialIcons name="receipt-long" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.statLabel}>Transactions</Text>
              <Text style={styles.statValue}>{transactions.length}</Text>
            </View>
          </View>
        </View>

        {/* ── QUICK ACTIONS ────────────────────────────────────────────── */}
        <View style={styles.quickActions}>
          <AnimatedPressable
            style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleTopUp}
            accessibilityLabel="Add money"
            accessibilityRole="button"
          >
            {topUpLoading ? (
              <ActivityIndicator color={theme.primary} style={styles.actionIconCircle} />
            ) : (
              <View style={[styles.actionIconCircle, { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)' }]}>
                <MaterialIcons name="add" size={22} color={theme.primary} />
              </View>
            )}
            <Text style={[styles.actionLabel, { color: theme.text }]}>Top Up</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {}}
            accessibilityLabel="Redeem points"
            accessibilityRole="button"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.08)' }]}>
              <MaterialIcons name="redeem" size={22} color="#F59E0B" />
            </View>
            <Text style={[styles.actionLabel, { color: theme.text }]}>Redeem</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => {}}
            accessibilityLabel="View history"
            accessibilityRole="button"
          >
            <View style={[styles.actionIconCircle, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.08)' }]}>
              <MaterialIcons name="history" size={22} color={theme.success} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.text }]}>History</Text>
          </AnimatedPressable>
        </View>

        {/* ── LOYALTY TIER ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Loyalty Program</Text>
          <View
            style={[
              styles.tierCard,
              { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border },
            ]}
          >
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                <MaterialIcons name="verified" size={20} color="#F59E0B" />
                <Text style={[styles.tierName, { color: '#F59E0B' }]}>Gold Member</Text>
              </View>
              <Text style={[styles.tierPoints, { color: theme.text }]}>
                {loyaltyPoints.toLocaleString()} <Text style={{ color: theme.textMuted, fontSize: 13 }}>pts</Text>
              </Text>
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={[styles.progressLabel, { color: theme.textMuted }]}>Progress to Platinum</Text>
              <Text style={[styles.progressPct, { color: '#F59E0B' }]}>
                {Math.round((2450 / 3000) * 100)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
              <View style={[styles.progressFill, { width: `${(2450 / 3000) * 100}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.textMuted }]}>
              Earn <Text style={{ color: '#F59E0B', fontWeight: '700' }}>550 more points</Text> to unlock Platinum benefits
            </Text>
          </View>
        </View>

        {/* ── TRANSACTIONS ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Recent Transactions</Text>
          <View style={[styles.transactionCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
            {transactions.map((tx, idx) => (
              <View
                key={tx.id}
                style={[
                  styles.transactionRow,
                  idx < transactions.length - 1 && { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border, borderBottomWidth: 1 },
                ]}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: tx.type === 'CREDIT' ? `${theme.success}22` : `${theme.danger}22` },
                  ]}
                >
                  <MaterialIcons
                    name={tx.type === 'CREDIT' ? 'south-west' : 'north-east'}
                    size={18}
                    color={tx.type === 'CREDIT' ? theme.success : theme.danger}
                  />
                </View>
                <View style={styles.transactionMeta}>
                  <Text style={[styles.transactionDesc, { color: theme.text }]} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={[styles.transactionDate, { color: theme.textMuted }]}>{formatDate(tx.createdAt)}</Text>
                </View>
                <View style={styles.amountCol}>
                  <Text style={[styles.transactionAmount, { color: tx.type === 'CREDIT' ? theme.success : theme.danger }]}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                  </Text>
                  <Text style={[styles.txType, { color: tx.type === 'CREDIT' ? theme.success : theme.danger }]}>
                    {tx.type === 'CREDIT' ? 'Credit' : 'Debit'}
                  </Text>
                </View>
              </View>
            ))}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 24, letterSpacing: 0, flex: 1, textAlign: 'center', marginRight: 32 },
  spacer: { width: 32 },

  // ── Balance Card ────────────────────────────────
  balanceCard: {
    margin: 16,
    borderRadius: radius.pill,
    padding: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  decorCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: 40,
  },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: '500' },
  balanceAmount: { fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  loyaltyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  loyaltyText: { fontSize: 13, fontWeight: '700', color: '#FCD34D' },

  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 16,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  statValue: { fontSize: 15, color: '#fff', fontWeight: '800' },

  // ── Quick Actions ────────────────────────────────
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 12, fontWeight: '700' },

  // ── Section ──────────────────────────────────────
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 22, marginBottom: 12, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },

  // ── Loyalty Tier ─────────────────────────────────
  tierCard: {
    borderRadius: radius.pill,
    padding: 18,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  tierHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tierName: { fontSize: 14, fontWeight: '800' },
  tierPoints: { fontSize: 22, fontWeight: '800' },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: '500' },
  progressPct: { fontSize: 13, fontWeight: '800' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#F59E0B' },
  progressText: { fontSize: 13, lineHeight: 19 },

  // ── Transactions ─────────────────────────────────
  transactionCard: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  transactionMeta: { flex: 1 },
  transactionDesc: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  transactionDate: { fontSize: 12 },
  amountCol: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 15, fontWeight: '800' },
  txType: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});

