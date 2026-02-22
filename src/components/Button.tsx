import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, style }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style
      ]}
    >
      <Text size="body" weight="600" tone={variant === 'primary' ? 'primary' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  disabled: {
    opacity: 0.45
  }
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  outline: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background
  },
  ghost: {
    backgroundColor: 'transparent'
  }
});
