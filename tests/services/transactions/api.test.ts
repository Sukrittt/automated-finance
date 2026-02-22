import { fetchTransactionsPage } from '../../../src/services/transactions/api';

function mockJsonResponse(payload: unknown) {
  return {
    ok: true,
    headers: {
      get: () => 'application/json'
    },
    json: async () => payload
  };
}

describe('transactions api', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('maps paginated transactions and forwards filters', async () => {
    fetchMock.mockResolvedValue(
      mockJsonResponse({
        items: [
          {
            id: 'txn_1',
            merchant: 'Swiggy',
            amount_paise: 45900,
            direction: 'debit',
            category: 'Food',
            txn_at: '2026-02-22T09:59:12Z',
            source_app: 'phonepe',
            confidence: 0.91,
            upi_ref: '12345'
          },
          {
            id: 'txn_2',
            merchant: 'Salary',
            amount_paise: 1000000,
            direction: 'credit',
            category: 'Income',
            txn_at: '2026-02-21T00:00:00Z',
            source_app: 'unknown-provider'
          }
        ],
        next_cursor: 'cursor-2'
      })
    );

    const response = await fetchTransactionsPage({
      cursor: 'cursor-1',
      limit: 15,
      reviewStatus: 'pending',
      category: 'Food'
    });

    expect(response.nextCursor).toBe('cursor-2');
    expect(response.items).toEqual([
      {
        id: 'txn_1',
        merchant: 'Swiggy',
        amount: 459,
        direction: 'debit',
        category: 'Food',
        txnAtISO: '2026-02-22T09:59:12Z',
        sourceApp: 'phonepe',
        confidence: 0.91,
        upiRef: '12345',
        note: undefined
      },
      {
        id: 'txn_2',
        merchant: 'Salary',
        amount: 10000,
        direction: 'credit',
        category: 'Income',
        txnAtISO: '2026-02-21T00:00:00Z',
        sourceApp: 'other',
        confidence: undefined,
        upiRef: undefined,
        note: undefined
      }
    ]);

    const calledUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(calledUrl.pathname).toBe('/v1/transactions');
    expect(calledUrl.searchParams.get('cursor')).toBe('cursor-1');
    expect(calledUrl.searchParams.get('limit')).toBe('15');
    expect(calledUrl.searchParams.get('review_status')).toBe('pending');
    expect(calledUrl.searchParams.get('category')).toBe('Food');
  });
});
