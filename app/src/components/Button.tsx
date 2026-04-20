import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
};

export function Button({ label, onPress, disabled, variant = 'primary', style }: Props) {
  const isSecondary = variant === 'secondary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, isSecondary && styles.labelSecondary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: '#ff6b81' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ff6b81' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
  labelSecondary: { color: '#ff6b81' },
});
