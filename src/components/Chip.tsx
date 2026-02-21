import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { theme } from '../theme';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function Chip({ label, active = false, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.base, active && styles.active]}>
      <Text size="caption" weight="600" tone={active ? 'primary' : 'secondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background
  },
  active: {
    backgroundColor: '#F3F3F3'
  }
});
