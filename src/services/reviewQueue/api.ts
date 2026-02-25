import { apiRequest } from '../api/client';
import { recordCategoryFeedback } from '../categorization/categoryRules';
import { ReviewQueueItemVM } from '../../types/view-models';

type TransactionRecord = {
  id: string;
  merchant: string;
  amount_paise: number;
  category: string;
  txn_at: string;
  confidence?: number;
};

type TransactionListResponse = {
  items: TransactionRecord[];
  next_cursor?: string;
};

type UpdateTransactionRequest = {
  category?: string;
  merchant_normalized?: string;
  txn_at?: string;
  note?: string;
  review_status: 'confirmed' | 'edited';
};

export type ReviewQueueItem = ReviewQueueItemVM['required'] & ReviewQueueItemVM['optional'];

function toReviewQueueItem(item: TransactionRecord): ReviewQueueItem {
  return {
    id: item.id,
    rawMerchant: item.merchant,
    extractedAmount: Math.round(item.amount_paise / 100),
    suggestedCategory: item.category || 'Uncategorized',
    confidence: item.confidence ?? 0,
    parsedDateISO: item.txn_at
  };
}

export async function fetchReviewQueue(limit = 30): Promise<ReviewQueueItem[]> {
  const response = await apiRequest<TransactionListResponse>('/v1/transactions', {
    method: 'GET',
    query: {
      review_status: 'pending',
      limit
    }
  });

  return response.items.map(toReviewQueueItem);
}

export async function acceptReviewItem(id: string): Promise<void> {
  const payload: UpdateTransactionRequest = {
    review_status: 'confirmed',
    note: 'Confirmed from review queue'
  };

  await apiRequest(`/v1/transactions/${id}`, {
    method: 'PATCH',
    body: payload
  });
}

type EditReviewPayload = {
  category: string;
  merchantRaw?: string;
  merchantNormalized?: string;
  txnAtISO?: string;
  note?: string;
};

export async function editReviewItem(id: string, data: EditReviewPayload): Promise<void> {
  const payload: UpdateTransactionRequest = {
    category: data.category,
    merchant_normalized: data.merchantNormalized,
    txn_at: data.txnAtISO,
    note: data.note ?? 'Edited from review queue',
    review_status: 'edited'
  };

  await apiRequest(`/v1/transactions/${id}`, {
    method: 'PATCH',
    body: payload
  });

  await recordCategoryFeedback({
    merchantRaw: data.merchantRaw,
    merchantNormalized: data.merchantNormalized,
    correctedCategory: data.category
  });
}
