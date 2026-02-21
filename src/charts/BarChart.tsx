import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components';
import { theme } from '../theme';

interface Props {
  values: number[];
  labels: string[];
  title: string;
}

export function BarChart({ values, labels, title }: Props) {
  if (!values.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text tone="secondary">Not enough data yet.</Text>
      </View>
    );
  }

  const max = Math.max(...values, 1);
  return (
    <View style={styles.wrap}>
      <Text size="caption" tone="secondary">
        {title}
      </Text>
      <View style={styles.row}>
        {values.map((value, idx) => (
          <View key={labels[idx]} style={styles.barCol}>
            <View style={[styles.bar, { height: (value / max) * 120 + 6 }]} />
            <Text size="micro" tone="muted">
              {labels[idx]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: theme.spacing.sm
  },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  bar: {
    width: '100%',
    backgroundColor: '#171717',
    borderRadius: theme.radius.sm
  },
  emptyWrap: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
