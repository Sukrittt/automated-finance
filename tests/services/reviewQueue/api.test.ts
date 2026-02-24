import { editReviewItem } from '../../../src/services/reviewQueue/api';
import {
  __resetCategoryFeedbackForTests,
  suggestCategoryFromParsedTransaction
} from '../../../src/services/categorization/categoryRules';

function mockJsonResponse(payload: unknown) {
  return {
    ok: true,
    headers: {
      get: () => 'application/json'
    },
    json: async () => payload
  };
}

describe('reviewQueue api', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    __resetCategoryFeedbackForTests();
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('submits edited category and records feedback for future suggestions', async () => {
    fetchMock.mockResolvedValue(mockJsonResponse({}));

    await editReviewItem('txn_42', {
      category: 'Bills',
      merchantRaw: 'AMZN Seller Services',
      note: 'corrected from review'
    });

    const [requestUrl, requestInit] = fetchMock.mock.calls[0];
    const calledUrl = new URL(requestUrl as string);
    expect(calledUrl.pathname).toBe('/v1/transactions/txn_42');
    expect(requestInit.method).toBe('PATCH');
    expect(requestInit.body).toContain('"category":"Bills"');
    expect(requestInit.body).toContain('"review_status":"edited"');

    const suggestion = suggestCategoryFromParsedTransaction({
      direction: 'debit',
      merchantRaw: 'AMZN Seller Services',
      merchantNormalized: 'amzn seller services',
      sourceApp: 'gpay'
    });

    expect(suggestion.category).toBe('Bills');
    expect(suggestion.source).toBe('feedback');
  });
});
