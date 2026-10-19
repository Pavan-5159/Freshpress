/**
 * Saved addresses screen — view, add, edit, delete delivery addresses.
 * Dark-mode, animated, and accessible.
 * Requirement: 6.1–6.9, 11.5
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/services/addressService';
import type { Address as AddressType } from '@/types';
import { showAlert } from '@/utils/alert';
import { useTheme } from '@/context/ThemeContext';
import AnimatedPressable from '@/components/AnimatedPressable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '@/constants/theme';

export default function AddressesScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: '', address: '' });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await getAddresses();
      // Sort to push default to top
      data.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1));
      setAddresses(data);
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ label: '', address: '' });
    setModalVisible(true);
  };

  const openEdit = (addr: AddressType) => {
    setEditingId(addr.id);
    setForm({ label: addr.label, address: addr.formattedAddress });
    setModalVisible(true);
  };

  const handleSave = async () => {
    const label = form.label.trim();
    const address = form.address.trim();
    if (!label || !address) {
      showAlert('Error', 'Label and address are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateAddress({ id: editingId, label, formattedAddress: address });
      } else {
        await createAddress({
          label,
          formattedAddress: address,
          latitude: 0,
          longitude: 0,
        });
      }
      setModalVisible(false);
      loadAddresses();
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    showAlert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' as any },
      {
        text: 'Delete',
        style: 'destructive' as any,
        onPress: async () => {
          try {
            await deleteAddress(id);
            loadAddresses();
          } catch (err: any) {
            showAlert('Error', err?.message || 'Failed to delete address.');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultAddress(id);
      loadAddresses();
    } catch (err: any) {
      showAlert('Error', err?.message || 'Failed to set default address.');
    }
  };

  // Get dynamic icon based on label text
  const getIconForLabel = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return 'home';
    if (l.includes('work') || l.includes('office')) return 'business-center';
    return 'location-on';
  };

  const getIconColor = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return '#10B981';
    if (l.includes('work') || l.includes('office')) return '#8B5CF6';
    return theme.primary;
  };

  const getIconBg = (label: string, isDefault: boolean) => {
    if (isDefault) return 'rgba(59,130,246,0.15)';
    const l = label.toLowerCase();
    if (l.includes('home')) return 'rgba(16,185,129,0.12)';
    if (l.includes('work') || l.includes('office')) return 'rgba(139,92,246,0.12)';
    return isDark ? 'rgba(255,255,255,0.07)' : 'rgba(37,99,235,0.07)';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View
        style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      >
        <AnimatedPressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>Saved Addresses</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── ADD ADDRESS BUTTON ──────────────────────────────────────── */}
        <View style={styles.addBtnWrapper}>
          <AnimatedPressable
            style={[styles.addAddressBtn, { backgroundColor: theme.primary }]}
            onPress={openAdd}
            scaleOnPress={0.96}
            accessibilityLabel="Add new address"
            accessibilityRole="button"
          >
            <View style={[styles.addBtnIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <MaterialIcons name="add-location-alt" size={22} color="#fff" />
            </View>
            <View style={styles.addBtnTextBlock}>
              <Text style={styles.addBtnTitle}>Add New Address</Text>
              <Text style={styles.addBtnSub}>Pinpoint your delivery location</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
          </AnimatedPressable>
        </View>

        {/* ── SECTION HEADER ─────────────────────────────────────────── */}
        {addresses.length > 0 && (
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>My Addresses</Text>
            <Text style={[styles.sectionCount, { color: theme.textMuted }]}>{addresses.length} saved</Text>
          </View>
        )}

        {/* ── CONTENT ────────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.07)' }]}>
              <MaterialIcons name="where-to-vote" size={52} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>No addresses yet</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Add your first delivery address for a faster checkout experience.
            </Text>
          </View>
        ) : (
          <View style={styles.addressList}>
            {addresses.map((addr) => {
              const isDefault = addr.isDefault;
              const iconColor = isDefault ? theme.primary : getIconColor(addr.label);
              const iconBg = getIconBg(addr.label, isDefault);
              return (
                <View
                  key={addr.id}
                  style={[
                    styles.addressCard,
                    {
                      backgroundColor: theme.surface,
                      borderColor: isDefault
                        ? theme.primary
                        : isDark ? 'rgba(255,255,255,0.06)' : theme.border,
                    },
                    isDefault && {
                      ...Platform.select({
                        ios: { shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
                        android: { elevation: 6 },
                      }),
                    },
                  ]}
                >
                  {/* Default ribbon */}
                  {isDefault && (
                    <View style={[styles.defaultRibbon, { backgroundColor: theme.primary }]}>
                      <MaterialIcons name="verified" size={11} color="#fff" />
                      <Text style={styles.defaultRibbonText}>DEFAULT</Text>
                    </View>
                  )}

                  {/* Card body */}
                  <View style={styles.cardContent}>
                    <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                      <MaterialIcons name={getIconForLabel(addr.label)} size={22} color={iconColor} />
                    </View>
                    <View style={styles.addressInfo}>
                      <Text style={[styles.addressLabel, { color: theme.text }]}>{addr.label}</Text>
                      <Text style={[styles.addressText, { color: theme.textMuted }]} numberOfLines={2}>
                        {addr.formattedAddress}
                      </Text>
                    </View>
                  </View>

                  {/* Card footer actions */}
                  <View style={[styles.cardFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : theme.border }]}>
                    {!isDefault ? (
                      <AnimatedPressable
                        onPress={() => handleSetDefault(addr.id)}
                        accessibilityLabel="Set as default address"
                        style={styles.setDefaultBtn}
                      >
                        <MaterialIcons name="radio-button-unchecked" size={14} color={theme.primary} />
                        <Text style={[styles.actionTextSet, { color: theme.primary }]}>Set as default</Text>
                      </AnimatedPressable>
                    ) : (
                      <View style={[styles.setDefaultBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                        <MaterialIcons name="radio-button-checked" size={14} color={theme.primary} />
                        <Text style={[styles.actionTextSet, { color: theme.primary }]}>Default</Text>
                      </View>
                    )}
                    <View style={styles.actionRight}>
                      <AnimatedPressable
                        onPress={() => openEdit(addr)}
                        accessibilityLabel="Edit address"
                        style={[styles.actionChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(37,99,235,0.07)' }]}
                      >
                        <MaterialIcons name="edit" size={14} color={theme.primary} />
                        <Text style={[styles.actionChipText, { color: theme.primary }]}>Edit</Text>
                      </AnimatedPressable>
                      <AnimatedPressable
                        onPress={() => handleDelete(addr.id)}
                        accessibilityLabel="Delete address"
                        style={[styles.actionChip, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)' }]}
                      >
                        <MaterialIcons name="delete-outline" size={14} color={theme.danger} />
                        <Text style={[styles.actionChipText, { color: theme.danger }]}>Delete</Text>
                      </AnimatedPressable>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Add / Edit Modal ───────────────────────────────────────────────── */}
      <Modal visible={modalVisible} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, paddingBottom: insets.bottom + 24 }]}>

            {/* Modal handle */}
            <View style={[styles.modalHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#D1D5DB' }]} />

            {/* Modal icon header */}
            <View style={[styles.modalIconHeader, { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)' }]}>
              <MaterialIcons name="location-on" size={32} color={theme.primary} />
            </View>

            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: theme.fontSerif }]}>
              {editingId ? 'Edit Address' : 'New Address'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textMuted }]}>
              {editingId ? 'Update your delivery location' : 'Save a location for faster checkout'}
            </Text>

            <View style={[styles.inputGroup, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <MaterialIcons name="label-outline" size={20} color={theme.primary} style={styles.inputIcon} />
              <TextInput
                style={[styles.modalInput, { color: theme.text }]}
                placeholder="Label (e.g. Home, Work)"
                placeholderTextColor={theme.textMuted}
                value={form.label}
                onChangeText={(text) => setForm((f) => ({ ...f, label: text }))}
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: theme.inputBg, borderColor: theme.border, alignItems: 'flex-start' }]}>
              <MaterialIcons name="map" size={20} color={theme.primary} style={[styles.inputIcon, { marginTop: 14 }]} />
              <TextInput
                style={[styles.modalInput, styles.modalTextArea, { color: theme.text }]}
                placeholder="Full address (Building, Street, Area)..."
                placeholderTextColor={theme.textMuted}
                value={form.address}
                onChangeText={(text) => setForm((f) => ({ ...f, address: text }))}
                multiline
                maxLength={200}
              />
            </View>

            <View style={styles.modalButtons}>
              <AnimatedPressable
                style={[styles.modalCancel, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : theme.inputBg, borderWidth: 1, borderColor: theme.border }]}
                onPress={() => setModalVisible(false)}
                accessibilityLabel="Cancel"
              >
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Cancel</Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[styles.modalSave, { backgroundColor: theme.primary }]}
                onPress={handleSave}
                disabled={saving}
                accessibilityLabel="Save address"
              >
                {saving ? (
                  <ActivityIndicator color={theme.primaryText} />
                ) : (
                  <>
                    <MaterialIcons name="save" size={18} color={theme.primaryText} />
                    <Text style={{ color: theme.primaryText, fontSize: 16, fontWeight: '700' }}>Save</Text>
                  </>
                )}
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
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

  // ── Add Button ─────────────────────────────────
  addBtnWrapper: { padding: 16 },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  addBtnIconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnTextBlock: { flex: 1 },
  addBtnTitle: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  addBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // ── Section ─────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 22, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },
  sectionCount: { fontSize: 13, fontWeight: '500' },

  // ── Address Cards ──────────────────────────────
  addressList: { paddingHorizontal: 16, gap: 14 },
  addressCard: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  defaultRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: radius.md,
    zIndex: 2,
  },
  defaultRibbonText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  cardContent: { flexDirection: 'row', padding: 18, gap: 14, paddingRight: 24 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 16, fontWeight: '700', marginBottom: 5, letterSpacing: -0.2 },
  addressText: { fontSize: 13, lineHeight: 19 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  setDefaultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  actionTextSet: { fontSize: 13, fontWeight: '700' },
  actionRight: { flexDirection: 'row', gap: 8 },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  actionChipText: { fontSize: 12, fontWeight: '700' },

  // ── States ─────────────────────────────────────
  loader: { paddingVertical: 64, alignItems: 'center' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 24, marginBottom: 8, letterSpacing: 0, fontFamily: 'CormorantGaramond_500Medium' },
  emptyText: { fontSize: 15, fontWeight: '500', textAlign: 'center', lineHeight: 22 },

  // ── Modal ──────────────────────────────────────
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalIconHeader: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 28, textAlign: 'center', marginBottom: 6, letterSpacing: 0 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.lg,
    marginBottom: 14,
    paddingLeft: 16,
  },
  inputIcon: { marginRight: 10 },
  modalInput: { flex: 1, paddingVertical: 16, paddingRight: 16, fontSize: 16 },
  modalTextArea: { minHeight: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  modalSave: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
});
