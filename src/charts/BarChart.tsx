import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components';
import { theme } from '../theme';

interface Props {
  values: number[];
  labels: string[];
  title: string;
}

const MAX_VISIBLE_X_LABELS = 6;
const AXIS_LABEL_MAX_CHARS = 6;

function getAxisLabelStep(labelCount: number): number {
  if (labelCount <= 1) {
    return 1;
  }

  return Math.ceil(labelCount / MAX_VISIBLE_X_LABELS);
}

function shouldShowAxisLabel(index: number, labelCount: number, step: number): boolean {
  if (labelCount <= MAX_VISIBLE_X_LABELS) {
    return true;
  }

  if (index === 0 || index === labelCount - 1) {
    return true;
  }

  return index % step === 0;
}

function compactAxisLabel(label: string): string {
  if (label.length <= AXIS_LABEL_MAX_CHARS) {
    return label;
  }

  return `${label.slice(0, AXIS_LABEL_MAX_CHARS - 1)}…`;
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
  const labelCount = Math.max(labels.length, values.length);
  const step = getAxisLabelStep(labelCount);

  return (
    <View style={styles.wrap}>
      <Text size="caption" tone="secondary">
        {title}
      </Text>
      <View style={styles.row}>
        {values.map((value, idx) => {
          const rawLabel = labels[idx] ?? `${idx + 1}`;
          const showLabel = shouldShowAxisLabel(idx, labelCount, step);

          return (
            <View key={`${rawLabel}-${idx}`} style={styles.barCol}>
              <View style={[styles.bar, { height: (value / max) * 120 + 6 }]} />
              <View style={styles.labelSlot}>
                {showLabel ? (
                  <Text
                    size="micro"
                    tone="muted"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    style={styles.labelText}
                  >
                    {compactAxisLabel(rawLabel)}
                  </Text>
                ) : (
                  <View style={styles.hiddenLabelSpacer} />
                )}
              </View>
            </View>
          );
        })}
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
  labelSlot: {
    width: '100%',
    minHeight: theme.typography.micro + 2,
    justifyContent: 'center'
  },
  labelText: {
    textAlign: 'center'
  },
  hiddenLabelSpacer: {
    height: theme.typography.micro + 2
  },
  emptyWrap: {
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
