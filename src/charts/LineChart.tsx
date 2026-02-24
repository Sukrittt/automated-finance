import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components';
import { theme } from '../theme';

interface Props {
  values: number[];
  labels?: string[];
  title: string;
}

const CHART_HEIGHT = 96;
const CHART_INSET = 10;

function compactAxisLabel(label: string): string {
  if (label.length <= 3) {
    return label;
  }
  return label.slice(0, 3);
}

export function LineChart({ values, labels = [], title }: Props) {
  if (!values.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text tone="secondary">No trend data available.</Text>
      </View>
    );
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const points = values.map((value, idx) => {
    const xPct = (idx / (values.length - 1 || 1)) * 100;
    const y = ((value - min) / span) * (CHART_HEIGHT - CHART_INSET * 2) + CHART_INSET;
    return {
      xPct,
      y
    };
  });

  return (
    <View style={styles.wrap}>
      <Text size="caption" tone="secondary">
        {title}
      </Text>
      <View style={styles.lineWrap}>
        {points.slice(0, -1).map((point, idx) => {
          const next = points[idx + 1];

          return (
            <React.Fragment key={`segment-${idx}`}>
              <View
                style={[
                  styles.segmentHorizontal,
                  {
                    left: `${point.xPct}%`,
                    bottom: point.y,
                    width: `${Math.max(next.xPct - point.xPct, 0)}%`
                  }
                ]}
              />
              <View
                style={[
                  styles.segmentVertical,
                  {
                    left: `${next.xPct}%`,
                    bottom: Math.min(point.y, next.y),
                    height: Math.abs(next.y - point.y)
                  }
                ]}
              />
            </React.Fragment>
          );
        })}
        {points.map((point, idx) => (
          <View key={`point-${idx}`} style={[styles.point, { bottom: point.y, left: `${point.xPct}%` }]} />
        ))}
      </View>
      <View style={styles.labelRow}>
        {values.map((_, idx) => {
          const label = labels[idx] ?? `${idx + 1}`;
          return (
            <Text key={`label-${idx}`} size="micro" tone="muted" style={styles.labelText}>
              {compactAxisLabel(label)}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  lineWrap: {
    height: CHART_HEIGHT,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
    backgroundColor: theme.colors.surface
  },
  segmentHorizontal: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#121212'
  },
  segmentVertical: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#121212',
    marginLeft: -1
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: '#121212',
    position: 'absolute',
    marginLeft: -4
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  labelText: {
    flex: 1,
    textAlign: 'center'
  },
  emptyWrap: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
