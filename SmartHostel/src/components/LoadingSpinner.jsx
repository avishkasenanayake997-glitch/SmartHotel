// Component 6: LoadingSpinner
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Modal } from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';

const LoadingSpinner = ({ visible = true, message = 'Loading...', overlay = false }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const content = (
    <View style={styles.container}>
      <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]}>
        <View style={styles.ringInner} />
      </Animated.View>
      <Animated.View style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.logoText}>🏠</Text>
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>{content}</View>
      </Modal>
    );
  }

  if (!visible) return null;
  return <View style={styles.inline}>{content}</View>;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(10,14,26,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  inline: { justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl },
  container: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: COLORS.primary,
    borderTopColor: 'transparent',
    position: 'absolute',
  },
  ringInner: {
    position: 'absolute', top: 3, left: 3, right: 3, bottom: 3,
    borderRadius: 33, borderWidth: 2,
    borderColor: COLORS.gold + '44', borderBottomColor: 'transparent',
  },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 60,
  },
  logoText: { fontSize: 26 },
  message: {
    color: COLORS.textSecondary, fontSize: FONTS.sizes.sm,
    fontWeight: '500', letterSpacing: 0.5, marginTop: SPACING.base,
  },
});

export default LoadingSpinner;
