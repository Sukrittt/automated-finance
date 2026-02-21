import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Stat, Text } from '../components';
import { theme } from '../theme';
import { mockDonut, mockTrend } from '../data/mock';
import { BarChart } from '../charts/BarChart';
import { DonutLegend } from '../charts/DonutLegend';

export function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        This week
      </Text>
      <Card>
        <View style={styles.statRow}>
          <Stat label="Total Spend" value="Rs 12,930" hint="+18% vs last week" />
          <Stat label="Transactions" value="46" hint="4 need review" />
        </View>
      </Card>
      <Card>
        <BarChart
          title="Daily spend"
          values={mockTrend}
          labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
        />
      </Card>
      <Card>
        <DonutLegend title="Category split" slices={mockDonut} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
