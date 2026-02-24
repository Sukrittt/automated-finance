import {
  DEFAULT_QUALITY_GATE_THRESHOLDS,
  evaluateQualityGate
} from '../../../src/services/qualityGate/evaluator';

describe('evaluateQualityGate', () => {
  it('returns GO when all KPI and issue thresholds pass', () => {
    const result = evaluateQualityGate({
      parserExtractionPct: 100,
      categoryPrecisionPct: 100,
      authFunnelValidated: true,
      summaryReconciliationValidated: true,
      insightExplainabilityValidated: true,
      openP0Issues: 0,
      openP1Issues: 1
    });

    expect(result.decision).toBe('GO');
    expect(result.failures).toEqual([]);
    expect(result.thresholds).toEqual(DEFAULT_QUALITY_GATE_THRESHOLDS);
  });

  it('returns NO_GO when parser KPI misses threshold', () => {
    const result = evaluateQualityGate({
      parserExtractionPct: 94.9,
      categoryPrecisionPct: 95,
      authFunnelValidated: true,
      summaryReconciliationValidated: true,
      insightExplainabilityValidated: true,
      openP0Issues: 0,
      openP1Issues: 0
    });

    expect(result.decision).toBe('NO_GO');
    expect(result.failures).toEqual([
      expect.objectContaining({
        key: 'parser_extraction',
        severity: 'P0'
      })
    ]);
  });

  it('returns NO_GO with multiple failures when issue thresholds and checks fail', () => {
    const result = evaluateQualityGate(
      {
        parserExtractionPct: 100,
        categoryPrecisionPct: 89.9,
        authFunnelValidated: false,
        summaryReconciliationValidated: false,
        insightExplainabilityValidated: false,
        openP0Issues: 1,
        openP1Issues: 4
      },
      {
        maxOpenP1Issues: 2
      }
    );

    expect(result.decision).toBe('NO_GO');
    expect(result.failures.map((failure) => failure.key)).toEqual([
      'category_precision',
      'auth_funnel',
      'summary_reconciliation',
      'insight_explainability',
      'open_p0_issues',
      'open_p1_issues'
    ]);
  });
});
