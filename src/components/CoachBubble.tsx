import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';

export interface CoachBubbleProps {
  message: string;
  mood?: 'happy' | 'neutral' | 'focus';
}

function getEmoji(mood: NonNullable<CoachBubbleProps['mood']>): string {
  if (mood === 'happy') {
    return '😄';
  }
  if (mood === 'focus') {
    return '🧐';
  }
  return '🙂';
}

export function CoachBubble({ message, mood = 'happy' }: CoachBubbleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text size="caption">{getEmoji(mood)}</Text>
      </View>
      <View style={styles.bubble}>
        <Text size="caption" weight="600">
          Money Buddy
        </Text>
        <Text size="caption" tone="secondary">
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary100,
    borderWidth: 1,
    borderColor: theme.colors.primary500
  },
  bubble: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgElevated,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs
  }
});
