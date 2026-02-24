import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';
import { triggerLightHaptic } from '../services/feedback/playful';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', disabled = false, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) {
      return;
    }
    Animated.timing(scale, {
      toValue: 0.97,
      duration: theme.motion.fast,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) {
      return;
    }
    Animated.spring(scale, {
      toValue: 1,
      speed: 25,
      bounciness: 9,
      useNativeDriver: true
    }).start();
  };

  const handlePress = () => {
    if (disabled) {
      return;
    }
    triggerLightHaptic();
    onPress?.();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.base,
          variantStyles[variant],
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled
        ]}
      >
        <Text size="body" weight="600" tone={variant === 'primary' ? 'primary' : 'secondary'}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
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
    opacity: 0.88
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
