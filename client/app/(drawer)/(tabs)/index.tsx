import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import BannerCarousel from '../../../components/home/BannerCarousel';
import CategoryGrid from '../../../components/home/CategoryGrid';
import ProductCard from '../../../components/home/ProductCard';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { PRODUCTS } from '../../../constants/products';
import { Product } from '../../../types';
import Colors from '../../../constants/colors';
import Badge from '../../../components/ui/Badge';
export default function HomeScreen() {
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const handleProductPress = useCallback((product: Product) => {
    router.push(`/product/${product.id}`);
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);
  const openDrawer = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);
  const handleCategorySelect = useCallback((categoryName: string) => {
    setActiveCategory(prev => prev === categoryName ? null : categoryName);
  }, []);
  const productData = useMemo(() => {
    if (!activeCategory) return PRODUCTS;
    return PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);
  const renderProductCard = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
        <ProductCard product={item} onPress={handleProductPress} />
      </Animated.View>
    ),
    [handleProductPress]
  );
  const keyExtractor = useCallback((item: Product) => item.id, []);
  const ListHeader = useMemo(
    () => (
      <View>
        {}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 'G'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                {user?.displayName || 'Guest'}
              </Text>
              <Text style={styles.location}>Welcome to Snitch</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/search')}
            >
              <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/(drawer)/(tabs)/cart')}
            >
              <View>
                <Ionicons name="bag-handle-outline" size={22} color={Colors.textPrimary} />
                <Badge count={getItemCount()} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {}
        <BannerCarousel />
        {}
        <CategoryGrid 
          activeCategory={activeCategory} 
          onSelectCategory={handleCategorySelect} 
        />
        {}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeCategory ? `${activeCategory}` : 'New arrivals'}
          </Text>
          <TouchableOpacity onPress={() => setActiveCategory(null)}>
            <Text style={styles.seeAll}>{activeCategory ? 'Clear Filter' : 'See all'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [user, openDrawer, activeCategory, handleCategorySelect, getItemCount]
  );
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={productData}
        renderItem={renderProductCard}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.textPrimary}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        windowSize={5}
        initialNumToRender={4}
        getItemLayout={undefined}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  userInfo: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  productRow: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 24,
  },
});
