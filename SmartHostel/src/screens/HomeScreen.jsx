import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { COLORS, SPACING, FONTS, RADIUS } from '../constants/theme';

const FILTERS = ['All', 'Single', 'Double', 'Triple'];
const STATUS_FILTERS = ['All', 'Available', 'Full', 'Maintenance'];

const HomeScreen = ({ navigation }) => {
  const { user, isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const fetchRooms = async () => {
    try {
      const params = {};
      if (typeFilter !== 'All') params.type = typeFilter;
      if (search.trim()) params.search = search.trim();
      const res = await roomsAPI.getAll(params);
      setRooms(res.data.rooms);
    } catch (err) {
      console.log('Fetch rooms error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchRooms(); }, [typeFilter, search]));

  const handleDelete = async (room) => {
    try {
      await roomsAPI.delete(room._id);
      setRooms(prev => prev.filter(r => r._id !== room._id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const renderRoom = ({ item }) => (
    <RoomCard
      room={item}
      onPress={() => navigation.navigate('RoomDetail', { roomId: item._id })}
      onEdit={() => navigation.navigate('EditRoom', { room: item })}
      onDelete={() => handleDelete(item)}
      isAdmin={isAdmin}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>{isAdmin ? 'Manage your hostel rooms' : 'Find your perfect room'}</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddRoom')}>
            <Ionicons name="add" size={22} color={COLORS.textInverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search rooms..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type filters */}
      <View style={styles.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, typeFilter === f && styles.filterBtnActive]}
            onPress={() => setTypeFilter(f)}
          >
            <Text style={[styles.filterBtnText, typeFilter === f && styles.filterBtnTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rooms Grid */}
      {loading ? (
        <LoadingSpinner message="Loading rooms..." />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={item => item._id}
          renderItem={renderRoom}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRooms(); }} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🏠</Text>
              <Text style={styles.emptyText}>No rooms found</Text>
              <Text style={styles.emptySubText}>{isAdmin ? 'Add your first room!' : 'Check back later'}</Text>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingTop: SPACING.xl + 20, paddingBottom: SPACING.base,
  },
  greeting: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    marginHorizontal: SPACING.base, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: FONTS.sizes.md },
  filtersRow: { flexDirection: 'row', paddingHorizontal: SPACING.base, gap: SPACING.sm, marginBottom: SPACING.base },
  filterBtn: {
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  filterBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterBtnText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  filterBtnTextActive: { color: COLORS.textInverse },
  row: { paddingHorizontal: SPACING.base, justifyContent: 'space-between' },
  listContent: { paddingBottom: SPACING.xxl },
  emptyContainer: { alignItems: 'center', paddingTop: SPACING.xxxl * 2 },
  emptyEmoji: { fontSize: 52, marginBottom: SPACING.base },
  emptyText: { color: COLORS.textPrimary, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  emptySubText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: 4 },
});

export default HomeScreen;
