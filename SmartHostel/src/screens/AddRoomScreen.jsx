import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, StatusBar, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { roomsAPI } from '../services/api';
import AuthInput from '../components/AuthInput';
import ImageUploader from '../components/ImageUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const AMENITY_OPTIONS = ['WiFi', 'AC', 'Attached Bath', 'Hot Water', 'TV', 'Wardrobe', 'Balcony', 'Laundry'];

const AddRoomScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    roomNumber: '', roomType: 'Single', pricePerMonth: '',
    capacity: '', description: '', availabilityStatus: 'Available',
  });
  const [image, setImage] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleAmenity = (a) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const validate = () => {
    const e = {};
    if (!form.roomNumber.trim()) e.roomNumber = 'Room number is required';
    if (!form.pricePerMonth) e.pricePerMonth = 'Price is required';
    if (!form.capacity) e.capacity = 'Capacity is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('amenities', JSON.stringify(amenities));
      if (image) {
        formData.append('image', {
          uri: image.uri,
          type: image.mimeType || 'image/jpeg',
          name: image.fileName || 'room.jpg',
        });
      }
      await roomsAPI.create(formData);
      Alert.alert('✅ Success', 'Room created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LoadingSpinner overlay visible={loading} message="Creating room..." />

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Add New Room</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImageUploader image={image} onImageSelected={setImage} label="Room Photo" />

        <AuthInput label="Room Number *" value={form.roomNumber} onChangeText={v => set('roomNumber', v)}
          placeholder="e.g. 101A" icon="keypad-outline" autoCapitalize="characters" error={errors.roomNumber} />

        {/* Room Type Selector */}
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
            <AuthInput label="Price/Month (Rs) *" value={form.pricePerMonth} onChangeText={v => set('pricePerMonth', v)}
              placeholder="5000" keyboardType="numeric" icon="cash-outline" error={errors.pricePerMonth} />
          </View>
          <View style={{ width: SPACING.sm }} />
          <View style={{ flex: 1 }}>
            <AuthInput label="Capacity *" value={form.capacity} onChangeText={v => set('capacity', v)}
              placeholder="1" keyboardType="numeric" icon="people-outline" error={errors.capacity} />
          </View>
        </View>

        <AuthInput label="Description" value={form.description} onChangeText={v => set('description', v)}
          placeholder="Describe the room..." icon="document-text-outline" autoCapitalize="sentences" />

        {/* Status Selector */}
        <Text style={styles.sectionLabel}>Availability Status</Text>
        <View style={styles.typeRow}>
          {['Available', 'Maintenance'].map(s => (
            <TouchableOpacity key={s} style={[styles.typeBtn, form.availabilityStatus === s && styles.typeBtnActive]} onPress={() => set('availabilityStatus', s)}>
              <Text style={[styles.typeBtnText, form.availabilityStatus === s && styles.typeBtnTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Amenities */}
        <Text style={styles.sectionLabel}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {AMENITY_OPTIONS.map(a => (
            <TouchableOpacity key={a} style={[styles.amenityBtn, amenities.includes(a) && styles.amenityBtnActive]} onPress={() => toggleAmenity(a)}>
              {amenities.includes(a) && <Ionicons name="checkmark" size={12} color={COLORS.primary} />}
              <Text style={[styles.amenityBtnText, amenities.includes(a) && styles.amenityBtnTextActive]}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color={COLORS.textInverse} />
          <Text style={styles.submitBtnText}>Create Room</Text>
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
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl, width: '100%', maxWidth: 700, alignSelf: 'center' },
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
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.base, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
  },
  submitBtnText: { color: COLORS.textInverse, fontSize: FONTS.sizes.lg, fontWeight: '800' },
});

export default AddRoomScreen;
