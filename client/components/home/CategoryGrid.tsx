// ==========================================
// Snitch 2.0 — Category Grid
// Horizontal scrollable category icons
// ==========================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../../constants/products';
import Colors from '../../constants/colors';

interface CategoryGridProps {
  activeCategory: string | null;
  onSelectCategory: (categoryName: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => onSelectCategory(category.name)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              activeCategory === category.name && styles.iconContainerActive
            ]}>
              <Ionicons
                name={category.icon as any}
                size={26}
                color={activeCategory === category.name ? Colors.textWhite : Colors.textPrimary}
              />
            </View>
            <Text style={[
              styles.categoryName,
              activeCategory === category.name && styles.categoryNameActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainerActive: {
    backgroundColor: Colors.textPrimary,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryNameActive: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});

export default CategoryGrid;
