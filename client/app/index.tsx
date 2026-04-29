import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import Colors from '../constants/colors';
export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.textPrimary} />
      </View>
    );
  }
  if (isAuthenticated) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }
  return <Redirect href="/(auth)/login" />;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
});
