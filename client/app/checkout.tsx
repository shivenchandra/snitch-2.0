import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import Colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { getUserAddresses, getUserPaymentMethods } from '../services/userService';
import { placeOrder } from '../services/orderService';
import { Address, PaymentMethod, Order } from '../types';
import Button from '../components/ui/Button';

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

export default function CheckoutScreen() {
  const { user } = useAuth();
  const { items, getSubtotal, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const subtotal = getSubtotal();
  const shippingFee = subtotal > 1000 ? 0 : 50; // free shipping over 1000
  const total = subtotal + shippingFee;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      const [fetchedAddresses, fetchedPayments] = await Promise.all([
        getUserAddresses(user.uid),
        getUserPaymentMethods(user.uid),
      ]);
      setAddresses(fetchedAddresses);
      setPayments(fetchedPayments);

      // Auto-select defaults or first items
      if (fetchedAddresses.length > 0) {
        const def = fetchedAddresses.find(a => a.isDefault);
        setSelectedAddressId(def ? def.id : fetchedAddresses[0].id);
      }
      if (fetchedPayments.length > 0) {
        setSelectedPaymentId(fetchedPayments[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }
    if (!selectedPaymentId) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const selectedPayment = payments.find(p => p.id === selectedPaymentId);

    try {
      const orderData: Order = {
        id: Date.now().toString(),
        userId: user.uid,
        userEmail: user.email || '',
        customerName: user.displayName || 'Customer',
        items: items,
        total: total,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Processing',
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
      };

      // Clean undefined
      const cleanOrderData = JSON.parse(JSON.stringify(orderData));

      await placeOrder(cleanOrderData);

      Alert.alert('Order Placed! 🎉', `Total: ${formatPrice(total)}`, [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.replace('/(drawer)/orders');
          }
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  return (
    <AnimatedSafeArea style={styles.container} entering={FadeInRight.duration(400)}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.textPrimary} />
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Delivery Address Section */}
            <Animated.View entering={FadeInDown.delay(100).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <TouchableOpacity onPress={() => router.push('/(drawer)/addresses')}>
                  <Text style={styles.addText}>Add New</Text>
                </TouchableOpacity>
              </View>
              {addresses.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyBoxText}>No addresses saved.</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {addresses.map((addr) => (
                    <TouchableOpacity
                      key={addr.id}
                      style={[styles.card, selectedAddressId === addr.id && styles.cardSelected]}
                      onPress={() => setSelectedAddressId(addr.id)}
                    >
                      <View style={styles.cardHeader}>
                        <Ionicons
                          name={selectedAddressId === addr.id ? "radio-button-on" : "radio-button-off"}
                          size={20}
                          color={selectedAddressId === addr.id ? Colors.textPrimary : Colors.textTertiary}
                        />
                        <Text style={styles.cardBadge}>{addr.isDefault ? 'Default' : 'Other'}</Text>
                      </View>
                      <Text style={styles.cardText} numberOfLines={1}>{addr.street}</Text>
                      <Text style={styles.cardSub} numberOfLines={1}>{addr.city}, {addr.state} {addr.zip}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </Animated.View>

            {/* Payment Method Section */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: 24 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <TouchableOpacity onPress={() => router.push('/(drawer)/payment')}>
                  <Text style={styles.addText}>Add New</Text>
                </TouchableOpacity>
              </View>
              {payments.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyBoxText}>No payment methods saved.</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                  {payments.map((pay) => (
                    <TouchableOpacity
                      key={pay.id}
                      style={[styles.card, selectedPaymentId === pay.id && styles.cardSelected]}
                      onPress={() => setSelectedPaymentId(pay.id)}
                    >
                      <View style={styles.cardHeader}>
                        <Ionicons
                          name={selectedPaymentId === pay.id ? "radio-button-on" : "radio-button-off"}
                          size={20}
                          color={selectedPaymentId === pay.id ? Colors.textPrimary : Colors.textTertiary}
                        />
                        <Ionicons name="card" size={20} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
                      </View>
                      <Text style={styles.cardText}>{pay.cardNumber}</Text>
                      <Text style={styles.cardSub}>Exp: {pay.expiry}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </Animated.View>

            {/* Order Summary */}
            <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({items.length})</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>{formatPrice(total)}</Text>
              </View>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer Footer */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.footer}>
            <Button
              title={`Place Order - ${formatPrice(total)}`}
              onPress={handlePlaceOrder}
              disabled={items.length === 0 || !selectedAddressId || !selectedPaymentId}
            />
          </Animated.View>
        </>
      )}
    </AnimatedSafeArea>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  addText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  horizontalList: { gap: 12, paddingBottom: 8, paddingRight: 32 },
  emptyBox: {
    backgroundColor: Colors.surfaceLight,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyBoxText: { color: Colors.textSecondary, fontSize: 15 },
  card: {
    width: 240,
    backgroundColor: Colors.surfaceLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBadge: {
    marginLeft: 'auto',
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  cardText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4 },
  cardSub: { fontSize: 13, color: Colors.textSecondary },
  summaryContainer: {
    marginTop: 32,
    backgroundColor: Colors.surfaceLight,
    padding: 20,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryLabel: { fontSize: 15, color: Colors.textSecondary },
  summaryValue: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  summaryTotalRow: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryTotalLabel: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  summaryTotalValue: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  footer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
});
