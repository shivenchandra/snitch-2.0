import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../../constants/colors';
interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelect: (size: string) => void;
}
const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Size</Text>
      <View style={styles.sizeRow}>
        {sizes.map(size => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeButton,
              selectedSize === size && styles.sizeButtonActive,
            ]}
            onPress={() => onSelect(size)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.sizeText,
                selectedSize === size && styles.sizeTextActive,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  sizeButtonActive: {
    borderColor: Colors.textPrimary,
    backgroundColor: Colors.textPrimary,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sizeTextActive: {
    color: Colors.textWhite,
  },
});
export default SizeSelector;
