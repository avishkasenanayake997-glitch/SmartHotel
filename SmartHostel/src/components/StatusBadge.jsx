// Component 4: StatusBadge
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONTS } from '../constants/theme';

const STATUS_CONFIG = {
  Available: { bg: COLORS.success + '22', text: COLORS.success, label: '● Available' },
  Full: { bg: COLORS.error + '22', text: COLORS.error, label: '● Full' },
  Maintenance: { bg: COLORS.warning + '22', text: COLORS.warning, label: '⚙ Maintenance' },
  Pending: { bg: COLORS.warning + '22', text: COLORS.warning, label: '⏳ Pending' },
  Approved: { bg: COLORS.success + '22', text: COLORS.success, label: '✓ Approved' },
  Rejected: { bg: COLORS.error + '22', text: COLORS.error, label: '✕ Rejected' },
  Cancelled: { bg: '#6B728022', text: COLORS.textMuted, label: '○ Cancelled' },
};

const SIZES = {
  small: { fontSize: FONTS.sizes.xs, paddingH: 8, paddingV: 3, borderRadius: RADIUS.sm },
  medium: { fontSize: FONTS.sizes.sm, paddingH: 12, paddingV: 5, borderRadius: RADIUS.md },
  large: { fontSize: FONTS.sizes.md, paddingH: 16, paddingV: 8, borderRadius: RADIUS.md },
};

const StatusBadge = ({ status, size = 'medium' }) => {
  const config = STATUS_CONFIG[status] || {
    bg: COLORS.glassBg,
    text: COLORS.textSecondary,
    label: status || 'Unknown',
  };
  const sizeConfig = SIZES[size] || SIZES.medium;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, paddingHorizontal: sizeConfig.paddingH, paddingVertical: sizeConfig.paddingV, borderRadius: sizeConfig.borderRadius, borderColor: config.text + '44' }]}>
      <Text style={[styles.text, { color: config.text, fontSize: sizeConfig.fontSize }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1 },
  text: { fontWeight: '700', letterSpacing: 0.2 },
});

export default StatusBadge;
