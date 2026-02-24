import { fetchWeeklyInsight } from '../../../src/services/insights/api';

function mockJsonResponse(payload: unknown) {
  return {
    ok: true,
    headers: {
      get: () => 'application/json'
    },
    json: async () => payload
  };
}

describe('insights api', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('maps ready insight response into client contract', async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({
        week_start: '2026-02-16',
        status: 'ready',
        generated_at: '2026-02-24T10:00:00.000Z',
        insight: {
          summary: 'Spend up 20%',
          top_leak: 'Food',
          improvement_tip: 'Reduce dine out',
          projected_monthly_overrun_paise: 120000,
          win_highlight: 'Great recovery'
        }
      })
    );

    const result = await fetchWeeklyInsight('2026-02-16');

    expect(result).toEqual({
      status: 'ready',
      weekStartISO: '2026-02-16',
      generatedAtISO: '2026-02-24T10:00:00.000Z',
      insight: {
        weekStartISO: '2026-02-16',
        summary: 'Spend up 20%',
        topLeak: 'Food',
        improvementTip: 'Reduce dine out',
        projectedMonthlyOverrun: 120000,
        winHighlight: 'Great recovery'
      }
    });

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/v1/insights/weekly');
    expect(calledUrl.searchParams.get('week_start')).toBe('2026-02-16');
  });

  it('maps pending and failed statuses', async () => {
    fetchMock
      .mockResolvedValueOnce(
        mockJsonResponse({
          week_start: '2026-02-16',
          status: 'pending',
          eta_seconds: 12
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          week_start: '2026-02-16',
          status: 'failed'
        })
      );

    const pending = await fetchWeeklyInsight('2026-02-16');
    const failed = await fetchWeeklyInsight('2026-02-16');

    expect(pending).toEqual({
      status: 'pending',
      weekStartISO: '2026-02-16',
      etaSeconds: 12
    });
    expect(failed).toEqual({
      status: 'failed',
      weekStartISO: '2026-02-16'
    });
  });
});
