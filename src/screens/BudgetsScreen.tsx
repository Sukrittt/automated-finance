import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Card, Input, Text } from '../components';
import { theme } from '../theme';
import { BudgetConfig, DEFAULT_CATEGORY_BUDGETS } from '../services/budget/thresholds';
import {
  loadBudgetConfigs,
  resetBudgetConfigs,
  saveBudgetConfigs
} from '../services/budget/storage';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../services/feedback/playful';

function formatMoney(value: number): string {
  return `Rs ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function toDraftMap(configs: BudgetConfig[]): Record<string, string> {
  return configs.reduce<Record<string, string>>((result, item) => {
    result[item.category] = String(item.monthlyLimit);
    return result;
  }, {});
}

function normalizeLimit(value: string): number {
  const digitsOnly = value.replace(/[^\d]/g, '');
  return Number(digitsOnly || '0');
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

export function BudgetsScreen() {
  const [configs, setConfigs] = useState<BudgetConfig[]>(DEFAULT_CATEGORY_BUDGETS);
  const [drafts, setDrafts] = useState<Record<string, string>>(() => toDraftMap(DEFAULT_CATEGORY_BUDGETS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stored = await loadBudgetConfigs();
      setConfigs(stored);
      setDrafts(toDraftMap(stored));
      setLastUpdatedISO(new Date().toISOString());
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Could not load budget limits.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBudgets();
  }, [loadBudgets]);

  const parsedDrafts = useMemo(
    () =>
      configs.map((item) => ({
        category: item.category,
        monthlyLimit: normalizeLimit(drafts[item.category] ?? '')
      })),
    [configs, drafts]
  );

  const hasInvalidInput = parsedDrafts.some((item) => item.monthlyLimit <= 0);

  const onChangeLimit = useCallback((category: string, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [category]: value
    }));
    setStatus(null);
    setError(null);
  }, []);

  const onSave = useCallback(async () => {
    if (hasInvalidInput) {
      setError('Each category needs a monthly limit greater than 0.');
      triggerWarningHaptic();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const next = await saveBudgetConfigs(parsedDrafts);
      setConfigs(next);
      setDrafts(toDraftMap(next));
      setStatus('Nice! Monthly budgets saved. Alerts now track these limits.');
      setLastUpdatedISO(new Date().toISOString());
      triggerSuccessHaptic();
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save budget limits.';
      setError(message);
      triggerWarningHaptic();
    } finally {
      setSaving(false);
    }
  }, [hasInvalidInput, parsedDrafts]);

  const onResetDefaults = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const defaults = await resetBudgetConfigs();
      setConfigs(defaults);
      setDrafts(toDraftMap(defaults));
      setStatus('Back to defaults. You can tweak these anytime.');
      setLastUpdatedISO(new Date().toISOString());
      triggerSuccessHaptic();
    } catch (resetError) {
      const message = resetError instanceof Error ? resetError.message : 'Unable to reset budget defaults.';
      setError(message);
      triggerWarningHaptic();
    } finally {
      setSaving(false);
    }
  }, []);

  const lastUpdatedLabel = formatLastUpdated(lastUpdatedISO);

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Monthly Budgets
      </Text>
      <Text tone="secondary">
        Set category limits so warnings and over-budget alerts stay personal to your goals.
      </Text>
      {!loading && lastUpdatedLabel ? (
        <Text size="caption" tone="secondary">
          Last updated: {lastUpdatedLabel}
        </Text>
      ) : null}
      {loading ? (
        <Card>
          <ActivityIndicator color={theme.colors.textSecondary} />
          <Text tone="secondary" style={styles.loadingText}>
            Loading budget setup...
          </Text>
        </Card>
      ) : null}
      {!loading ? (
        <>
          {configs.map((item) => (
            <Card key={item.category}>
              <Text weight="700">{item.category}</Text>
              <Text size="caption" tone="secondary">
                Current limit: {formatMoney(item.monthlyLimit)}
              </Text>
              <Input
                value={drafts[item.category] ?? ''}
                onChangeText={(value) => onChangeLimit(item.category, value)}
                keyboardType="number-pad"
                placeholder="Monthly limit"
                accessibilityLabel={`${item.category} monthly limit`}
                style={styles.input}
              />
            </Card>
          ))}
          {status ? <Text tone="positive">{status}</Text> : null}
          {error ? <Text tone="negative">{error}</Text> : null}
          <View style={styles.actions}>
            <Button
              label={saving ? 'Saving...' : 'Save Budgets'}
              onPress={saving ? undefined : () => void onSave()}
              disabled={saving}
            />
            <Button
              label="Reset Defaults"
              variant="outline"
              onPress={saving ? undefined : () => void onResetDefaults()}
              disabled={saving}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl
  },
  loadingText: {
    marginTop: theme.spacing.sm
  },
  input: {
    marginTop: theme.spacing.sm
  },
  actions: {
    gap: theme.spacing.sm
  }
});
