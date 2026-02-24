import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Chip, Text } from '../components';
import { theme } from '../theme';
import { fetchTransactionsPage, TransactionListItem } from '../services/transactions/api';

function formatAmount(value: number, direction: TransactionListItem['direction']): string {
  const prefix = direction === 'debit' ? '-' : '+';
  return `${prefix}Rs ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatTxnDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function sourceAppLabel(sourceApp: TransactionListItem['sourceApp']): string {
  if (sourceApp === 'gpay') {
    return 'GPay';
  }
  if (sourceApp === 'phonepe') {
    return 'PhonePe';
  }
  if (sourceApp === 'paytm') {
    return 'Paytm';
  }
  if (sourceApp === 'bhim') {
    return 'BHIM';
  }
  return 'Other';
}

export function TransactionsScreen() {
  const [items, setItems] = useState<TransactionListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const filters = useMemo(() => {
    const categories = new Set(items.map((item) => item.category).filter(Boolean));
    if (selectedCategory !== 'All') {
      categories.add(selectedCategory);
    }

    return ['All', ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [items, selectedCategory]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetchTransactionsPage({
        limit: 30,
        category: selectedCategory === 'All' ? undefined : selectedCategory
      });
      setItems(response.items);
      setNextCursor(response.nextCursor);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load transactions.';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) {
      return;
    }
    setLoadingMore(true);
    setLoadError(null);
    try {
      const response = await fetchTransactionsPage({
        cursor: nextCursor,
        limit: 30,
        category: selectedCategory === 'All' ? undefined : selectedCategory
      });
      setItems((prev) => [...prev, ...response.items]);
      setNextCursor(response.nextCursor);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load more transactions.';
      setLoadError(message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, nextCursor, selectedCategory]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Transactions
      </Text>
      <View style={styles.filters}>
        {filters.map((filter) => (
          <Chip
            key={filter}
            label={filter}
            active={selectedCategory === filter}
            onPress={() => setSelectedCategory(filter)}
          />
        ))}
      </View>
      {loading ? <Text tone="secondary">Loading transactions...</Text> : null}
      {loadError ? (
        <Card>
          <Text tone="secondary">{loadError}</Text>
          <View style={styles.actions}>
            <Button label="Retry" onPress={() => void refresh()} />
          </View>
        </Card>
      ) : null}
      {!loading && !loadError && items.length === 0 ? (
        <Card>
          <Text weight="700">No transactions yet</Text>
          <Text tone="secondary">New payments will appear here once notification capture starts.</Text>
        </Card>
      ) : null}
      <View style={styles.list}>
        {items.map((txn) => (
          <Card key={txn.id}>
            <View style={styles.row}>
              <View style={styles.rowMeta}>
                <Text weight="700">{txn.merchant}</Text>
                <Text size="caption" tone="secondary">
                  {txn.category} • {sourceAppLabel(txn.sourceApp)}
                </Text>
                <Text size="caption" tone="muted">
                  {formatTxnDate(txn.txnAtISO)}
                </Text>
              </View>
              <Text tone={txn.direction === 'debit' ? 'primary' : 'positive'} weight="700">
                {formatAmount(txn.amount, txn.direction)}
              </Text>
            </View>
          </Card>
        ))}
      </View>
      {nextCursor ? (
        <View style={styles.actions}>
          <Button
            label={loadingMore ? 'Loading...' : 'Load more'}
            variant="outline"
            onPress={loadingMore ? undefined : () => void loadMore()}
          />
        </View>
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
  list: {
    gap: theme.spacing.md
  },
  rowMeta: {
    flexShrink: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actions: {
    marginTop: theme.spacing.sm
  }
});
