import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components';
import { theme } from '../theme';

interface Props {
  values: number[];
  title: string;
}

export function LineChart({ values, title }: Props) {
  if (!values.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text tone="secondary">No trend data available.</Text>
      </View>
    );
  }

  const max = Math.max(...values, 1);
  return (
    <View style={styles.wrap}>
      <Text size="caption" tone="secondary">
        {title}
      </Text>
      <View style={styles.lineWrap}>
        {values.map((value, idx) => (
          <View
            key={idx}
            style={[styles.point, { bottom: (value / max) * 76 + 6, left: `${(idx / (values.length - 1 || 1)) * 100}%` }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  lineWrap: {
    height: 96,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    backgroundColor: theme.colors.surface
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: '#121212',
    position: 'absolute',
    marginLeft: -4
  },
  emptyWrap: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
