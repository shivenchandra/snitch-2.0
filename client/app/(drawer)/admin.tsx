// ==========================================
// Snitch 2.0 — Admin Dashboard
// Add, view, and delete products via Firestore
// ==========================================

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  fetchProductsFromDB,
  addProductToDB,
  deleteProductFromDB,
  seedProducts,
} from '../../services/productService';
import { PRODUCTS } from '../../constants/products';
import { Product } from '../../types';
import Colors from '../../constants/colors';
import { useCurrency } from '../../context/CurrencyContext';

type Tab = 'products' | 'add';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { formatPrice } = useCurrency();

  // Form state
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

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProductsFromDB();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Seed mock data to Firestore
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
              await loadProducts();
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
  }, [loadProducts]);

  // Add product
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

      // Reset form
      setName('');
      setPrice('');
      setOriginalPrice('');
      setDescription('');
      setImageUrl('');
      setMaterial('');
      setSizes('S, M, L, XL');
      setIsSale(false);
      setIsNew(false);

      // Switch to products tab and refresh
      setActiveTab('products');
      await loadProducts();
    } catch (err) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setSaving(false);
    }
  }, [name, price, originalPrice, description, category, imageUrl, material, sizes, isSale, isNew, loadProducts]);

  // Delete product
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
              await loadProducts();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]);
    },
    [loadProducts]
  );

  // Render product item in admin list
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <TouchableOpacity onPress={handleSeedData} style={styles.seedBtn}>
          <Ionicons name="cloud-upload-outline" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Ionicons name="list-outline" size={18} color={activeTab === 'products' ? Colors.textWhite : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
            Products ({products.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.tabActive]}
          onPress={() => setActiveTab('add')}
        >
          <Ionicons name="add-circle-outline" size={18} color={activeTab === 'add' ? Colors.textWhite : Colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
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
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Product Name */}
            <Text style={styles.label}>Product Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Classic Black T-shirt" placeholderTextColor={Colors.textTertiary} value={name} onChangeText={setName} />

            {/* Price Row */}
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

            {/* Description */}
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Product description..." placeholderTextColor={Colors.textTertiary} multiline numberOfLines={3} value={description} onChangeText={setDescription} />

            {/* Category */}
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

            {/* Image URL */}
            <Text style={styles.label}>Image URL</Text>
            <TextInput style={styles.input} placeholder="https://..." placeholderTextColor={Colors.textTertiary} value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />

            {/* Material */}
            <Text style={styles.label}>Material</Text>
            <TextInput style={styles.input} placeholder="e.g. Cotton, Polyester" placeholderTextColor={Colors.textTertiary} value={material} onChangeText={setMaterial} />

            {/* Sizes */}
            <Text style={styles.label}>Sizes (comma separated)</Text>
            <TextInput style={styles.input} placeholder="S, M, L, XL" placeholderTextColor={Colors.textTertiary} value={sizes} onChangeText={setSizes} />

            {/* Toggles */}
            <View style={styles.toggleRow}>
              <TouchableOpacity style={[styles.toggleBtn, isSale && styles.toggleActive]} onPress={() => setIsSale(!isSale)}>
                <Text style={[styles.toggleText, isSale && styles.toggleTextActive]}>🏷️ On Sale</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.toggleBtn, isNew && styles.toggleActive]} onPress={() => setIsNew(!isNew)}>
                <Text style={[styles.toggleText, isNew && styles.toggleTextActive]}>✨ New Arrival</Text>
              </TouchableOpacity>
            </View>

            {/* Submit */}
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
});
