import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';

export interface MissionCardProps {
  title: string;
  description?: string;
  progress: number;
  target: number;
  completed?: boolean;
}

export function MissionCard({
  title,
  description,
  progress,
  target,
  completed = false
}: MissionCardProps) {
  const safeTarget = Math.max(target, 1);
  const ratio = Math.min(1, Math.max(0, progress / safeTarget));
  const progressPct = Math.round(ratio * 100);

  return (
    <View style={[styles.card, completed ? styles.completedCard : null]}>
      <View style={styles.headerRow}>
        <Text weight="700">{title}</Text>
        <Text size="caption" tone={completed ? 'positive' : 'secondary'} weight="700">
          {completed ? 'Done' : `${progress}/${safeTarget}`}
        </Text>
      </View>
      {description ? (
        <Text size="caption" tone="secondary">
          {description}
        </Text>
      ) : null}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.cardLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.soft
  },
  completedCard: {
    borderColor: theme.colors.success500,
    backgroundColor: theme.colors.primary100
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary500
  }
});
