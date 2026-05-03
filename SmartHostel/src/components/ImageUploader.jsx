// Component 5: ImageUploader
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONTS } from '../constants/theme';

const ImageUploader = ({ image, onImageSelected, label = 'Room Photo' }) => {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length > 0) {
      onImageSelected(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length > 0) {
      onImageSelected(result.assets[0]);
    }
  };

  const showOptions = () => {
    Alert.alert('Upload Image', 'Choose a source', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const imageUri = image?.uri || image?.url || null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadArea} onPress={showOptions} activeOpacity={0.8}>
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            <View style={styles.changeOverlay}>
              <Ionicons name="camera" size={22} color={COLORS.white} />
              <Text style={styles.changeText}>Tap to change</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.iconCircle}>
              <Ionicons name="cloud-upload-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.uploadText}>Upload Room Photo</Text>
            <Text style={styles.uploadSubText}>Tap to choose from gallery or camera</Text>
            <Text style={styles.uploadNote}>JPG, PNG, WebP • Max 5MB</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.base },
  label: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.xs },
  uploadArea: {
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 160,
  },
  previewContainer: { position: 'relative' },
  preview: { width: '100%', height: 180 },
  changeOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: SPACING.sm,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.sm,
  },
  changeText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  placeholder: { alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  iconCircle: {
    width: 64, height: 64, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.base,
  },
  uploadText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.md, fontWeight: '700', marginBottom: 4 },
  uploadSubText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginBottom: 4 },
  uploadNote: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs },
});

export default ImageUploader;
