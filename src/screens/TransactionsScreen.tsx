import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Chip, Text } from '../components';
import { theme } from '../theme';
import { mockTransactions } from '../data/mock';

const filters = ['All', 'Food', 'Shopping', 'Income'];

export function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Transactions
      </Text>
      <View style={styles.filters}>
        {filters.map((filter, idx) => (
          <Chip key={filter} label={filter} active={idx === 0} />
        ))}
      </View>
      <View style={styles.list}>
        {mockTransactions.map((txn) => (
          <Card key={txn.id}>
            <View style={styles.row}>
              <View>
                <Text weight="700">{txn.merchant}</Text>
                <Text size="caption" tone="secondary">
                  {txn.category} • {txn.sourceApp.toUpperCase()}
                </Text>
              </View>
              <Text tone={txn.direction === 'debit' ? 'primary' : 'positive'} weight="700">
                {txn.direction === 'debit' ? '-' : '+'}Rs {txn.amount}
              </Text>
            </View>
          </Card>
        ))}
      </View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
