import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import SizeSelector from '../../components/product/SizeSelector';
import ColorSelector from '../../components/product/ColorSelector';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';
import { PRODUCTS } from '../../constants/products';
import Colors from '../../constants/colors';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const product = PRODUCTS.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || { name: '', hex: '' });
  const { isFavorite, toggleFavorite } = useWishlist();
  const isFav = product ? isFavorite(product.id) : false;
  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart(product, selectedSize, selectedColor);
    Alert.alert('Added to Cart! 🛍️', `${product.name} has been added.`);
  }, [product, selectedSize, selectedColor, addToCart]);
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>Product not found</Text>
      </SafeAreaView>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <SafeAreaView style={styles.imageOverlay} edges={['top']}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => { if(product) toggleFavorite(product.id) }}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? Colors.favorite : Colors.textPrimary} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
      <ScrollView style={styles.detailsContainer} contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </Animated.View>
        {product.material && (
          <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.infoRow}>
            {product.material && (
              <View style={styles.infoChip}>
                <Ionicons name="leaf-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{product.material}</Text>
              </View>
            )}
            {product.length && (
              <View style={styles.infoChip}>
                <Ionicons name="resize-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{product.length}</Text>
              </View>
            )}
            {product.season && (
              <View style={styles.infoChip}>
                <Ionicons name="sunny-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{product.season}</Text>
              </View>
            )}
          </Animated.View>
        )}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <SizeSelector sizes={product.sizes} selectedSize={selectedSize} onSelect={setSelectedSize} />
          <ColorSelector colors={product.colors} selectedColor={selectedColor} onSelect={setSelectedColor} />
        </Animated.View>
      </ScrollView>
      <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.footer}>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart} activeOpacity={0.9}>
          <Text style={styles.addToCartText}>Add to cart</Text>
          <Text style={styles.addToCartPrice}>{formatPrice(product.price)}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  imageContainer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.15, backgroundColor: Colors.surfaceLight },
  image: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  navButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  detailsContainer: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, backgroundColor: Colors.surface },
  detailsContent: { padding: 24, paddingBottom: 100 },
  productName: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.5 },
  description: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.surfaceLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  infoText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32, backgroundColor: Colors.surface, borderTopWidth: 0.5, borderTopColor: Colors.border },
  addToCartButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.textPrimary, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 24 },
  addToCartText: { fontSize: 16, fontWeight: '600', color: Colors.textWhite },
  addToCartPrice: { fontSize: 16, fontWeight: '700', color: Colors.textWhite },
});
