import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../../types';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import Colors from '../../constants/colors';
interface CartItemProps {
  item: CartItemType;
}
const CartItem: React.FC<CartItemProps> = React.memo(({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  const handleIncrement = useCallback(() => {
    updateQuantity(item.product.id, item.quantity + 1);
  }, [item.product.id, item.quantity, updateQuantity]);
  const handleDecrement = useCallback(() => {
    updateQuantity(item.product.id, item.quantity - 1);
  }, [item.product.id, item.quantity, updateQuantity]);
  const handleRemove = useCallback(() => {
    removeFromCart(item.product.id);
  }, [item.product.id, removeFromCart]);
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.product.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.details}>
        <View style={styles.topRow}>
          <View style={styles.nameSection}>
            <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
            <Text style={styles.meta}>Size: {item.selectedSize}   Color: {item.selectedColor.name}</Text>
          </View>
          <TouchableOpacity onPress={handleRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.price}>{formatPrice(item.product.price)}</Text>
            {item.product.originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(item.product.originalPrice)}</Text>
            )}
          </View>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={handleDecrement}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity style={styles.quantityButton} onPress={handleIncrement}>
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});
const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  image: { width: 80, height: 90, borderRadius: 12, backgroundColor: Colors.surfaceLight },
  details: { flex: 1, marginLeft: 14, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nameSection: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  meta: { fontSize: 12, color: Colors.textTertiary, letterSpacing: 0.2 },
  deleteButton: { padding: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  originalPrice: { fontSize: 12, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: 10, paddingHorizontal: 4, paddingVertical: 2 },
  quantityButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  quantityButtonText: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  quantity: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, minWidth: 24, textAlign: 'center' },
});
export default CartItem;
