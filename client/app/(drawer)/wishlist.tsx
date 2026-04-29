import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useWishlist } from '../../context/WishlistContext';
import { PRODUCTS } from '../../constants/products';
import ProductCard from '../../components/home/ProductCard';
import { Product } from '../../types';
import Colors from '../../constants/colors';

const AnimatedSafeArea = Animated.createAnimatedComponent(SafeAreaView);

export default function WishlistScreen() {
  const { favorites } = useWishlist();

  const favoriteProducts = useMemo(() => {
    return PRODUCTS.filter(p => favorites.includes(p.id));
  }, [favorites]);

  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.id}`);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <ProductCard product={item} onPress={handleProductPress} />
    </Animated.View>
  ), [handleProductPress]);

  return (
    <AnimatedSafeArea style={styles.container} entering={FadeInRight.duration(400)}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Wishlist</Text>
        <View style={{ width: 40 }} />
      </View>

      {favoriteProducts.length === 0 ? (
        <View style={styles.content}>
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptySub}>
              Save items you love to your wishlist to easily find them later.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(drawer)/(tabs)/categories')}
            >
              <Text style={styles.exploreBtnText}>Explore Products</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={favoriteProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
        />
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
  content: { flex: 1, padding: 16 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreBtn: {
    marginTop: 24,
    backgroundColor: Colors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
  },
  exploreBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  productRow: {
    justifyContent: 'space-between',
  },
});
