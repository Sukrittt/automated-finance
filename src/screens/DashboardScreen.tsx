import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Chip, Stat, Text } from '../components';
import { theme } from '../theme';
import { BarChart } from '../charts/BarChart';
import { DonutLegend } from '../charts/DonutLegend';
import { DashboardSummaryContract, fetchDashboardSummary } from '../services/dashboard/api';
import { TimeRange } from '../types/view-models';

const TIME_RANGE_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' }
];

const EMPTY_STATE = {
  title: 'No transactions yet',
  subtitle: 'Enable notifications and capture permissions to start seeing spend trends.',
  actionLabel: 'Check Settings'
};

function formatMoney(value: number): string {
  return `Rs ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatTrend(deltaPct: number): string {
  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct.toFixed(1)}% vs previous period`;
}

function formatDateLabel(dateISO: string): string {
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) {
    return dateISO;
  }

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function DashboardScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [state, setState] = useState<DashboardSummaryContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetchDashboardSummary(timeRange);
      setState(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard summary.';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const summary = state?.summary;
  const hasData = (summary?.transactionCount ?? 0) > 0;
  const trend = summary ? formatTrend(summary.trendDeltaPct) : null;

  const dailySpendValues = useMemo(() => state?.dailySpend.map((item) => item.amount) ?? [], [state]);
  const dailySpendLabels = useMemo(
    () => state?.dailySpend.map((item) => formatDateLabel(item.dateISO)) ?? [],
    [state]
  );
  const categorySplit = useMemo(
    () =>
      state?.categorySplit.map((item) => ({
        label: item.category,
        value: Math.round(item.sharePct)
      })) ?? [],
    [state]
  );

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Spend Summary
      </Text>
      <View style={styles.filters}>
        {TIME_RANGE_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            active={option.value === timeRange}
            onPress={() => setTimeRange(option.value)}
          />
        ))}
      </View>
      {loading ? <Text tone="secondary">Loading dashboard summary...</Text> : null}
      {loadError ? (
        <Card>
          <Text tone="secondary">{loadError}</Text>
          <View style={styles.actions}>
            <Button label="Retry" onPress={() => void loadSummary()} />
          </View>
        </Card>
      ) : null}
      {!loading && !loadError && !hasData ? (
        <Card>
          <Text weight="700">{EMPTY_STATE.title}</Text>
          <Text tone="secondary">{EMPTY_STATE.subtitle}</Text>
          <View style={styles.actions}>
            <Button label={EMPTY_STATE.actionLabel} variant="outline" />
          </View>
        </Card>
      ) : null}
      {!loading && !loadError && hasData && summary ? (
        <>
          <Card>
            <View style={styles.statRow}>
              <Stat label="Total Spend" value={formatMoney(summary.totalSpend)} hint={trend ?? undefined} />
              <Stat
                label="Transactions"
                value={String(summary.transactionCount)}
                hint={`Top: ${summary.topCategory}`}
              />
            </View>
            {summary.insightsBadge ? (
              <Text size="caption" tone="secondary" style={styles.badge}>
                {summary.insightsBadge}
              </Text>
            ) : null}
          </Card>
          <Card>
            <BarChart title="Daily spend" values={dailySpendValues} labels={dailySpendLabels} />
          </Card>
          <Card>
            <DonutLegend title="Category split" slices={categorySplit} />
          </Card>
        </>
      ) : null}
      {!loading && !loadError && state ? (
        <Text size="caption" tone="muted">
          Range: {state.fromISO} to {state.toISO}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actions: {
    marginTop: theme.spacing.md
  },
  badge: {
    marginTop: theme.spacing.sm
  }
});
