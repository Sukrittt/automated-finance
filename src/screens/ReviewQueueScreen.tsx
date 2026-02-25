import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Chip, Input, Sheet, Text } from '../components';
import { theme } from '../theme';
import { triggerSuccessHaptic, triggerWarningHaptic } from '../services/feedback/playful';
import { mockReviewQueue } from '../data/mock';
import {
  acceptReviewItem,
  editReviewItem,
  fetchReviewQueue,
  ReviewQueueItem
} from '../services/reviewQueue/api';

function formatAmount(value: number): string {
  return `Rs ${value.toLocaleString('en-IN')}`;
}

const QUICK_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Others'];

function formatDate(iso: string | undefined): string | null {
  if (!iso) {
    return null;
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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

export function ReviewQueueScreen() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastUpdatedISO, setLastUpdatedISO] = useState<string | null>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [activeId, items]
  );

  const loadReviewQueue = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await fetchReviewQueue();
      setItems(data);
      setPreviewMode(false);
      setLastUpdatedISO(new Date().toISOString());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load review queue.';
      setLoadError(message);
      setItems(mockReviewQueue);
      setPreviewMode(true);
      setLastUpdatedISO(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  const lastUpdatedLabel = formatLastUpdated(lastUpdatedISO);

  useEffect(() => {
    void loadReviewQueue();
  }, [loadReviewQueue]);

  const openEditSheet = useCallback((item: ReviewQueueItem) => {
    setActiveId(item.id);
    setCategoryDraft(item.suggestedCategory);
    setNoteDraft('');
    setSubmitError(null);
    setStatusMessage(null);
  }, []);

  const closeEditSheet = useCallback(() => {
    if (submittingId) {
      return;
    }
    setActiveId(null);
    setSubmitError(null);
  }, [submittingId]);

  const removeProcessedItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const onAccept = useCallback(
    async (id: string) => {
      setSubmittingId(id);
      setSubmitError(null);
      try {
        await acceptReviewItem(id);
        removeProcessedItem(id);
        setStatusMessage('Nice catch. Transaction confirmed.');
        triggerSuccessHaptic();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to confirm transaction.';
        setSubmitError(message);
        triggerWarningHaptic();
      } finally {
        setSubmittingId(null);
      }
    },
    [removeProcessedItem]
  );

  const onSaveEdit = useCallback(async () => {
    if (!activeItem) {
      return;
    }

    const category = categoryDraft.trim();
    if (!category) {
      setSubmitError('Category is required.');
      return;
    }

    setSubmittingId(activeItem.id);
    setSubmitError(null);
    try {
      await editReviewItem(activeItem.id, {
        category,
        merchantRaw: activeItem.rawMerchant,
        note: noteDraft.trim() || undefined
      });
      removeProcessedItem(activeItem.id);
      setActiveId(null);
      setStatusMessage('Great fix. Future matches will improve from this edit.');
      triggerSuccessHaptic();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit correction.';
      setSubmitError(message);
      triggerWarningHaptic();
    } finally {
      setSubmittingId(null);
    }
  }, [activeItem, categoryDraft, noteDraft, removeProcessedItem]);

  return (
    <View style={styles.container}>
      <Text size="h1" weight="700">
        Review Queue
      </Text>
      <Text tone="secondary">Low-confidence transactions need your confirmation.</Text>
      {statusMessage ? <Text tone="positive">{statusMessage}</Text> : null}
      {loading ? <Text tone="secondary">Loading review queue...</Text> : null}
      {!loading && lastUpdatedLabel ? (
        <Text size="caption" tone="secondary">
          Last updated: {lastUpdatedLabel}
        </Text>
      ) : null}
      {loadError && !previewMode ? (
        <Card>
          <Text tone="secondary">{loadError}</Text>
          <View style={styles.actions}>
            <Button label="Retry live data" onPress={() => void loadReviewQueue()} />
          </View>
        </Card>
      ) : null}
      {loadError && previewMode ? (
        <Card>
          <Text weight="700">Preview mode</Text>
          <Text size="caption" tone="secondary">
            Live review queue is unavailable, so demo review items are shown.
          </Text>
          <View style={styles.actions}>
            <Button label="Retry live data" variant="outline" onPress={() => void loadReviewQueue()} />
          </View>
        </Card>
      ) : null}
      {!loading && !loadError && items.length === 0 ? (
        <Card>
          <Text weight="700">All clear</Text>
          <Text tone="secondary">No pending items in your review queue.</Text>
        </Card>
      ) : null}
      <View style={styles.list}>
        {items.map((item) => {
          const isSubmitting = submittingId === item.id;
          const parsedDate = formatDate(item.parsedDateISO);

          return (
            <Card key={item.id}>
              <Text weight="700">{item.rawMerchant}</Text>
              <Text size="caption" tone="secondary">
                Amount: {formatAmount(item.extractedAmount)}
              </Text>
              {parsedDate ? (
                <Text size="caption" tone="secondary">
                  Date: {parsedDate}
                </Text>
              ) : null}
              <Text size="caption" tone="secondary">
                Suggested: {item.suggestedCategory} • Confidence {Math.round(item.confidence * 100)}%
              </Text>
              <View style={styles.actions}>
                <Button
                  label={isSubmitting ? 'Saving...' : 'Accept'}
                  variant="outline"
                  onPress={isSubmitting ? undefined : () => void onAccept(item.id)}
                />
                <Button
                  label="Edit"
                  onPress={isSubmitting ? undefined : () => openEditSheet(item)}
                />
              </View>
            </Card>
          );
        })}
      </View>
      <Sheet visible={!!activeItem} onClose={closeEditSheet}>
        <Text size="h2" weight="700">
          Edit Category
        </Text>
        <Text tone="secondary">Submit correction to update categorization.</Text>
        <View style={styles.sheetBody}>
          <Input
            value={categoryDraft}
            onChangeText={setCategoryDraft}
            placeholder="Category (e.g. Food)"
            autoCapitalize="words"
          />
          <View style={styles.quickCategoryChips}>
            {QUICK_CATEGORIES.map((category) => (
              <Chip
                key={category}
                label={category}
                active={categoryDraft.trim().toLowerCase() === category.toLowerCase()}
                onPress={() => setCategoryDraft(category)}
              />
            ))}
          </View>
          <Input
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="Optional note"
          />
          {submitError ? <Text tone="secondary">{submitError}</Text> : null}
          <View style={styles.actions}>
            <Button label="Cancel" variant="outline" onPress={closeEditSheet} />
            <Button
              label={submittingId === activeItem?.id ? 'Saving...' : 'Save'}
              onPress={submittingId === activeItem?.id ? undefined : () => void onSaveEdit()}
            />
          </View>
        </View>
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
  },
  sheetBody: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md
  },
  quickCategoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  }
});
