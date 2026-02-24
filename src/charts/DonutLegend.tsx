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

const RING_SIZE = 128;
const RING_THICKNESS = 22;
const DOT_COUNT = 40;
const DOT_SIZE = 8;

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
      <View style={styles.ringWrap}>
        <View style={styles.ringShell}>
          {buildRingDots(slices).map((dot, idx) => {
            const angle = (idx / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
            const radius = RING_SIZE / 2 - DOT_SIZE;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.ringDot,
                  {
                    left: RING_SIZE / 2 + x - DOT_SIZE / 2,
                    top: RING_SIZE / 2 + y - DOT_SIZE / 2,
                    backgroundColor: dot
                  }
                ]}
              />
            );
          })}
          <View style={styles.ringCenter}>
            <Text size="caption" tone="muted">
              Total
            </Text>
            <Text size="h2" weight="700">
              100%
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.rows}>
        {slices.map((slice, idx) => (
          <View key={slice.label} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: toneAt(idx) }]} />
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

function toneAt(idx: number): string {
  const tones = ['#1E40AF', '#0F766E', '#B45309', '#BE123C', '#4C1D95', '#374151'];
  return tones[idx % tones.length];
}

function buildRingDots(slices: Slice[]): string[] {
  const total = slices.reduce((sum, slice) => sum + Math.max(slice.value, 0), 0);
  if (total <= 0) {
    return new Array(DOT_COUNT).fill(theme.colors.border);
  }

  const dots: string[] = [];
  let remaining = DOT_COUNT;

  slices.forEach((slice, idx) => {
    const ratio = Math.max(slice.value, 0) / total;
    const chunk = idx === slices.length - 1 ? remaining : Math.round(ratio * DOT_COUNT);
    const clamped = Math.max(0, Math.min(remaining, chunk));
    for (let i = 0; i < clamped; i += 1) {
      dots.push(toneAt(idx));
    }
    remaining -= clamped;
  });

  while (dots.length < DOT_COUNT) {
    dots.push(theme.colors.border);
  }

  return dots;
}

const styles = StyleSheet.create({
  wrap: { gap: theme.spacing.md },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringShell: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    position: 'relative'
  },
  ringDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: theme.radius.pill,
    position: 'absolute'
  },
  ringCenter: {
    position: 'absolute',
    left: RING_THICKNESS,
    top: RING_THICKNESS,
    right: RING_THICKNESS,
    bottom: RING_THICKNESS,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
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
