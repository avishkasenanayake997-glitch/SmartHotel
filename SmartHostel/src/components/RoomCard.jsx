// Component 2: RoomCard
// Displays a room with image, type badge, price, and availability
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import StatusBadge from './StatusBadge';

const RoomCard = ({ room, onPress, onEdit, onDelete, isAdmin, cardWidth }) => {
  const hasImage = room?.image?.url && room.image.url !== '';

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Room Image */}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: room.image.url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="business-outline" size={36} color={COLORS.textMuted} />
          </View>
        )}
        {/* Type Badge overlay */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{room.roomType}</Text>
        </View>
        {/* Admin actions */}
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={onEdit}
            >
              <Ionicons name="pencil" size={12} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={onDelete}
            >
              <Ionicons name="trash" size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Room Info */}
      <View style={styles.info}>
        <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>

        <StatusBadge status={room.availabilityStatus} size="small" />

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            Rs. {room.pricePerMonth?.toLocaleString()}
          </Text>
          <Text style={styles.perMonth}>/mo</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.footerText}>
              {room.currentOccupancy}/{room.capacity}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden',
    marginBottom: SPACING.base,
    ...SHADOWS.sm,
  },
  imageContainer: {
    position: 'relative',
    height: 130,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.primary + 'CC',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: COLORS.textInverse,
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
  },
  adminActions: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionBtn: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: { backgroundColor: COLORS.info },
  deleteBtn: { backgroundColor: COLORS.error },
  info: {
    padding: SPACING.md,
  },
  roomNumber: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.sm,
  },
  price: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
  },
  perMonth: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.xs,
  },
});

export default RoomCard;
