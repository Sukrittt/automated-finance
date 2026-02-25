import { ReviewQueueItemVM, TransactionListItemVM, WeeklyInsightVM } from '../types/view-models';
import { TimeRange } from '../types/view-models';
import type { DashboardSummaryContract } from '../services/dashboard/api';

export const mockTransactions: TransactionListItemVM['required'][] = [
  {
    id: 'txn_1',
    merchant: 'Amazon Pay',
    amount: 1249,
    direction: 'debit',
    category: 'Shopping',
    txnAtISO: '2026-02-20T17:42:00.000Z',
    sourceApp: 'gpay'
  },
  {
    id: 'txn_2',
    merchant: 'Swiggy',
    amount: 389,
    direction: 'debit',
    category: 'Food',
    txnAtISO: '2026-02-20T13:11:00.000Z',
    sourceApp: 'phonepe'
  },
  {
    id: 'txn_3',
    merchant: 'Freelance Payout',
    amount: 8200,
    direction: 'credit',
    category: 'Income',
    txnAtISO: '2026-02-19T09:00:00.000Z',
    sourceApp: 'paytm'
  }
];

export const mockReviewQueue: ReviewQueueItemVM['required'][] = [
  {
    id: 'rq_1',
    rawMerchant: 'AMZN Seller Services',
    extractedAmount: 799,
    suggestedCategory: 'Shopping',
    confidence: 0.62
  },
  {
    id: 'rq_2',
    rawMerchant: 'Razorpay*Cafe',
    extractedAmount: 245,
    suggestedCategory: 'Food',
    confidence: 0.58
  }
];

export const mockInsights: WeeklyInsightVM['required'] = {
  weekStartISO: '2026-02-16',
  summary: 'You spent 18% more this week, led by food delivery and impulse shopping.',
  topLeak: 'Late-night food orders after 10 PM',
  improvementTip: 'Set a soft cap of Rs 1,500 for food delivery next week.'
};

export const mockTrend = [320, 440, 510, 390, 620, 580, 470];
export const mockDonut = [
  { label: 'Shopping', value: 38 },
  { label: 'Food', value: 29 },
  { label: 'Transport', value: 19 },
  { label: 'Other', value: 14 }
];

const mockSummaryByRange: Record<
  TimeRange,
  {
    totalSpend: number;
    transactionCount: number;
    trendDeltaPct: number;
    insightsBadge: string;
  }
> = {
  day: {
    totalSpend: 1980,
    transactionCount: 4,
    trendDeltaPct: -8.4,
    insightsBadge: 'Lighter than yesterday'
  },
  week: {
    totalSpend: 12340,
    transactionCount: 26,
    trendDeltaPct: 5.9,
    insightsBadge: 'Steady week with food-led spend'
  },
  month: {
    totalSpend: 48220,
    transactionCount: 108,
    trendDeltaPct: 11.2,
    insightsBadge: 'Monthly spend trending up'
  }
};

function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateRange(timeRange: TimeRange, now: Date): { fromISO: string; toISO: string } {
  const to = new Date(now);
  to.setHours(0, 0, 0, 0);
  const from = new Date(to);

  if (timeRange === 'day') {
    return { fromISO: toDateOnlyISO(from), toISO: toDateOnlyISO(to) };
  }

  if (timeRange === 'week') {
    const dayOfWeek = to.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    from.setDate(to.getDate() + mondayOffset);
    return { fromISO: toDateOnlyISO(from), toISO: toDateOnlyISO(to) };
  }

  from.setDate(1);
  return { fromISO: toDateOnlyISO(from), toISO: toDateOnlyISO(to) };
}

export function getMockDashboardSummary(timeRange: TimeRange): DashboardSummaryContract {
  const now = new Date();
  const { fromISO, toISO } = getDateRange(timeRange, now);
  const summary = mockSummaryByRange[timeRange];

  const categorySplit = [
    { category: 'Food', amount: Math.round(summary.totalSpend * 0.34), sharePct: 34 },
    { category: 'Shopping', amount: Math.round(summary.totalSpend * 0.26), sharePct: 26 },
    { category: 'Transport', amount: Math.round(summary.totalSpend * 0.18), sharePct: 18 },
    { category: 'Bills', amount: Math.round(summary.totalSpend * 0.14), sharePct: 14 },
    { category: 'Others', amount: Math.round(summary.totalSpend * 0.08), sharePct: 8 }
  ];

  const dailySpend = mockTrend.map((amount, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (mockTrend.length - 1 - index));
    return {
      dateISO: toDateOnlyISO(date),
      amount
    };
  });

  return {
    summary: {
      totalSpend: summary.totalSpend,
      transactionCount: summary.transactionCount,
      topCategory: 'Food',
      trendDeltaPct: summary.trendDeltaPct,
      timeRange,
      insightsBadge: summary.insightsBadge
    },
    fromISO,
    toISO,
    dailySpend,
    categorySplit
  };
}
