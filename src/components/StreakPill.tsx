import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';

export interface StreakPillProps {
  days: number;
  label?: string;
  tone?: 'default' | 'active';
}

export function StreakPill({ days, label = 'day streak', tone = 'active' }: StreakPillProps) {
  return (
    <View style={[styles.base, tone === 'active' ? styles.active : styles.default]}>
      <Text size="caption" weight="700" style={styles.emoji}>
        🔥
      </Text>
      <Text size="caption" weight="700" tone="primary">
        {days} {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  active: {
    backgroundColor: theme.colors.primary100,
    borderColor: theme.colors.primary500
  },
  default: {
    backgroundColor: theme.colors.bgElevated,
    borderColor: theme.colors.border
  },
  emoji: {
    lineHeight: theme.typography.lineHeight.caption
  }
});
