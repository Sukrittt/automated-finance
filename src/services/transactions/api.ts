import { apiRequest } from '../api/client';
import { TransactionListItemVM } from '../../types/view-models';

type TransactionRecord = {
  id: string;
  merchant: string;
  amount_paise: number;
  direction: 'debit' | 'credit';
  category: string;
  txn_at: string;
  source_app?: string;
  confidence?: number;
  note?: string;
  upi_ref?: string;
  review_status?: 'pending' | 'confirmed' | 'edited';
};

type TransactionListResponse = {
  items: TransactionRecord[];
  next_cursor?: string;
};

export type ReviewStatusFilter = 'pending' | 'confirmed' | 'edited';

export type TransactionListItem =
  TransactionListItemVM['required'] & TransactionListItemVM['optional'];

export type FetchTransactionsParams = {
  cursor?: string;
  limit?: number;
  reviewStatus?: ReviewStatusFilter;
  category?: string;
};

export type TransactionPage = {
  items: TransactionListItem[];
  nextCursor?: string;
};

function toSourceApp(value: string | undefined): TransactionListItemVM['required']['sourceApp'] {
  if (value === 'gpay' || value === 'phonepe' || value === 'paytm' || value === 'bhim') {
    return value;
  }

  return 'other';
}

function toTransactionListItem(item: TransactionRecord): TransactionListItem {
  return {
    id: item.id,
    merchant: item.merchant,
    amount: item.amount_paise / 100,
    direction: item.direction,
    category: item.category,
    txnAtISO: item.txn_at,
    sourceApp: toSourceApp(item.source_app),
    confidence: item.confidence,
    note: item.note,
    upiRef: item.upi_ref
  };
}

export async function fetchTransactionsPage(
  params: FetchTransactionsParams = {}
): Promise<TransactionPage> {
  const response = await apiRequest<TransactionListResponse>('/v1/transactions', {
    method: 'GET',
    query: {
      cursor: params.cursor,
      limit: params.limit ?? 30,
      review_status: params.reviewStatus,
      category: params.category
    }
  });

  return {
    items: response.items.map(toTransactionListItem),
    nextCursor: response.next_cursor
  };
}
