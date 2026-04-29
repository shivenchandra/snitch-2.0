import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCurrency } from '../../context/CurrencyContext';
import Colors from '../../constants/colors';
const MOCK_ORDERS = [
  { id: '1', date: 'Apr 28, 2026', total: 4797, status: 'Delivered', items: 3 },
  { id: '2', date: 'Apr 20, 2026', total: 1999, status: 'Shipped', items: 1 },
  { id: '3', date: 'Apr 12, 2026', total: 3398, status: 'Processing', items: 2 },
];
const statusColors: Record<string, string> = {
  Delivered: '#10B981',
  Shipped: '#3B82F6',
  Processing: '#F59E0B',
  Pending: '#6B7280',
};
export default function OrdersScreen() {
  const { formatPrice } = useCurrency();
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderTop}>
              <Text style={styles.orderId}>Order #{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
                <Text style={[styles.statusText, { color: statusColors[item.status] }]}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderDate}>{item.date}</Text>
              <Text style={styles.orderItems}>{item.items} item{item.items > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.orderBottom}>
              <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
              <TouchableOpacity><Text style={styles.viewDetails}>View Details</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
          </View>
        }
      />
    </SafeAreaView>
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
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 0.5, borderTopColor: Colors.border, paddingTop: 12 },
  orderTotal: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  viewDetails: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textTertiary },
});
