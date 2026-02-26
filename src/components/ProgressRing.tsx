import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';

export interface ProgressRingProps {
  progress: number;
  total: number;
  label?: string;
  size?: number;
}

export function ProgressRing({ progress, total, label = 'Progress', size = 88 }: ProgressRingProps) {
  const safeTotal = Math.max(total, 1);
  const pct = Math.round(Math.min(100, Math.max(0, (progress / safeTotal) * 100)));
  const ringBorder = Math.max(6, Math.round(size * 0.1));

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: ringBorder,
            borderColor: theme.colors.primary500
          }
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              borderRadius: (size - ringBorder * 2) / 2
            }
          ]}
        >
          <Text weight="700">{pct}%</Text>
        </View>
      </View>
      <Text size="micro" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary100
  },
  inner: {
    width: '72%',
    height: '72%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bgElevated
  }
});
