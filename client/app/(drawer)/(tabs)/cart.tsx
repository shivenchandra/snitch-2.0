import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import CartItemComponent from '../../../components/cart/CartItem';
import Button from '../../../components/ui/Button';
import { useCart } from '../../../context/CartContext';
import { useCurrency } from '../../../context/CurrencyContext';
import { useAuth } from '../../../context/AuthContext';

import { CartItem } from '../../../types';
import Colors from '../../../constants/colors';
export default function CartScreen() {
  const { items, getSubtotal, getItemCount, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const subtotal = getSubtotal();

  const handleCheckout = useCallback(() => {
    if (items.length === 0) {
      Alert.alert('Cart Empty', 'Add some items first!');
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to checkout');
      return;
    }

    router.push('/checkout');
  }, [items, user]);
  const renderCartItem = useCallback(
    ({ item, index }: { item: CartItem; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
        <CartItemComponent item={item} />
      </Animated.View>
    ),
    []
  );
  const keyExtractor = useCallback(
    (item: CartItem) => `${item.product.id}-${item.selectedSize}-${item.selectedColor.name}`,
    []
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={() => Alert.alert('Clear Cart', 'Remove all?', [{ text: 'Cancel' }, { text: 'Clear', style: 'destructive', onPress: clearCart }])}>
            <Ionicons name="grid-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {items.length > 0 ? (
        <>
          <FlatList data={items} renderItem={renderCartItem} keyExtractor={keyExtractor} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} removeClippedSubviews={true} maxToRenderPerBatch={5} />
          <Animated.View entering={FadeInUp.duration(500)} style={styles.footer}>
            <View style={styles.subtotalRow}>
              <View>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalPrice}>{formatPrice(subtotal)}</Text>
              </View>
              <Button title="Checkout" onPress={handleCheckout} size="medium" style={{ paddingHorizontal: 36 }} />
            </View>
          </Animated.View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Start shopping to add items</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceLight },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  clearBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16 },
  footer: { backgroundColor: Colors.surface, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 10 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
  subtotalPrice: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textSecondary },
});
