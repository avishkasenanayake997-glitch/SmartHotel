// Component 3: BookingCard
// Displays a booking with room info, dates, status, and actions
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONTS, SHADOWS } from '../constants/theme';
import StatusBadge from './StatusBadge';

const BookingCard = ({ booking, onCancel, onApprove, onReject, isAdmin }) => {
  const room = booking?.roomId;
  const user = booking?.userId;
  const hasImage = room?.image?.url && room.image.url !== '';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const canCancel =
    !isAdmin && ['Pending', 'Approved'].includes(booking?.status);
  const canAct = isAdmin && booking?.status === 'Pending';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {/* Room image thumbnail */}
        {hasImage ? (
          <Image
            source={{ uri: room.image.url }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons name="business-outline" size={22} color={COLORS.textMuted} />
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.roomName}>
            Room {room?.roomNumber || 'N/A'}
          </Text>
          <Text style={styles.roomType}>{room?.roomType}</Text>
          {isAdmin && user && (
            <Text style={styles.studentName}>👤 {user.name}</Text>
          )}
        </View>

        <StatusBadge status={booking?.status} size="small" />
      </View>

      <View style={styles.divider} />

      {/* Dates */}
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
          <View>
            <Text style={styles.dateLabel}>Check In</Text>
            <Text style={styles.dateValue}>{formatDate(booking?.startDate)}</Text>
          </View>
        </View>
        <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={13} color={COLORS.gold} />
          <View>
            <Text style={styles.dateLabel}>Check Out</Text>
            <Text style={styles.dateValue}>{formatDate(booking?.endDate)}</Text>
          </View>
        </View>
      </View>

      {/* Total Amount */}
      {booking?.totalAmount > 0 && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>
            Rs. {booking.totalAmount?.toLocaleString()}
          </Text>
        </View>
      )}

      {/* Notes */}
      {booking?.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          📝 {booking.notes}
        </Text>
      ) : null}

      {/* Actions */}
      {(canCancel || canAct) && (
        <View style={styles.actions}>
          {canCancel && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Ionicons name="close-circle-outline" size={14} color={COLORS.error} />
              <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
          {canAct && (
            <>
              <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: SPACING.base,
    marginBottom: SPACING.base,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  roomName: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
  },
  roomType: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
  },
  studentName: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: SPACING.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateLabel: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
  },
  dateValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  totalLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
  },
  totalValue: {
    color: COLORS.gold,
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
  },
  notes: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelBtnText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.success,
    alignItems: 'center',
  },
  approveBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
  },
});

export default BookingCard;
