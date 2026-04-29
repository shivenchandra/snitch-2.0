import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CurrencyProvider } from '../context/CurrencyContext';
import { WishlistProvider } from '../context/WishlistContext';
SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <CartProvider>
              <WishlistProvider>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    contentStyle: { backgroundColor: '#FFFFFF' },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(drawer)" />
                  <Stack.Screen
                    name="product/[id]"
                    options={{
                      animation: 'slide_from_bottom',
                      presentation: 'card',
                    }}
                  />
                  <Stack.Screen
                    name="search"
                    options={{
                      animation: 'fade',
                    }}
                  />
                </Stack>
              </WishlistProvider>
            </CartProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
