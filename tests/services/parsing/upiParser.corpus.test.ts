import { parseUpiNotification } from '../../../src/services/parsing/upiParser';
import { REVIEW_QUEUE_CONFIDENCE_THRESHOLD } from '../../../src/services/ingest/payloadMapper';
import { UPI_PARSER_CORPUS } from './upiParser.corpus';

function expectedReviewRequired(confidence: number): boolean {
  return confidence < REVIEW_QUEUE_CONFIDENCE_THRESHOLD;
}

describe('UPI parser corpus validation', () => {
  it('validates parseability across top app corpus', () => {
    for (const sample of UPI_PARSER_CORPUS) {
      const parsed = parseUpiNotification(sample.payload);
      if (!sample.expected.shouldParse) {
        expect(parsed).toBeNull();
        continue;
      }

      expect(parsed).not.toBeNull();
      expect(parsed?.sourceApp).toBe(sample.expected.sourceApp);
      expect(parsed?.amountPaise).toBe(sample.expected.amountPaise);
      expect(parsed?.direction).toBe(sample.expected.direction);
      expect(parsed?.merchantNormalized).toBe(sample.expected.merchantNormalized);
      if (parsed) {
        expect(expectedReviewRequired(parsed.confidence)).toBe(sample.expected.reviewRequired);
      }
    }
  });

  it('measures amount extraction KPI >= 95%', () => {
    const parseable = UPI_PARSER_CORPUS.filter((sample) => sample.expected.shouldParse);
    const amountMatched = parseable.filter((sample) => {
      const parsed = parseUpiNotification(sample.payload);
      return parsed?.amountPaise === sample.expected.amountPaise;
    });
    const mismatches = parseable
      .map((sample) => ({
        id: sample.id,
        actual: parseUpiNotification(sample.payload)?.amountPaise,
        expected: sample.expected.amountPaise
      }))
      .filter((item) => item.actual !== item.expected);

    const extractionRate = amountMatched.length / parseable.length;
    expect(mismatches).toEqual([]);
    expect(extractionRate).toBeGreaterThanOrEqual(0.95);
  });
});
