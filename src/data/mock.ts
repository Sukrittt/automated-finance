import { ReviewQueueItemVM, TransactionListItemVM, WeeklyInsightVM } from '../types/view-models';

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
