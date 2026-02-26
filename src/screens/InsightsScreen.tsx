import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, CoachBubble, MissionCard, Text } from '../components';
import { theme } from '../theme';
import { fetchWeeklyInsight, WeeklyInsightContract } from '../services/insights/api';
import { fetchDashboardSummary } from '../services/dashboard/api';
import { getMockDashboardSummary, mockInsights } from '../data/mock';

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

function formatGeneratedAt(iso: string | undefined): string | null {
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

interface Props {
  playfulEnabled?: boolean;
}

export function InsightsScreen({ playfulEnabled = true }: Props) {
  const weekStartISO = useMemo(() => getCurrentWeekStartISO(new Date()), []);
  const [state, setState] = useState<WeeklyInsightContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRetryCount, setAutoRetryCount] = useState(0);
  const [nextActionSeconds, setNextActionSeconds] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [topCategories, setTopCategories] = useState<Array<{ category: string; amount: number }>>([]);
  const projectedOverrunLabel =
    state?.status === 'ready' ? formatMoneyFromPaise(state.insight.projectedMonthlyOverrun) : null;
  const generatedAtLabel = state?.status === 'ready' ? formatGeneratedAt(state.generatedAtISO) : null;
  const insightMissionProgress = state?.status === 'ready' ? 1 : 0;
  const insightMissionTarget = 1;

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
      setPreviewMode(false);
    } catch (err) {
      setError(null);
      setState({
        status: 'ready',
        weekStartISO,
        generatedAtISO: new Date().toISOString(),
        insight: {
          ...mockInsights,
          weekStartISO
        }
      });
      setAutoRetryCount(0);
      setPreviewMode(true);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [weekStartISO]);

  const loadTopCategories = useCallback(async () => {
    try {
      const dashboard = await fetchDashboardSummary('week');
      const ranked = dashboard.categorySplit
        .slice()
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map((item) => ({
          category: item.category,
          amount: item.amount
        }));

      setTopCategories(ranked);
    } catch {
      const mockSummary = getMockDashboardSummary('week');
      const ranked = mockSummary.categorySplit
        .slice()
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)
        .map((item) => ({
          category: item.category,
          amount: item.amount
        }));
      setTopCategories(ranked);
    }
  }, []);

  useEffect(() => {
    void loadInsight();
    void loadTopCategories();
  }, [loadInsight, loadTopCategories]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (error && !previewMode) {
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
  }, [autoRetryCount, error, loading, loadInsight, previewMode, state]);

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Weekly Insights
      </Text>
      {loading ? <Text tone="secondary">Loading weekly insight...</Text> : null}
      {error && !previewMode ? (
        <Card>
          <Text tone="secondary">{error}</Text>
          {autoRetryCount < 3 && nextActionSeconds ? (
            <Text size="caption" tone="muted">
              Retrying in ~{nextActionSeconds}s (attempt {autoRetryCount + 1}/3)
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button
              label="Retry live data"
              onPress={() => {
                setAutoRetryCount(0);
                void loadInsight();
                void loadTopCategories();
              }}
            />
          </View>
        </Card>
      ) : null}
      {previewMode ? (
        <Card>
          <Text weight="700">Preview mode</Text>
          <Text size="caption" tone="secondary">
            Live insight service is unavailable, so demo insights are shown.
          </Text>
          <View style={styles.actions}>
            <Button
              label="Retry live data"
              variant="outline"
              onPress={() => {
                setAutoRetryCount(0);
                void loadInsight();
                void loadTopCategories();
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
          {generatedAtLabel ? (
            <Text size="caption" tone="secondary">
              Last updated: {generatedAtLabel}
            </Text>
          ) : null}
          {playfulEnabled ? (
            <Card>
              <Text size="caption" tone="secondary">
                Weekly Story
              </Text>
              <CoachBubble
                mood="happy"
                message="Your weekly summary is ready. Take one action now to make next week easier."
              />
            </Card>
          ) : null}
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
          {playfulEnabled ? (
            <>
              <MissionCard
                title="Next Action"
                description={state.insight.improvementTip}
                progress={insightMissionProgress}
                target={insightMissionTarget}
                completed={insightMissionProgress >= insightMissionTarget}
              />
              <View style={styles.actions}>
                <Button label="Apply this tip today" />
              </View>
            </>
          ) : null}
        </>
      ) : null}
      {topCategories.length ? (
        <Card>
          <Text size="caption" tone="secondary">
            Top categories this week
          </Text>
          <View style={styles.rankingRows}>
            {topCategories.map((item, index) => (
              <View key={`${item.category}-${index + 1}`} style={styles.rankingRow}>
                <Text>
                  {index + 1}. {item.category}
                </Text>
                <Text weight="700">Rs {item.amount.toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>
        </Card>
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
  },
  rankingRows: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm
  },
  rankingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
