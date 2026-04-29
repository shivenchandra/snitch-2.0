import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import Colors from '../../constants/colors';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}
const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ product, onPress }) => {
    const [isFavorite, setIsFavorite] = React.useState(false);
    const { formatPrice } = useCurrency();
    const handleFavorite = useCallback(() => {
      setIsFavorite(prev => !prev);
    }, []);
    const handlePress = useCallback(() => {
      onPress(product);
    }, [product, onPress]);
    return (
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          <TouchableOpacity style={styles.favoriteButton} onPress={handleFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? Colors.favorite : Colors.textSecondary} />
          </TouchableOpacity>
          {product.isSale && (
            <View style={styles.saleBadge}><Text style={styles.saleBadgeText}>Sale</Text></View>
          )}
          {product.isNew && !product.isSale && (
            <View style={[styles.saleBadge, styles.newBadge]}><Text style={[styles.saleBadgeText, styles.newBadgeText]}>New</Text></View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>{formatPrice(product.originalPrice)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => prevProps.product.id === nextProps.product.id
);
const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, marginBottom: 16, borderRadius: 16, backgroundColor: Colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  imageContainer: { width: '100%', height: CARD_WIDTH * 1.2, borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden', backgroundColor: Colors.surfaceLight },
  image: { width: '100%', height: '100%' },
  favoriteButton: { position: 'absolute', top: 10, right: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  saleBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  saleBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.sale },
  newBadge: { backgroundColor: Colors.textPrimary },
  newBadgeText: { color: Colors.textWhite },
  info: { padding: 12 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 4, letterSpacing: 0.1 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  originalPrice: { fontSize: 13, color: Colors.textTertiary, textDecorationLine: 'line-through' },
});
export default ProductCard;
