import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '../../constants/colors';
interface BadgeProps {
  count: number;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}
const Badge: React.FC<BadgeProps> = ({ count, size = 'small', style }) => {
  if (count <= 0) return null;
  return (
    <View style={[styles.badge, styles[size], style]}>
      <Text style={[styles.text, size === 'small' ? styles.textSmall : styles.textMedium]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.textPrimary,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  small: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    top: -6,
    right: -8,
  },
  medium: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    top: -8,
    right: -10,
  },
  text: {
    color: Colors.textWhite,
    fontWeight: '700',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
});
export default Badge;
