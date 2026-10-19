/**
 * Help & Support screen — FAQs, Contact Us, Privacy Policy, Terms of Service.
 * Production-grade customer support hub.
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { radius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';

interface FAQ {
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    question: 'How do I place an order?',
    answer: 'Browse nearby shops, select services, add them to your cart, and proceed to checkout. Choose your preferred delivery address and payment method, then confirm your order.',
  },
  {
    question: 'What are the delivery charges?',
    answer: 'Delivery charges vary based on distance. Orders above ₹199 usually qualify for free delivery. The exact charge is displayed at checkout.',
  },
  {
    question: 'How long does laundry take?',
    answer: 'Standard service takes 24–48 hours. Express delivery is available at select shops for same-day or next-day service at an additional charge.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order before it is confirmed by the shop. Once the shop accepts the order, cancellation may not be possible.',
  },
  {
    question: 'What if an item is damaged?',
    answer: 'We have a damage protection policy. If an item is lost or damaged, please report it within 48 hours via the app. Our team will investigate and compensate as per policy.',
  },
  {
    question: 'How do I earn loyalty rewards?',
    answer: 'Earn 1 reward point for every ₹10 spent. Points can be redeemed for discounts on future orders. Check your Wallet for the current point balance.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept UPI, Credit/Debit Cards, Net Banking, and Wallet payments via Razorpay. Cash on Delivery is not available at this time.',
  },
  {
    question: 'How do I schedule a pickup?',
    answer: 'During checkout, you can select a pickup date and time slot that works for you. Our delivery partner will arrive within the selected window.',
  },
];

const CONTACT_OPTIONS = [
  { icon: 'chat', label: 'Live Chat', description: 'Chat with our support team', action: () => {} },
  { icon: 'email', label: 'Email Us', description: 'support@freshpress.in', action: () => Linking.openURL('mailto:support@freshpress.in') },
  { icon: 'headset', label: 'Call Support', description: '+91-XXXXX-XXXXX', action: () => Linking.openURL('tel:+91XXXXXXXXXX') },
  { icon: 'help-outline', label: 'Report an Issue', description: 'Submit a complaint or feedback', action: () => {} },
];

export default function HelpSupportScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Help & Support</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Get in Touch</Text>
          <View style={styles.contactGrid}>
            {CONTACT_OPTIONS.map((option, index) => (
              <AnimatedPressable key={index} style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]} onPress={option.action}>
                <MaterialIcons name={option.icon as any} size={24} color={theme.primary} />
                <Text style={[styles.contactLabel, { color: theme.text }]}>{option.label}</Text>
                <Text style={[styles.contactDesc, { color: theme.textMuted }]}>{option.description}</Text>
              </AnimatedPressable>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
          {FAQS.map((faq, index) => (
            <View key={index} style={[styles.faqItem, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
              <Pressable style={styles.faqQuestion} onPress={() => toggleFAQ(index)}>
                <Text style={[styles.faqQuestionText, { color: theme.text }]}>{faq.question}</Text>
                <MaterialIcons
                  name={expandedIndex === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color={theme.textMuted}
                />
              </Pressable>
              {expandedIndex === index && (
                <Text style={[styles.faqAnswer, { color: theme.textMuted, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>{faq.answer}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal</Text>
          <AnimatedPressable style={[styles.legalItem, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
            <Text style={[styles.legalText, { color: theme.text }]}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>
          <AnimatedPressable onPress={() => {}} style={[styles.legalItem, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
            <Text style={[styles.legalText, { color: theme.text }]}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>
          <AnimatedPressable style={[styles.legalItem, { backgroundColor: theme.surface, borderColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
            <Text style={[styles.legalText, { color: theme.text }]}>Cancellation & Refund Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.textMuted} />
          </AnimatedPressable>
        </View>

        <View style={{ height: 32 }} />
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
  contactSection: { padding: 16 },
  sectionTitle: { fontSize: 22, letterSpacing: 0, marginBottom: 16, fontFamily: 'CormorantGaramond_500Medium' },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactCard: {
    width: '47%',
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  contactLabel: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  contactDesc: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  faqSection: { padding: 16 },
  faqItem: {
    borderRadius: radius.md,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: { flex: 1, fontSize: 14, fontWeight: '600', marginRight: 8 },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  legalSection: { padding: 16 },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  legalText: { fontSize: 15, fontWeight: '500' },
});
