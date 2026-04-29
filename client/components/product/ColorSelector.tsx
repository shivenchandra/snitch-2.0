import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductColor } from '../../types';
import Colors from '../../constants/colors';
interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor;
  onSelect: (color: ProductColor) => void;
}
const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Color</Text>
      <View style={styles.colorRow}>
        {colors.map(color => {
          const isSelected = selectedColor.name === color.name;
          const isLight =
            color.hex === '#FFFFFF' || color.hex === '#F5F5F5';
          return (
            <TouchableOpacity
              key={color.name}
              style={[
                styles.colorButton,
                { backgroundColor: color.hex },
                isLight && styles.colorButtonLight,
                isSelected && styles.colorButtonSelected,
              ]}
              onPress={() => onSelect(color)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color={isLight ? Colors.textPrimary : Colors.textWhite}
                />
              )}
            </TouchableOpacity>
          );
        })}
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
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorButtonLight: {
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  colorButtonSelected: {
    borderWidth: 2.5,
    borderColor: Colors.textPrimary,
  },
});
export default ColorSelector;
