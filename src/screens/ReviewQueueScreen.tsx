import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Sheet, Text } from '../components';
import { theme } from '../theme';
import { mockReviewQueue } from '../data/mock';

export function ReviewQueueScreen() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Review Queue
      </Text>
      <Text tone="secondary">Low-confidence transactions need your confirmation.</Text>
      <View style={styles.list}>
        {mockReviewQueue.map((item) => (
          <Card key={item.id}>
            <Text weight="700">{item.rawMerchant}</Text>
            <Text size="caption" tone="secondary">
              Suggested: {item.suggestedCategory} • Confidence {Math.round(item.confidence * 100)}%
            </Text>
            <View style={styles.actions}>
              <Button label="Accept" variant="outline" />
              <Button label="Edit" onPress={() => setActiveId(item.id)} />
            </View>
          </Card>
        ))}
      </View>
      <Sheet visible={!!activeId} onClose={() => setActiveId(null)}>
        <Text size="h2" weight="700">
          Edit Category
        </Text>
        <Text tone="secondary">Category editing flow will be wired to backend API in Milestone M2.</Text>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xxl
  },
  list: {
    gap: theme.spacing.md
  },
  actions: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm
  }
});
