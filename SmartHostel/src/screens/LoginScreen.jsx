import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.appName}>SmartHostel</Text>
          <Text style={styles.tagline}>Your home away from home</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          <AuthInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon="mail-outline"
            error={errors.email}
          />
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            icon="lock-closed-outline"
            error={errors.password}
          />

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <LoadingSpinner visible message="" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={18} color={COLORS.textInverse} />
                <Text style={styles.loginBtnText}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Register link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}> Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Demo Credentials</Text>
          <Text style={styles.demoText}>Admin: admin@hostel.com / admin123</Text>
          <Text style={styles.demoText}>Student: student@hostel.com / pass123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  content: { padding: SPACING.base, paddingTop: SPACING.xxxl, paddingBottom: SPACING.xxl },
  header: { alignItems: 'center', marginBottom: SPACING.xxl },
  logoContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2, borderColor: COLORS.primary + '40',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.base,
  },
  logoEmoji: { fontSize: 38 },
  appName: { fontSize: FONTS.sizes.xxxl, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  tagline: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: SPACING.xl, marginBottom: SPACING.base,
  },
  cardTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  cardSubtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginBottom: SPACING.xl },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    paddingVertical: SPACING.base, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: COLORS.textInverse, fontSize: FONTS.sizes.md, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginVertical: SPACING.base },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  footerLink: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },
  demoCard: {
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md,
    padding: SPACING.base, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  demoTitle: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '700', marginBottom: 4 },
  demoText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
});

export default LoginScreen;
