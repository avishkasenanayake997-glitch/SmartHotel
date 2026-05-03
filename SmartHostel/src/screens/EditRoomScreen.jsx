import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { roomsAPI } from '../services/api';
import AuthInput from '../components/AuthInput';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const AMENITY_OPTIONS = ['WiFi', 'AC', 'Attached Bath', 'Hot Water', 'TV', 'Wardrobe', 'Balcony', 'Laundry'];

const EditRoomScreen = ({ route, navigation }) => {
  const { room } = route.params;
  const [form, setForm] = useState({
    roomNumber: room.roomNumber || '',
    roomType: room.roomType || 'Single',
    pricePerMonth: String(room.pricePerMonth || ''),
    capacity: String(room.capacity || ''),
    currentOccupancy: String(room.currentOccupancy || ''),
    description: room.description || '',
    availabilityStatus: room.availabilityStatus || 'Available',
  });
  const [image, setImage] = useState(room.image?.url ? { uri: room.image.url } : null);
  const [newImage, setNewImage] = useState(null);
  const [amenities, setAmenities] = useState(room.amenities || []);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleAmenity = (a) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleImageSelected = (img) => {
    setNewImage(img);
    setImage(img);
  };

  const handleSave = async () => {
    if (!form.roomNumber.trim() || !form.pricePerMonth || !form.capacity) {
      Alert.alert('Validation Error', 'Please fill in room number, price, and capacity');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('amenities', JSON.stringify(amenities));
      if (newImage) {
        formData.append('image', {
          uri: newImage.uri,
          type: newImage.mimeType || 'image/jpeg',
          name: newImage.fileName || 'room.jpg',
        });
      }
      await roomsAPI.update(room._id, formData);
      Alert.alert('✅ Updated', 'Room updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LoadingSpinner overlay visible={loading} message="Updating room..." />

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Edit Room {room.roomNumber}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageUploader image={image} onImageSelected={handleImageSelected} label="Room Photo (tap to change)" />

        <AuthInput label="Room Number *" value={form.roomNumber} onChangeText={v => set('roomNumber', v)}
          placeholder="e.g. 101A" icon="keypad-outline" autoCapitalize="characters" />

        <Text style={styles.sectionLabel}>Room Type *</Text>
        <View style={styles.typeRow}>
          {['Single', 'Double', 'Triple'].map(t => (
            <TouchableOpacity key={t} style={[styles.typeBtn, form.roomType === t && styles.typeBtnActive]} onPress={() => set('roomType', t)}>
              <Text style={[styles.typeBtnText, form.roomType === t && styles.typeBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <AuthInput label="Price/Month *" value={form.pricePerMonth} onChangeText={v => set('pricePerMonth', v)}
              placeholder="5000" keyboardType="numeric" icon="cash-outline" />
          </View>
          <View style={{ width: SPACING.sm }} />
          <View style={{ flex: 1 }}>
            <AuthInput label="Capacity *" value={form.capacity} onChangeText={v => set('capacity', v)}
              placeholder="1" keyboardType="numeric" icon="people-outline" />
          </View>
        </View>

        <AuthInput label="Current Occupancy" value={form.currentOccupancy} onChangeText={v => set('currentOccupancy', v)}
          placeholder="0" keyboardType="numeric" icon="person-outline" />

        <AuthInput label="Description" value={form.description} onChangeText={v => set('description', v)}
          placeholder="Describe the room..." icon="document-text-outline" autoCapitalize="sentences" />

        <Text style={styles.sectionLabel}>Status</Text>
        <View style={styles.typeRow}>
          {['Available', 'Full', 'Maintenance'].map(s => (
            <TouchableOpacity key={s} style={[styles.typeBtn, form.availabilityStatus === s && styles.typeBtnActive]} onPress={() => set('availabilityStatus', s)}>
              <Text style={[styles.typeBtnText, form.availabilityStatus === s && styles.typeBtnTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {AMENITY_OPTIONS.map(a => (
            <TouchableOpacity key={a} style={[styles.amenityBtn, amenities.includes(a) && styles.amenityBtnActive]} onPress={() => toggleAmenity(a)}>
              {amenities.includes(a) && <Ionicons name="checkmark" size={12} color={COLORS.primary} />}
              <Text style={[styles.amenityBtnText, amenities.includes(a) && styles.amenityBtnTextActive]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          <Ionicons name="save-outline" size={20} color={COLORS.textInverse} />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.base, paddingTop: SPACING.xl + 20, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  backBtn: { padding: SPACING.sm },
  navTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  sectionLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.sm, marginTop: SPACING.xs },
  typeRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  typeBtn: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.cardBorder, alignItems: 'center',
  },
  typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  typeBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  typeBtnTextActive: { color: COLORS.primary },
  row: { flexDirection: 'row' },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
  amenityBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  amenityBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  amenityBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  amenityBtnTextActive: { color: COLORS.primary },
  saveBtn: {
    backgroundColor: COLORS.success, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
  },
  saveBtnText: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '800' },
});

export default EditRoomScreen;
