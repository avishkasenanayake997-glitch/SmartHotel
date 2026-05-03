import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, StatusBar, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { bookingsAPI } from '../services/api';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, FONTS } from '../constants/theme';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getMyBookings();
      setBookings(res.data.bookings);
    } catch (err) {
      console.log('Fetch bookings error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchBookings(); }, []));

  const handleCancel = async (bookingId) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive',
        onPress: async () => {
          try {
            await bookingsAPI.cancel(bookingId);
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b));
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const pending = bookings.filter(b => b.status === 'Pending').length;
  const approved = bookings.filter(b => b.status === 'Approved').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <Text style={styles.subtitle}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Summary stats */}
      {bookings.length > 0 && (
        <View style={styles.statsRow}>
          {[
            { label: 'Pending', count: pending, color: COLORS.warning },
            { label: 'Approved', count: approved, color: COLORS.success },
            { label: 'Total', count: bookings.length, color: COLORS.primary },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { borderColor: s.color + '44' }]}>
              <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {loading ? (
        <LoadingSpinner message="Loading bookings..." />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onCancel={() => handleCancel(item._id)} isAdmin={false} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubText}>Browse rooms and make your first booking!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.base, paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  statsRow: { flexDirection: 'row', padding: SPACING.base, gap: SPACING.sm },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 12,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1,
  },
  statCount: { fontSize: FONTS.sizes.xl, fontWeight: '900' },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxl },
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyEmoji: { fontSize: 52, marginBottom: SPACING.base },
  emptyText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  emptySubText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: 4, textAlign: 'center' },
});

export default MyBookingsScreen;
