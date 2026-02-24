export type TimeRange = 'week' | 'month' | 'quarter';

export interface DashboardSummaryVM {
  required: {
    totalSpend: number;
    transactionCount: number;
    topCategory: string;
    trendDeltaPct: number;
    timeRange: TimeRange;
  };
  optional: {
    savingsRatePct?: number;
    topMerchant?: string;
    insightsBadge?: string;
  };
  emptyState: {
    title: string;
    subtitle: string;
    actionLabel: string;
  };
}

export interface TransactionListItemVM {
  required: {
    id: string;
    merchant: string;
    amount: number;
    direction: 'debit' | 'credit';
    category: string;
    txnAtISO: string;
    sourceApp: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'other';
  };
  optional: {
    confidence?: number;
    note?: string;
    upiRef?: string;
  };
  emptyState: {
    title: string;
    subtitle: string;
  };
}

export interface ReviewQueueItemVM {
  required: {
    id: string;
    rawMerchant: string;
    extractedAmount: number;
    suggestedCategory: string;
    confidence: number;
  };
  optional: {
    parsedDateISO?: string;
    sourceTextPreview?: string;
  };
  emptyState: {
    title: string;
    subtitle: string;
  };
}

export interface WeeklyInsightVM {
  required: {
    weekStartISO: string;
    summary: string;
    topLeak: string;
    improvementTip: string;
  };
  optional: {
    projectedMonthlyOverrun?: number;
    winHighlight?: string;
  };
  emptyState: {
    title: string;
    subtitle: string;
    actionLabel?: string;
  };
}
