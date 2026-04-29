import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ProductCard from '../../../components/home/ProductCard';
import { PRODUCTS, CATEGORIES } from '../../../constants/products';
import { Product } from '../../../types';
import Colors from '../../../constants/colors';
export default function CategoriesScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredProducts = useMemo(() => {
    let products = PRODUCTS;
    if (selectedCategory !== 'All') {
      products = products.filter(p => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }
    return products;
  }, [selectedCategory, searchQuery]);
  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.id}`);
  }, []);
  const categories = useMemo(
    () => ['All', ...CATEGORIES.map(c => c.name)],
    []
  );
  const renderProductCard = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <ProductCard product={item} onPress={handleProductPress} />
      </Animated.View>
    ),
    [handleProductPress]
  );
  const keyExtractor = useCallback((item: Product) => item.id, []);
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>
      {}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      {}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterTab,
                selectedCategory === item && styles.filterTabActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedCategory === item && styles.filterTabTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={5}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    marginHorizontal: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    gap: 12, // tweaked gap to force reload
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  filterContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceLight,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 24,
  },
  filterTab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
    marginBottom: -1,
  },
  filterTabActive: {
    borderColor: Colors.textPrimary,
  },
  filterTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  productRow: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});
