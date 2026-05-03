import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.name.trim(), form.email.toLowerCase(), form.password, form.role, form.phone);
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>✨</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SmartHostel today</Text>
        </View>

        <View style={styles.card}>
          {/* Role Selector */}
          <Text style={styles.roleLabel}>Register as</Text>
          <View style={styles.roleRow}>
            {['student', 'admin'].map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                onPress={() => set('role', r)}
              >
                <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>
                  {r === 'student' ? '🎓 Student' : '🔑 Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AuthInput label="Full Name" value={form.name} onChangeText={v => set('name', v)}
            placeholder="John Doe" icon="person-outline" autoCapitalize="words" error={errors.name} />
          <AuthInput label="Email Address" value={form.email} onChangeText={v => set('email', v)}
            placeholder="you@example.com" keyboardType="email-address" icon="mail-outline" error={errors.email} />
          <AuthInput label="Phone (optional)" value={form.phone} onChangeText={v => set('phone', v)}
            placeholder="+94 77 123 4567" keyboardType="phone-pad" icon="call-outline" />
          <AuthInput label="Password" value={form.password} onChangeText={v => set('password', v)}
            placeholder="Min. 6 characters" secureTextEntry icon="lock-closed-outline" error={errors.password} />
          <AuthInput label="Confirm Password" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)}
            placeholder="Re-enter password" secureTextEntry icon="shield-checkmark-outline" error={errors.confirmPassword} />

          <TouchableOpacity
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister} disabled={loading} activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.base, paddingTop: SPACING.xl, paddingBottom: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  backBtn: { alignSelf: 'flex-start', padding: SPACING.sm, marginBottom: SPACING.base },
  logoContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.gold + '20', borderWidth: 2, borderColor: COLORS.gold + '40',
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.base,
  },
  logoEmoji: { fontSize: 30 },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: SPACING.xl, marginBottom: SPACING.base,
  },
  roleLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.sm },
  roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  roleBtn: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.cardBorder, alignItems: 'center',
  },
  roleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  roleBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  roleBtnTextActive: { color: COLORS.primary },
  registerBtn: {
    backgroundColor: COLORS.gold, borderRadius: RADIUS.md,
    paddingVertical: SPACING.base, alignItems: 'center', marginTop: SPACING.sm,
  },
  registerBtnText: { color: COLORS.textInverse, fontSize: FONTS.sizes.md, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  footerLink: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },
});

export default RegisterScreen;
