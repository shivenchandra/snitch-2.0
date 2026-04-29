// ==========================================
// Snitch 2.0 — Drawer Navigation Layout
// Custom drawer content with user info
// ==========================================

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import Colors from '../../constants/colors';

// Custom Drawer Content
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/(auth)/login');
  }, [logout]);

  return (
    <DrawerContentScrollView {...props} style={styles.drawerContent}>
      {/* User Header */}
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0)?.toUpperCase() || 'G'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user?.displayName || 'Guest User'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'Browse as guest'}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Navigation Items */}
      <DrawerItem
        label="Home"
        icon={({ size }) => (
          <Ionicons name="home-outline" size={size} color={Colors.textPrimary} />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() => router.push('/(drawer)/(tabs)')}
      />
      <DrawerItem
        label="My Orders"
        icon={({ size }) => (
          <Ionicons name="receipt-outline" size={size} color={Colors.textPrimary} />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() => router.push('/(drawer)/orders')}
      />
      <DrawerItem
        label="Settings"
        icon={({ size }) => (
          <Ionicons name="settings-outline" size={size} color={Colors.textPrimary} />
        )}
        labelStyle={styles.drawerLabel}
        onPress={() => router.push('/(drawer)/settings')}
      />
      {isAdmin && (
        <DrawerItem
          label="Admin Dashboard"
          icon={({ size }) => (
            <Ionicons name="shield-checkmark-outline" size={size} color={Colors.textPrimary} />
          )}
          labelStyle={styles.drawerLabel}
          onPress={() => router.push('/(drawer)/admin')}
        />
      )}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Auth Action */}
      {isAuthenticated ? (
        <DrawerItem
          label="Logout"
          icon={({ size }) => (
            <Ionicons name="log-out-outline" size={size} color={Colors.error} />
          )}
          labelStyle={[styles.drawerLabel, { color: Colors.error }]}
          onPress={handleLogout}
        />
      ) : (
        <DrawerItem
          label="Sign In"
          icon={({ size }) => (
            <Ionicons name="log-in-outline" size={size} color={Colors.textPrimary} />
          )}
          labelStyle={styles.drawerLabel}
          onPress={() => router.push('/(auth)/login')}
        />
      )}

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Snitch 2.0</Text>
        <Text style={styles.footerVersion}>Version 1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const { isAdmin } = useAuth();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: Colors.surface,
          width: 280,
        },
        overlayColor: Colors.overlay,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
        }}
      />
      <Drawer.Screen
        name="orders"
        options={{
          drawerLabel: 'Orders',
          title: 'My Orders',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
        }}
      />
      <Drawer.Screen
        name="admin"
        options={{
          drawerLabel: 'Admin',
          title: 'Admin Dashboard',
          drawerItemStyle: isAdmin ? {} : { display: 'none' },
        }}
        redirect={!isAdmin}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginLeft: -4,
  },
  footer: {
    padding: 20,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 2,
  },
  footerVersion: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
