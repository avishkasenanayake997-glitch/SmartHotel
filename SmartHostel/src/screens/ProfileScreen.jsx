import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import AuthInput from '../components/AuthInput';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../constants/theme';

const ProfileScreen = () => {
  const { user, logout, updateUser, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name: name.trim(), phone });
      updateUser(res.data.user);
      setEditing(false);
      Alert.alert('✅ Updated', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{isAdmin ? '🔑 Admin' : '🎓 Student'}</Text>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Info</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <>
              <AuthInput label="Full Name" value={name} onChangeText={setName} placeholder="Your name" icon="person-outline" autoCapitalize="words" />
              <AuthInput label="Phone" value={phone} onChangeText={setPhone} placeholder="+94 77 123 4567" keyboardType="phone-pad" icon="call-outline" />
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {[
                { icon: 'person-outline', label: 'Name', value: user?.name },
                { icon: 'mail-outline', label: 'Email', value: user?.email },
                { icon: 'call-outline', label: 'Phone', value: user?.phone || 'Not provided' },
                { icon: 'shield-outline', label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
              ].map(item => (
                <View key={item.label} style={styles.infoRow}>
                  <View style={styles.infoIconBg}>
                    <Ionicons name={item.icon} size={16} color={COLORS.primary} />
                  </View>
                  <View style={styles.infoTexts}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>

        {/* App Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Name</Text>
            <Text style={styles.aboutValue}>SmartHostel</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Stack</Text>
            <Text style={styles.aboutValue}>React Native + Node.js + MongoDB</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    alignItems: 'center', paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary + '30', borderWidth: 2, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.base,
  },
  avatarText: { fontSize: FONTS.sizes.display, fontWeight: '900', color: COLORS.primary },
  userName: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  roleBadge: {
    backgroundColor: COLORS.gold + '22', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.gold + '44', marginTop: SPACING.sm,
  },
  roleBadgeText: { color: COLORS.gold, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  userEmail: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl, borderWidth: 1,
    borderColor: COLORS.cardBorder, margin: SPACING.base, marginBottom: 0, padding: SPACING.xl,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.base },
  cardTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.textPrimary },
  editBtn: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.base },
  infoIconBg: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center',
  },
  infoTexts: { flex: 1 },
  infoLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600' },
  infoValue: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: '600', marginTop: 1 },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.sm,
  },
  saveBtnText: { color: COLORS.textInverse, fontSize: FONTS.sizes.md, fontWeight: '800' },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  aboutLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  aboutValue: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
    margin: SPACING.base, marginBottom: SPACING.xxxl,
    paddingVertical: SPACING.base, borderRadius: RADIUS.lg,
    borderWidth: 1.5, borderColor: COLORS.error,
  },
  logoutBtnText: { color: COLORS.error, fontSize: FONTS.sizes.md, fontWeight: '700' },
});

export default ProfileScreen;
