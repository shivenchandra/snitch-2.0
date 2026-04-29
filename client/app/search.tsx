import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useProducts } from '../hooks/useProducts';
import { useCurrency } from '../context/CurrencyContext';
import Colors from '../constants/colors';
import { Product } from '../types';
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { products, loading } = useProducts();
  const { formatPrice } = useCurrency();
  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const searchTerm = query.toLowerCase().trim();
    return products.filter((product) => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      (product.description && product.description.toLowerCase().includes(searchTerm))
    );
  }, [query, products]);
  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <TouchableOpacity 
        style={styles.productItem}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(item.originalPrice)}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>
    </Animated.View>
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search for clothes, shoes, bags..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
          />
          {query.length > 0 && Platform.OS === 'android' && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.content}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.textPrimary} />
          </View>
        ) : query.trim() === '' ? (
          <Animated.View entering={FadeIn} style={styles.centerContainer}>
            <Ionicons name="search-outline" size={64} color={Colors.surfaceLight} />
            <Text style={styles.emptyTitle}>Find what you love</Text>
            <Text style={styles.emptySub}>Search through our premium collection</Text>
          </Animated.View>
        ) : filteredProducts.length > 0 ? (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                Found {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
              </Text>
            }
          />
        ) : (
          <Animated.View entering={FadeIn} style={styles.centerContainer}>
            <Ionicons name="sad-outline" size={64} color={Colors.surfaceLight} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySub}>We couldn't find anything matching "{query}"</Text>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.textPrimary,
  },
  clearBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: -40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 16,
    marginTop: 8,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  originalPrice: {
    fontSize: 13,
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
});
