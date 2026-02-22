import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from '../components';
import { theme } from '../theme';
import { fetchWeeklyInsight, WeeklyInsightContract } from '../services/insights/api';

function getCurrentWeekStartISO(now: Date): string {
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  return weekStart.toISOString().slice(0, 10);
}

function formatMoneyFromPaise(amount: number | undefined): string | null {
  if (amount === undefined) {
    return null;
  }

  const rupees = amount / 100;
  return `Rs ${rupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function InsightsScreen() {
  const weekStartISO = useMemo(() => getCurrentWeekStartISO(new Date()), []);
  const [state, setState] = useState<WeeklyInsightContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [nextActionSeconds, setNextActionSeconds] = useState<number | null>(null);
  const projectedOverrunLabel =
    state?.status === 'ready' ? formatMoneyFromPaise(state.insight.projectedMonthlyOverrun) : null;

  const loadInsight = useCallback(async (options?: { silent?: boolean; autoRetry?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetchWeeklyInsight(weekStartISO);
      setState(response);
      setAutoRetryCount(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load weekly insight.';
      setError(message);
      if (options?.autoRetry) {
        setAutoRetryCount((current) => current + 1);
      } else {
        setAutoRetryCount(0);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [weekStartISO]);

  useEffect(() => {
    void loadInsight();
  }, [loadInsight]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (error) {
      if (autoRetryCount >= 3) {
        setNextActionSeconds(null);
        return;
      }

      const delayMs = Math.min(8000, 2000 * Math.pow(2, autoRetryCount));
      setNextActionSeconds(Math.ceil(delayMs / 1000));
      const timer = setTimeout(() => {
        void loadInsight({ silent: true, autoRetry: true });
      }, delayMs);
      return () => clearTimeout(timer);
    }

    if (state?.status === 'pending') {
      const etaSeconds = state.etaSeconds ?? 8;
      const delayMs = Math.min(45000, Math.max(5000, etaSeconds * 1000));
      setNextActionSeconds(Math.ceil(delayMs / 1000));
      const timer = setTimeout(() => {
        void loadInsight({ silent: true, autoRetry: true });
      }, delayMs);
      return () => clearTimeout(timer);
    }

    setNextActionSeconds(null);
    return;
  }, [autoRetryCount, error, loading, loadInsight, state]);

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Weekly Insights
      </Text>
      {loading ? <Text tone="secondary">Loading weekly insight...</Text> : null}
      {error ? (
        <Card>
          <Text tone="secondary">{error}</Text>
          {autoRetryCount < 3 && nextActionSeconds ? (
            <Text size="caption" tone="muted">
              Retrying in ~{nextActionSeconds}s (attempt {autoRetryCount + 1}/3)
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button
              label="Retry"
              onPress={() => {
                setAutoRetryCount(0);
                void loadInsight();
              }}
            />
          </View>
        </Card>
      ) : null}
      {!loading && !error && state?.status === 'pending' ? (
        <Card>
          <Text weight="700">Insight is being generated</Text>
          <Text tone="secondary">
            ETA: {state.etaSeconds ? `${state.etaSeconds}s` : 'Calculating...'}
          </Text>
          {nextActionSeconds ? (
            <Text size="caption" tone="muted">
              Auto-refreshing in ~{nextActionSeconds}s
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button label="Refresh" onPress={() => void loadInsight()} />
          </View>
        </Card>
      ) : null}
      {!loading && !error && state?.status === 'failed' ? (
        <Card>
          <Text weight="700">Insight unavailable</Text>
          <Text tone="secondary">Unable to generate insights for this week yet.</Text>
          <View style={styles.actions}>
            <Button label="Try again" onPress={() => void loadInsight()} />
          </View>
        </Card>
      ) : null}
      {!loading && !error && state?.status === 'ready' ? (
        <>
          <Card>
            <Text size="caption" tone="secondary">
              Summary
            </Text>
            <Text>{state.insight.summary}</Text>
          </Card>
          <Card>
            <Text size="caption" tone="secondary">
              Top Leak
            </Text>
            <Text>{state.insight.topLeak}</Text>
          </Card>
          <Card>
            <Text size="caption" tone="secondary">
              Improvement Tip
            </Text>
            <Text>{state.insight.improvementTip}</Text>
          </Card>
          {state.insight.winHighlight ? (
            <Card>
              <Text size="caption" tone="secondary">
                Win Highlight
              </Text>
              <Text>{state.insight.winHighlight}</Text>
            </Card>
          ) : null}
          {projectedOverrunLabel ? (
            <Card>
              <Text size="caption" tone="secondary">
                Projected Monthly Overrun
              </Text>
              <Text>{projectedOverrunLabel}</Text>
            </Card>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  actions: {
    marginTop: theme.spacing.md
  }
});
