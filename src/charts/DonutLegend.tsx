import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components';
import { theme } from '../theme';

interface Slice {
  label: string;
  value: number;
}

interface Props {
  slices: Slice[];
  title: string;
}

export function DonutLegend({ slices, title }: Props) {
  if (!slices.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text tone="secondary">No category split available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text size="caption" tone="secondary">
        {title}
      </Text>
      <View style={styles.rows}>
        {slices.map((slice, idx) => (
          <View key={slice.label} style={styles.row}>
            <View style={[styles.dot, dotTone(idx)]} />
            <Text size="caption" tone="secondary" style={styles.label}>
              {slice.label}
            </Text>
            <Text size="caption" weight="700">
              {slice.value}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function dotTone(idx: number) {
  const tones = ['#101010', '#3B3B3B', '#707070', '#9D9D9D'];
  return { backgroundColor: tones[idx % tones.length] };
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  rows: { gap: theme.spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  dot: { width: 10, height: 10, borderRadius: theme.radius.pill },
  label: { flex: 1 },
  emptyWrap: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
