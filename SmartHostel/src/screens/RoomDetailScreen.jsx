import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity, StyleSheet,
  Alert, StatusBar, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { roomsAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, FONTS, RADIUS, SHADOWS } from '../constants/theme';

const RoomDetailScreen = ({ route, navigation }) => {
  const { roomId } = route.params;
  const { isAdmin, isAuthenticated } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRoom();
  }, []);

  const fetchRoom = async () => {
    try {
      const res = await roomsAPI.getById(roomId);
      setRoom(res.data.room);
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Missing dates', 'Please enter start and end dates (YYYY-MM-DD)');
      return;
    }
    setBookingLoading(true);
    try {
      await bookingsAPI.create({ roomId: room._id, startDate, endDate, notes });
      setBookingModal(false);
      Alert.alert('🎉 Success!', 'Your booking request has been submitted. Please wait for admin approval.');
    } catch (err) {
      Alert.alert('Booking Failed', err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <LoadingSpinner overlay visible message="Loading room..." />;
  if (!room) return null;

  const hasImage = room?.image?.url;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Room Image */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image source={{ uri: room.image.url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="business-outline" size={60} color={COLORS.textMuted} />
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditRoom', { room })}>
              <Ionicons name="pencil" size={18} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.body}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.roomNumber}>Room {room.roomNumber}</Text>
              <Text style={styles.roomType}>{room.roomType} Room</Text>
            </View>
            <StatusBadge status={room.availabilityStatus} size="medium" />
          </View>

          {/* Price */}
          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Monthly Rate</Text>
            <Text style={styles.price}>Rs. {room.pricePerMonth?.toLocaleString()}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { icon: 'people-outline', label: 'Capacity', value: room.capacity },
              { icon: 'person-outline', label: 'Occupied', value: room.currentOccupancy },
              { icon: 'bed-outline', label: 'Available', value: room.capacity - room.currentOccupancy },
            ].map(stat => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon} size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          {room.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{room.description}</Text>
            </View>
          ) : null}

          {/* Amenities */}
          {room.amenities?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesRow}>
                {room.amenities.map((a, i) => (
                  <View key={i} style={styles.amenityTag}>
                    <Text style={styles.amenityText}>{a}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now Button */}
      {!isAdmin && room.availabilityStatus === 'Available' && (
        <View style={styles.bookBtnContainer}>
          <TouchableOpacity style={styles.bookBtn} onPress={() => setBookingModal(true)} activeOpacity={0.85}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.textInverse} />
            <Text style={styles.bookBtnText}>Book This Room</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Modal */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Book Room {room.roomNumber}</Text>
            <Text style={styles.modalSubtitle}>Enter your preferred dates</Text>
            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.modalInput} value={startDate} onChangeText={setStartDate} placeholder="2026-06-01" placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.modalInput} value={endDate} onChangeText={setEndDate} placeholder="2026-12-01" placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput style={[styles.modalInput, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="Any special requests..." placeholderTextColor={COLORS.textMuted} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setBookingModal(false)}>
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, bookingLoading && { opacity: 0.7 }]} onPress={handleBook} disabled={bookingLoading}>
                <Text style={styles.confirmBtnText}>{bookingLoading ? 'Booking...' : 'Confirm Booking'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imageContainer: { position: 'relative', height: 280 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: COLORS.surfaceLight, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: 48, left: SPACING.base,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  editBtn: {
    position: 'absolute', top: 48, right: SPACING.base,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.info + 'CC', justifyContent: 'center', alignItems: 'center',
  },
  body: { padding: SPACING.base },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.base },
  roomNumber: { fontSize: FONTS.sizes.xxl, fontWeight: '900', color: COLORS.textPrimary },
  roomType: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: 2 },
  priceCard: {
    backgroundColor: COLORS.primary + '18', borderRadius: RADIUS.lg,
    padding: SPACING.base, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.base, borderWidth: 1, borderColor: COLORS.primary + '33',
  },
  priceLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
  price: { color: COLORS.primary, fontSize: FONTS.sizes.xxl, fontWeight: '900' },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', gap: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  statValue: { color: COLORS.textPrimary, fontSize: FONTS.sizes.xl, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
  section: { marginBottom: SPACING.base },
  sectionTitle: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: '700', marginBottom: SPACING.sm },
  description: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, lineHeight: 22 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  amenityTag: {
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  amenityText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  bookBtnContainer: {
    padding: SPACING.base, backgroundColor: COLORS.background,
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
  },
  bookBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
  },
  bookBtnText: { color: COLORS.textInverse, fontSize: FONTS.sizes.lg, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl, paddingBottom: SPACING.xxxl,
  },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  modalSubtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: SPACING.xl },
  inputLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.xs },
  modalInput: {
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.cardBorder, color: COLORS.textPrimary, fontSize: FONTS.sizes.md,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, marginBottom: SPACING.md,
  },
  modalActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  cancelModalBtn: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center',
  },
  cancelModalBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: '700' },
  confirmBtn: {
    flex: 2, paddingVertical: SPACING.md, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  confirmBtnText: { color: COLORS.textInverse, fontSize: FONTS.sizes.md, fontWeight: '800' },
});

export default RoomDetailScreen;
