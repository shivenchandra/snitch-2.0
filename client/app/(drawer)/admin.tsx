import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
  fetchProductsFromDB,
  addProductToDB,
  deleteProductFromDB,
  seedProducts,
} from '../../services/productService';
import { getAllOrders, updateOrderStatus } from '../../services/orderService';
import { PRODUCTS } from '../../constants/products';
import { Product, Order } from '../../types';
import Colors from '../../constants/colors';
import { useCurrency } from '../../context/CurrencyContext';
type Tab = 'products' | 'add' | 'orders';

const statusColors: Record<string, string> = {
  Delivered: '#10B981',
  Shipped: '#3B82F6',
  Processing: '#F59E0B',
  Pending: '#6B7280',
  Cancelled: '#EF4444',
};

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const { formatPrice } = useCurrency();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Clothing');
  const [imageUrl, setImageUrl] = useState('');
  const [material, setMaterial] = useState('');
  const [sizes, setSizes] = useState('S, M, L, XL');
  const [isSale, setIsSale] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const categories = ['Clothing', 'Shoes', 'Bags', 'Hats', 'Watches', 'Sunglasses'];
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsData, ordersData] = await Promise.all([
        fetchProductsFromDB(),
        getAllOrders()
      ]);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  const handleSeedData = useCallback(async () => {
    Alert.alert(
      'Seed Products',
      'This will upload all mock products to Firestore. Continue?',
      [
        { text: 'Cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            setLoading(true);
            try {
              const productsWithoutId = PRODUCTS.map(({ id, ...rest }) => rest);
              await seedProducts(productsWithoutId);
              await loadData();
              Alert.alert('Success', 'Mock products uploaded to Firestore!');
            } catch (err) {
              Alert.alert('Error', 'Failed to seed products');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, [loadData]);
  const handleAddProduct = useCallback(async () => {
    if (!name.trim() || !price.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please fill in name, price, and description');
      return;
    }
    setSaving(true);
    try {
      const sizeArray = sizes.split(',').map(s => s.trim()).filter(Boolean);
      const newProduct: Omit<Product, 'id'> = {
        name: name.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        description: description.trim(),
        category,
        image: imageUrl.trim() || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        sizes: sizeArray.length > 0 ? sizeArray : ['M'],
        colors: [{ name: 'Black', hex: '#111111' }, { name: 'White', hex: '#FFFFFF' }],
        material: material.trim() || undefined,
        isSale: isSale,
        isNew: isNew,
        rating: 4.5,
      };
      await addProductToDB(newProduct);
      Alert.alert('Success! 🎉', `"${name}" has been added.`);
      setName('');
      setPrice('');
      setOriginalPrice('');
      setDescription('');
      setImageUrl('');
      setMaterial('');
      setSizes('S, M, L, XL');
      setIsSale(false);
      setIsNew(false);
      setActiveTab('products');
      await loadData();
    } catch (err) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setSaving(false);
    }
  }, [name, price, originalPrice, description, category, imageUrl, material, sizes, isSale, isNew, loadData]);
  const handleDelete = useCallback(
    (product: Product) => {
      Alert.alert('Delete Product', `Delete "${product.name}"?`, [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProductFromDB(product.id);
              await loadData();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]);
    },
    [loadData]
  );
  const handleUpdateOrderStatus = useCallback((orderId: string, currentStatus: string) => {
    Alert.alert('Update Status', `Current status is ${currentStatus}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Processing', onPress: async () => { await updateOrderStatus(orderId, 'Processing'); loadData(); } },
      { text: 'Shipped', onPress: async () => { await updateOrderStatus(orderId, 'Shipped'); loadData(); } },
      { text: 'Delivered', onPress: async () => { await updateOrderStatus(orderId, 'Delivered'); loadData(); } },
      { text: 'Cancel Order', style: 'destructive', onPress: () => { setOrderToCancel(orderId); setCancelModalVisible(true); } },
    ]);
  }, [loadData]);

  const submitCancelOrder = useCallback(async () => {
    if (!orderToCancel) return;
    if (!cancelReason.trim()) {
      Alert.alert('Reason Required', 'You must provide a reason for cancellation.');
      return;
    }
    setSaving(true);
    try {
      await updateOrderStatus(orderToCancel, 'Cancelled', cancelReason.trim());
      setCancelModalVisible(false);
      setCancelReason('');
      setOrderToCancel(null);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel order.');
    } finally {
      setSaving(false);
    }
  }, [orderToCancel, cancelReason, loadData]);

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.productItem}>
        <Image source={{ uri: item.image }} style={styles.productThumb} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    ),
    [handleDelete, formatPrice]
  );

  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderId}>Order #{item.id.slice(0,8).toUpperCase()}</Text>
            <Text style={styles.orderCustomer}>{item.customerName} ({item.userEmail})</Text>
          </View>
          <TouchableOpacity 
            style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}
            onPress={() => handleUpdateOrderStatus(item.id, item.status)}
          >
            <Text style={[styles.statusText, { color: statusColors[item.status] }]}>{item.status} ▾</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.orderDetails}>
          <Text style={styles.orderDate}>{item.date}</Text>
          <Text style={styles.orderItems}>{item.items?.length || 0} items • {formatPrice(item.total)}</Text>
        </View>
        {item.status === 'Cancelled' && item.cancelReason && (
          <View style={styles.cancelReasonBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.error} />
            <Text style={styles.cancelReasonText}>{item.cancelReason}</Text>
          </View>
        )}
      </View>
    ),
    [formatPrice, handleUpdateOrderStatus]
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleSeedData} style={styles.seedBtn}>
          <Ionicons name="cloud-upload-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
      {}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons name="list-outline" size={18} color={activeTab === 'products' ? Colors.textWhite : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons name="receipt-outline" size={18} color={activeTab === 'orders' ? Colors.textWhite : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.tabActive]}
          onPress={() => setActiveTab('add')}
        >
          <Ionicons name="add-circle-outline" size={18} color={activeTab === 'add' ? Colors.textWhite : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>Add Product</Text>
        </TouchableOpacity>
      </View>
      {}
      {activeTab === 'products' ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.textPrimary} />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No products in Firestore</Text>
            <Text style={styles.emptySub}>Tap the cloud icon to seed mock data, or add products manually</Text>
          </View>
        )
      ) : activeTab === 'orders' ? (
        loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.textPrimary} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {}
            <Text style={styles.label}>Product Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Classic Black T-shirt" placeholderTextColor={Colors.textTertiary} value={name} onChangeText={setName} />
            {}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Price (₹) *</Text>
                <TextInput style={styles.input} placeholder="1299" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={price} onChangeText={setPrice} />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Original Price (₹)</Text>
                <TextInput style={styles.input} placeholder="1799" placeholderTextColor={Colors.textTertiary} keyboardType="numeric" value={originalPrice} onChangeText={setOriginalPrice} />
              </View>
            </View>
            {}
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Product description..." placeholderTextColor={Colors.textTertiary} multiline numberOfLines={3} value={description} onChangeText={setDescription} />
            {}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, category === cat && styles.categoryPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryPillText, category === cat && styles.categoryPillTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {}
            <Text style={styles.label}>Image URL</Text>
            <TextInput style={styles.input} placeholder="https://..." placeholderTextColor={Colors.textTertiary} value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
            {}
            <Text style={styles.label}>Material</Text>
            <TextInput style={styles.input} placeholder="e.g. Cotton, Polyester" placeholderTextColor={Colors.textTertiary} value={material} onChangeText={setMaterial} />
            {}
            <Text style={styles.label}>Sizes (comma separated)</Text>
            <TextInput style={styles.input} placeholder="S, M, L, XL" placeholderTextColor={Colors.textTertiary} value={sizes} onChangeText={setSizes} />
            {}
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleBtn, isSale && styles.toggleActive]} onPress={() => setIsSale(!isSale)}>
                <Text style={[styles.toggleText, isSale && styles.toggleTextActive]}>🏷️ On Sale</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, isNew && styles.toggleActive]} onPress={() => setIsNew(!isNew)}>
                <Text style={[styles.toggleText, isNew && styles.toggleTextActive]}>✨ New Arrival</Text>
              </TouchableOpacity>
            </View>
            {}
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct} disabled={saving} activeOpacity={0.9}>
              {saving ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.submitText}>Add Product</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Cancel Reason Modal */}
      <Modal visible={cancelModalVisible} transparent={true} animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <Text style={styles.modalSub}>Please provide a reason for cancelling this order.</Text>
            <TextInput
              style={[styles.input, styles.modalInput]}
              placeholder="e.g. Out of stock, Customer requested"
              placeholderTextColor={Colors.textTertiary}
              value={cancelReason}
              onChangeText={setCancelReason}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setCancelModalVisible(false); setCancelReason(''); }}>
                <Text style={styles.modalCancelText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={submitCancelOrder} disabled={saving}>
                {saving ? <ActivityIndicator color={Colors.textWhite} size="small" /> : <Text style={styles.modalSubmitText}>Confirm Cancel</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  seedBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, backgroundColor: Colors.surfaceLight },
  tabActive: { backgroundColor: Colors.textPrimary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.textWhite },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: Colors.textSecondary },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  productItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: 14, padding: 12, marginBottom: 10 },
  productThumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: Colors.border },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  productCategory: { fontSize: 12, color: Colors.textTertiary, marginBottom: 2 },
  productPrice: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  deleteBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  formContent: { paddingHorizontal: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.3 },
  input: { backgroundColor: Colors.surfaceLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.textPrimary },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  categoryScroll: { marginBottom: 4 },
  categoryPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.surfaceLight, marginRight: 8 },
  categoryPillActive: { backgroundColor: Colors.textPrimary },
  categoryPillText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  categoryPillTextActive: { color: Colors.textWhite },
  toggleRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  toggleBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: Colors.surfaceLight, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  toggleActive: { borderColor: Colors.textPrimary, backgroundColor: '#F0F0FF' },
  toggleText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  toggleTextActive: { color: Colors.textPrimary },
  submitBtn: { marginTop: 24, backgroundColor: Colors.textPrimary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '700', color: Colors.textWhite },
  orderCard: { backgroundColor: Colors.surfaceLight, borderRadius: 16, padding: 16, marginBottom: 12 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  orderCustomer: { fontSize: 12, color: Colors.textSecondary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  orderDate: { fontSize: 13, color: Colors.textSecondary },
  orderItems: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  cancelReasonBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginTop: 10, gap: 6 },
  cancelReasonText: { fontSize: 12, color: Colors.error, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: Colors.surface, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 8 },
  modalSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  modalInput: { backgroundColor: Colors.surfaceLight, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  modalSubmitBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.error, alignItems: 'center' },
  modalSubmitText: { fontSize: 15, fontWeight: '600', color: Colors.textWhite },
});
