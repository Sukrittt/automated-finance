import { apiRequest } from '../api/client';
import { DashboardSummaryVM, TimeRange } from '../../types/view-models';

type DashboardSummaryResponse = {
  total_spend_paise: number;
  transaction_count: number;
  top_category: string;
  trend_delta_pct: number;
  time_range: {
    from: string;
    to: string;
  };
  daily_spend: Array<{
    date: string;
    amount_paise: number;
  }>;
  category_split: Array<{
    category: string;
    amount_paise: number;
    share_pct: number;
  }>;
  savings_rate_pct?: number;
  top_merchant?: string;
  insights_badge?: string;
};

export type DashboardSummaryContract = {
  summary: DashboardSummaryVM['required'] & DashboardSummaryVM['optional'];
  fromISO: string;
  toISO: string;
  dailySpend: Array<{
    dateISO: string;
    amount: number;
  }>;
  categorySplit: Array<{
    category: string;
    amount: number;
    sharePct: number;
  }>;
};

function toDateOnlyISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekStartMonday(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const dayOfWeek = normalized.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  normalized.setDate(normalized.getDate() + mondayOffset);
  return normalized;
}

export function getSummaryDateRange(
  timeRange: TimeRange,
  now: Date = new Date()
): { fromISO: string; toISO: string } {
  const to = new Date(now);
  to.setHours(0, 0, 0, 0);
  let from: Date;

  switch (timeRange) {
    case 'day':
      from = new Date(to);
      break;
    case 'week':
      from = getWeekStartMonday(to);
      break;
    case 'month':
      from = new Date(to.getFullYear(), to.getMonth(), 1);
      break;
    default:
      from = new Date(to);
      break;
  }

  return {
    fromISO: toDateOnlyISO(from),
    toISO: toDateOnlyISO(to)
  };
}

export async function fetchDashboardSummary(timeRange: TimeRange): Promise<DashboardSummaryContract> {
  const { fromISO, toISO } = getSummaryDateRange(timeRange);
  const response = await apiRequest<DashboardSummaryResponse>('/v1/dashboard/summary', {
    method: 'GET',
    query: {
      from: fromISO,
      to: toISO
    }
  });

  return {
    summary: {
      totalSpend: response.total_spend_paise / 100,
      transactionCount: response.transaction_count,
      topCategory: response.top_category,
      trendDeltaPct: response.trend_delta_pct,
      timeRange,
      savingsRatePct: response.savings_rate_pct,
      topMerchant: response.top_merchant,
      insightsBadge: response.insights_badge
    },
    fromISO: response.time_range.from,
    toISO: response.time_range.to,
    dailySpend: response.daily_spend.map((day) => ({
      dateISO: day.date,
      amount: day.amount_paise / 100
    })),
    categorySplit: response.category_split.map((slice) => ({
      category: slice.category,
      amount: slice.amount_paise / 100,
      sharePct: slice.share_pct
    }))
  };
}
