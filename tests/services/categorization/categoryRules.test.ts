import {
  __resetCategoryFeedbackForTests,
  recordCategoryFeedback,
  suggestCategoryFromParsedTransaction
} from '../../../src/services/categorization/categoryRules';

describe('categoryRules', () => {
  beforeEach(() => {
    __resetCategoryFeedbackForTests();
  });

  it('maps known merchant keywords with high confidence', () => {
    const result = suggestCategoryFromParsedTransaction({
      direction: 'debit',
      merchantRaw: 'Swiggy Instamart',
      merchantNormalized: 'swiggy instamart',
      sourceApp: 'gpay'
    });

    expect(result.category).toBe('Food');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.source).toBe('rule');
  });

  it('maintains baseline category precision at or above 90%', () => {
    const samples = [
      { merchant: 'Swiggy Instamart', expected: 'Food' },
      { merchant: 'Zomato Order', expected: 'Food' },
      { merchant: 'Uber Trip', expected: 'Transport' },
      { merchant: 'Ola Cabs', expected: 'Transport' },
      { merchant: 'Amazon Pay', expected: 'Shopping' },
      { merchant: 'Flipkart Online', expected: 'Shopping' },
      { merchant: 'Airtel Recharge', expected: 'Bills' },
      { merchant: 'BSES Electricity Bill', expected: 'Bills' },
      { merchant: 'Netflix India', expected: 'Entertainment' },
      { merchant: 'BookMyShow Tickets', expected: 'Entertainment' }
    ] as const;

    const matched = samples.filter((sample) => {
      const prediction = suggestCategoryFromParsedTransaction({
        direction: 'debit',
        merchantRaw: sample.merchant,
        merchantNormalized: sample.merchant.toLowerCase(),
        sourceApp: 'gpay'
      });

      return prediction.category === sample.expected;
    }).length;

    const precision = matched / samples.length;
    expect(precision).toBeGreaterThanOrEqual(0.9);
  });

  it('maps credits to Income by default', () => {
    const result = suggestCategoryFromParsedTransaction({
      direction: 'credit',
      merchantRaw: 'Freelance Payout',
      merchantNormalized: 'freelance payout',
      sourceApp: 'paytm'
    });

    expect(result.category).toBe('Income');
    expect(result.confidence).toBe(0.98);
    expect(result.source).toBe('credit-default');
  });

  it('uses review correction feedback on next suggestions', () => {
    const first = suggestCategoryFromParsedTransaction({
      direction: 'debit',
      merchantRaw: 'AMZN Seller Services',
      merchantNormalized: 'amzn seller services',
      sourceApp: 'phonepe'
    });
    expect(first.category).toBe('Others');

    recordCategoryFeedback({
      merchantRaw: 'AMZN Seller Services',
      correctedCategory: 'Bills'
    });

    const second = suggestCategoryFromParsedTransaction({
      direction: 'debit',
      merchantRaw: 'AMZN Seller Services',
      merchantNormalized: 'amzn seller services',
      sourceApp: 'phonepe'
    });

    expect(second.category).toBe('Bills');
    expect(second.confidence).toBeGreaterThan(first.confidence);
    expect(second.source).toBe('feedback');
  });
});
