import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, StatusBar, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { bookingsAPI } from '../services/api';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const STATUS_TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const AdminBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const fetchBookings = async () => {
    try {
      const params = activeTab !== 'All' ? { status: activeTab } : {};
      const res = await bookingsAPI.getAllBookings(params);
      setBookings(res.data.bookings);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchBookings(); }, [activeTab]));

  const handleApprove = async (bookingId) => {
    try {
      await bookingsAPI.updateStatus(bookingId, 'Approved');
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Approved' } : b));
      Alert.alert('✅ Approved', 'Booking has been approved');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleReject = async (bookingId) => {
    Alert.alert('Reject Booking', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: async () => {
          try {
            await bookingsAPI.updateStatus(bookingId, 'Rejected');
            setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'Rejected' } : b));
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const pending = bookings.filter(b => b.status === 'Pending').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>All Bookings</Text>
        {pending > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pending} pending</Text>
          </View>
        )}
      </View>

      {/* Status tabs */}
      <View style={styles.tabsRow}>
        {STATUS_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingSpinner message="Loading bookings..." />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              isAdmin={true}
              onApprove={() => handleApprove(item._id)}
              onReject={() => handleReject(item._id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBookings(); }} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.base, paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  title: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary },
  pendingBadge: {
    backgroundColor: COLORS.warning + '22', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.warning + '44',
  },
  pendingBadgeText: { color: COLORS.warning, fontSize: FONTS.sizes.sm, fontWeight: '700' },
  tabsRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm, gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  tabTextActive: { color: COLORS.textInverse },
  listContent: { padding: SPACING.base, paddingBottom: SPACING.xxl },
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyEmoji: { fontSize: 52, marginBottom: SPACING.base },
  emptyText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

export default AdminBookingsScreen;
