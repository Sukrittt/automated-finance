import {
  fetchDashboardSummary,
  getSummaryDateRange
} from '../../../src/services/dashboard/api';

function mockJsonResponse(payload: unknown) {
  return {
    ok: true,
    headers: {
      get: () => 'application/json'
    },
    json: async () => payload
  };
}

describe('dashboard api', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('computes stable date ranges for each time range', () => {
    const now = new Date('2026-02-22T12:00:00.000Z');

    expect(getSummaryDateRange('day', now)).toEqual({
      fromISO: '2026-02-22',
      toISO: '2026-02-22'
    });
    expect(getSummaryDateRange('week', now)).toEqual({
      fromISO: '2026-02-16',
      toISO: '2026-02-22'
    });
    expect(getSummaryDateRange('month', now)).toEqual({
      fromISO: '2026-02-01',
      toISO: '2026-02-22'
    });
  });

  it('requests dashboard summary and maps response into view-model contract', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-22T12:00:00.000Z'));
    fetchMock.mockResolvedValue(
      mockJsonResponse({
        total_spend_paise: 1465500,
        transaction_count: 128,
        top_category: 'food',
        trend_delta_pct: 12.4,
        time_range: {
          from: '2026-02-16',
          to: '2026-02-22'
        },
        daily_spend: [{ date: '2026-02-20', amount_paise: 45500 }],
        category_split: [{ category: 'food', amount_paise: 435000, share_pct: 29.68 }],
        insights_badge: 'Trending up'
      })
    );

    const response = await fetchDashboardSummary('week');

    expect(response).toEqual({
      summary: {
        totalSpend: 14655,
        transactionCount: 128,
        topCategory: 'food',
        trendDeltaPct: 12.4,
        timeRange: 'week',
        savingsRatePct: undefined,
        topMerchant: undefined,
        insightsBadge: 'Trending up'
      },
      fromISO: '2026-02-16',
      toISO: '2026-02-22',
      dailySpend: [{ dateISO: '2026-02-20', amount: 455 }],
      categorySplit: [{ category: 'food', amount: 4350, sharePct: 29.68 }]
    });

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/v1/dashboard/summary');
    expect(calledUrl.searchParams.get('from')).toBe('2026-02-16');
    expect(calledUrl.searchParams.get('to')).toBe('2026-02-22');
  });
});
