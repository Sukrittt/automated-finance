import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Chip, Stat, Text } from '../components';
import { theme } from '../theme';
import { BarChart } from '../charts/BarChart';
import { DonutLegend } from '../charts/DonutLegend';
import { LineChart } from '../charts/LineChart';
import { getMockDashboardSummary } from '../data/mock';
import { DEFAULT_CATEGORY_BUDGETS, evaluateBudgetAlerts } from '../services/budget/thresholds';
import { loadBudgetConfigs } from '../services/budget/storage';
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
const DEFAULT_BUDGETS = DEFAULT_CATEGORY_BUDGETS;

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

function formatWeekdayLabel(dateISO: string): string {
  const date = new Date(dateISO);
  if (Number.isNaN(date.getTime())) {
    return dateISO;
  }
  return date.toLocaleDateString('en-IN', { weekday: 'short' });
}

function formatBudgetLimit(value: number): string {
  return `Rs ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatRangeTitle(timeRange: TimeRange): string {
  if (timeRange === 'day') {
    return 'Day summary';
  }
  if (timeRange === 'week') {
    return 'Week summary';
  }
  return 'Month summary';
}

function formatLastUpdated(iso: string | null): string | null {
  if (!iso) {
    return null;
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function DashboardScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [state, setState] = useState<DashboardSummaryContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [budgetConfigs, setBudgetConfigs] = useState(DEFAULT_BUDGETS);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const hydrateBudgets = async () => {
      const next = await loadBudgetConfigs();
      if (mounted) {
        setBudgetConfigs(next);
      }
    };

    void hydrateBudgets();
    return () => {
      mounted = false;
    };
  }, []);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetchDashboardSummary(timeRange);
      setState(response);
      setPreviewMode(false);
      setLastUpdatedISO(new Date().toISOString());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load dashboard summary.';
      setLoadError(message);
      setState(getMockDashboardSummary(timeRange));
      setPreviewMode(true);
      setLastUpdatedISO(new Date().toISOString());
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
  const lastUpdatedLabel = formatLastUpdated(lastUpdatedISO);

  const dailySpendValues = useMemo(() => state?.dailySpend.map((item) => item.amount) ?? [], [state]);
  const dailySpendLabels = useMemo(
    () => state?.dailySpend.map((item) => formatDateLabel(item.dateISO)) ?? [],
    [state]
  );
  const trendLabels = useMemo(
    () => state?.dailySpend.map((item) => formatWeekdayLabel(item.dateISO)) ?? [],
    [state]
  );
  const categorySplit = useMemo(
    () =>
      state?.categorySplit.map((item) => ({
        label: item.category,
        value: Math.round(item.sharePct),
        amount: item.amount
      })) ?? [],
    [state]
  );
  const budgetAlerts = useMemo(
    () =>
      evaluateBudgetAlerts(
        state?.categorySplit.map((item) => ({
          category: item.category,
          spent: item.amount
        })) ?? [],
        budgetConfigs
      ),
    [budgetConfigs, state]
  );
  const topCategories = useMemo(
    () =>
      state?.categorySplit
        .slice()
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3) ?? [],
    [state]
  );

  const hasExceededBudget = budgetAlerts.some((item) => item.level === 'exceeded');

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
      {!loading && lastUpdatedLabel ? (
        <Text size="caption" tone="secondary">
          Last updated: {lastUpdatedLabel}
        </Text>
      ) : null}
      {loadError && !previewMode ? (
        <Card>
          <Text tone="secondary">{loadError}</Text>
          <View style={styles.actions}>
            <Button label="Retry live data" onPress={() => void loadSummary()} />
          </View>
        </Card>
      ) : null}
      {loadError && previewMode ? (
        <Card>
          <Text weight="700">Preview mode</Text>
          <Text size="caption" tone="secondary">
            Live dashboard data is unavailable, so you are seeing realistic demo visuals.
          </Text>
          <View style={styles.actions}>
            <Button label="Retry live data" variant="outline" onPress={() => void loadSummary()} />
          </View>
        </Card>
      ) : null}
      {!loading && !hasData ? (
        <Card>
          <Text weight="700">{EMPTY_STATE.title}</Text>
          <Text tone="secondary">{EMPTY_STATE.subtitle}</Text>
          <View style={styles.actions}>
            <Button label={EMPTY_STATE.actionLabel} variant="outline" />
          </View>
        </Card>
      ) : null}
      {!loading && hasData && summary ? (
        <>
          <Card>
            <Text size="caption" tone="secondary">
              {formatRangeTitle(timeRange)}
            </Text>
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
            <LineChart title="Spend trend" values={dailySpendValues} labels={trendLabels} />
          </Card>
          <Card>
            <DonutLegend title="Category split" slices={categorySplit} />
          </Card>
          {state.categorySplit.length ? (
            <Card>
              <Text weight="700">Category breakdown</Text>
              <Text size="caption" tone="secondary">
                Amount and share for the selected range
              </Text>
              <View style={styles.categoryRows}>
                {state.categorySplit
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .map((item) => (
                    <View key={item.category} style={styles.categoryRow}>
                      <Text size="caption" tone="secondary">
                        {item.category}
                      </Text>
                      <Text size="caption" weight="700">
                        {formatMoney(item.amount)} • {item.sharePct.toFixed(1)}%
                      </Text>
                    </View>
                  ))}
              </View>
            </Card>
          ) : null}
          {topCategories.length ? (
            <Card>
              <Text weight="700">Top categories</Text>
              <Text size="caption" tone="secondary">
                Ranked by spend amount for this range
              </Text>
              <View style={styles.categoryRows}>
                {topCategories.map((item, index) => (
                  <View key={`${item.category}-${index + 1}`} style={styles.categoryRow}>
                    <Text size="caption" tone="secondary">
                      {index + 1}. {item.category}
                    </Text>
                    <Text size="caption" weight="700">
                      {formatMoney(item.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}
          {budgetAlerts.length ? (
            <Card>
              <Text weight="700">Budget alerts</Text>
              <Text size="caption" tone="secondary">
                {hasExceededBudget
                  ? 'Heads up! A few categories crossed their monthly limits.'
                  : 'Nice pace. You are getting close to a few limits this month.'}
              </Text>
              <View style={styles.budgetRows}>
                {budgetAlerts.map((alert) => (
                  <View key={alert.category} style={styles.budgetRow}>
                    <Text size="caption" weight="600">
                      {alert.category}
                    </Text>
                    <Text size="caption" tone={alert.level === 'exceeded' ? 'negative' : 'secondary'}>
                      {alert.usagePct.toFixed(1)}% of {formatBudgetLimit(alert.monthlyLimit)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}
        </>
      ) : null}
      {!loading && state ? (
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
  },
  budgetRows: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  categoryRows: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
