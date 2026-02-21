import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from '../components';
import { theme } from '../theme';
import { mockInsights, mockTrend } from '../data/mock';
import { LineChart } from '../charts/LineChart';

export function InsightsScreen() {
  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Weekly Insights
      </Text>
      <Card>
        <Text size="caption" tone="secondary">
          Summary
        </Text>
        <Text>{mockInsights.summary}</Text>
      </Card>
      <Card>
        <Text size="caption" tone="secondary">
          Top Leak
        </Text>
        <Text>{mockInsights.topLeak}</Text>
      </Card>
      <Card>
        <LineChart title="7-day spend pulse" values={mockTrend} />
      </Card>
      <Card>
        <Text size="caption" tone="secondary">
          Improvement Tip
        </Text>
        <Text>{mockInsights.improvementTip}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  }
});
