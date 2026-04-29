import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import Colors from '../../../constants/colors';
export default function ProfileScreen() {
  const { user, logout, isAuthenticated } = useAuth();
  const handleLogout = useCallback(async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  }, [logout]);
  const menuItems = [
    { icon: 'receipt-outline', label: 'My Orders', onPress: () => router.push('/(drawer)/orders') },
    { icon: 'heart-outline', label: 'Wishlist', onPress: () => router.push('/(drawer)/wishlist') },
    { icon: 'location-outline', label: 'Addresses', onPress: () => router.push('/(drawer)/addresses') },
    { icon: 'card-outline', label: 'Payment Methods', onPress: () => router.push('/(drawer)/payment') },
    { icon: 'settings-outline', label: 'Settings', onPress: () => router.push('/(drawer)/settings') },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => router.push('/(drawer)/help') },
  ];
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.displayName?.charAt(0)?.toUpperCase() || 'G'}</Text>
          </View>
          <Text style={styles.name}>{user?.displayName || 'Guest User'}</Text>
          <Text style={styles.email}>{user?.email || 'Sign in to access all features'}</Text>
          {!isAuthenticated && (
            <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={22} color={Colors.textPrimary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.version}>Snitch 2.0 • Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  profileCard: { alignItems: 'center', paddingVertical: 24, marginHorizontal: 16, backgroundColor: Colors.surfaceLight, borderRadius: 20, marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.textPrimary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.textWhite },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textSecondary },
  signInBtn: { marginTop: 16, backgroundColor: Colors.textPrimary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  signInText: { color: Colors.textWhite, fontWeight: '600', fontSize: 15 },
  menuContainer: { marginHorizontal: 16, backgroundColor: Colors.surfaceLight, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, marginHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.error },
  logoutText: { fontSize: 15, fontWeight: '600', color: Colors.error },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textTertiary, marginTop: 24, marginBottom: 32 },
});
