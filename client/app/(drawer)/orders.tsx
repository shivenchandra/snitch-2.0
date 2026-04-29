import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders, updateOrderStatus } from '../../services/orderService';
import { Order } from '../../types';
import Colors from '../../constants/colors';

const statusColors: Record<string, string> = {
  Delivered: '#10B981',
  Shipped: '#3B82F6',
  Processing: '#F59E0B',
  Pending: '#6B7280',
  Cancelled: '#EF4444',
};

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

export default function OrdersScreen() {
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
          const data = await getUserOrders(user.uid);
          if (isActive) setOrders(data);
        } catch (error) {
          console.error(error);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      fetchOrders();
      return () => { isActive = false; };
    }, [user])
  );

  const toggleExpand = useCallback((orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  }, []);

  const handleCancelOrder = useCallback((orderId: string) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await updateOrderStatus(orderId, 'Cancelled', 'Cancelled by customer');
            if (user) {
              const data = await getUserOrders(user.uid);
              setOrders(data);
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel order');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.textPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <AnimatedSafeArea style={styles.container} edges={['top']} entering={FadeInRight.duration(400)}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <Animated.View style={styles.orderCard} entering={FadeInDown.delay(index * 100).duration(400)}>
            <View style={styles.orderTop}>
              <Text style={styles.orderId}>Order #{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
                <Text style={[styles.statusText, { color: statusColors[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderDate}>{item.date}</Text>
              <Text style={styles.orderItems}>{item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
            </View>
            {item.status === 'Cancelled' && item.cancelReason && (
              <View style={styles.cancelReasonBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.cancelReasonText}>{item.cancelReason}</Text>
              </View>
            )}
            <View style={styles.orderBottom}>
              <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
              <View style={styles.actionRow}>
                {(item.status === 'Pending' || item.status === 'Processing') && (
                  <TouchableOpacity onPress={() => handleCancelOrder(item.id)} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                  <Text style={styles.viewDetails}>
                    {expandedOrderId === item.id ? 'Hide Details' : 'View Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expanded Item Details */}
            {expandedOrderId === item.id && (
              <View style={styles.expandedContainer}>
                {item.items.map((cartItem, index) => (
                  <View key={index} style={styles.expandedItemRow}>
                    <Image source={{ uri: cartItem.product.image }} style={styles.expandedItemImage} />
                    <View style={styles.expandedItemInfo}>
                      <Text style={styles.expandedItemName} numberOfLines={1}>{cartItem.product.name}</Text>
                      <Text style={styles.expandedItemMeta}>
                        Size: {cartItem.selectedSize} | Color: {cartItem.selectedColor.name}
                      </Text>
                      <View style={styles.expandedItemPriceRow}>
                        <Text style={styles.expandedItemPrice}>{formatPrice(cartItem.product.price)}</Text>
                        <Text style={styles.expandedItemQty}>x{cartItem.quantity}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Shipping & Payment Details */}
                {(item.shippingAddress || item.paymentMethod) && (
                  <View style={styles.orderMetaBox}>
                    {item.shippingAddress && (
                      <View style={styles.metaSection}>
                        <Text style={styles.metaTitle}>Delivery Address</Text>
                        <Text style={styles.metaText}>{item.shippingAddress.street}</Text>
                        <Text style={styles.metaText}>{item.shippingAddress.city}, {item.shippingAddress.state} {item.shippingAddress.zip}</Text>
                      </View>
                    )}
                    {item.paymentMethod && (
                      <View style={[styles.metaSection, { marginTop: 12 }]}>
                        <Text style={styles.metaTitle}>Payment Method</Text>
                        <Text style={styles.metaText}>{item.paymentMethod.cardNumber} ({item.paymentMethod.type})</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
          </View>
        }
      />
    </AnimatedSafeArea>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  listContent: { padding: 16 },
  orderCard: { backgroundColor: Colors.surfaceLight, borderRadius: 16, padding: 16, marginBottom: 12 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderDate: { fontSize: 13, color: Colors.textSecondary },
  orderItems: { fontSize: 13, color: Colors.textSecondary },
  cancelReasonBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
  cancelReasonText: { fontSize: 12, color: Colors.error, flex: 1 },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: 12 },
  orderTotal: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cancelBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#FEF2F2' },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: Colors.error },
  viewDetails: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textTertiary },
  expandedContainer: { marginTop: 16, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: Colors.border, gap: 12 },
  expandedItemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  expandedItemImage: { width: 50, height: 50, borderRadius: 8, backgroundColor: Colors.surface },
  expandedItemInfo: { flex: 1 },
  expandedItemName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  expandedItemMeta: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  expandedItemPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandedItemPrice: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  expandedItemQty: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  orderMetaBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceLight,
  },
  metaSection: {},
  metaTitle: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4, textTransform: 'uppercase' },
  metaText: { fontSize: 13, color: Colors.textSecondary, marginBottom: 2 },
});
